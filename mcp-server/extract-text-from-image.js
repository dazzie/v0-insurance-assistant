#!/usr/bin/env node

/**
 * MCP Server: extract-text-from-image
 *
 * A reusable, stateless MCP tool for extracting text and structured data
 * from images using GPT-4o Vision with Tesseract.js fallback.
 *
 * Why MCP:
 * - Discrete capability with clear input/output
 * - Stateless - no shared context needed
 * - Reusable across multiple agents (claims, underwriting, onboarding)
 * - AI-native using multimodal LLM
 * - Composable in agent workflows: Extract → Classify → Summarize → Store
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MCP Server instance
const server = new Server(
  {
    name: 'extract-text-from-image',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Extract text and structured data from an image using GPT-4o Vision
 *
 * @param {string} filePath - Absolute path to image file
 * @param {string} extractionType - Type of extraction (general, insurance, invoice, receipt)
 * @returns {Object} Structured extraction results
 */
async function extractFromImage(filePath, extractionType = 'general') {
  try {
    // Read and encode image
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const extension = path.extname(filePath).toLowerCase();
    const mimeType = extension === '.png' ? 'image/png' : 'image/jpeg';
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    // Extraction prompts by type
    const prompts = {
      general: 'Extract all readable text and any structured data (key-value pairs, tables, fields) from this image.',

      insurance: `Extract all information from this insurance policy document.

Focus on:
- Customer Information: name, date of birth, address, city, state, ZIP, email, phone
- Policy Details: carrier, policy number, effective date, expiration date, agent name/contact
- Coverage Information: types of coverage, limits, deductibles, premiums
- Vehicle/Property Details: year, make, model, VIN, property address, etc.
- Driver Information: names, ages, relationships, license numbers
- Discounts and recommendations

Return a complete JSON object with all available fields.`,

      invoice: 'Extract invoice details including invoice number, date, vendor, items, quantities, prices, subtotal, tax, and total.',

      receipt: 'Extract receipt information including merchant name, address, date/time, items purchased, prices, payment method, and total amount.',
    };

    const prompt = prompts[extractionType] || prompts.general;

    console.error(`[MCP] Extracting ${extractionType} data from ${path.basename(filePath)}...`);

    // Call GPT-4o Vision API with structured JSON output
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a document extraction agent. Extract text and structured data from images and return ONLY valid JSON. Be thorough and precise with all details.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 2000,
    });

    const extractedData = JSON.parse(response.choices[0]?.message?.content || '{}');

    console.error(`[MCP] Extraction successful: ${Object.keys(extractedData).length} fields extracted`);

    return {
      success: true,
      data: extractedData,
      method: 'gpt-4o-vision',
      extractionType,
      filePath: path.basename(filePath),
      fieldsExtracted: Object.keys(extractedData).length,
    };
  } catch (error) {
    console.error('[MCP] Extraction error:', error.message);
    return {
      success: false,
      error: error.message,
      filePath: path.basename(filePath),
    };
  }
}

/**
 * Fallback: Tesseract.js OCR for offline capability
 * Note: Requires npm install tesseract.js
 */
async function extractWithTesseract(filePath) {
  try {
    // Tesseract.js fallback (not implemented yet)
    return {
      success: false,
      error: 'Tesseract fallback not yet implemented. Install tesseract.js to enable offline OCR.',
      filePath: path.basename(filePath),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      filePath: path.basename(filePath),
    };
  }
}

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'extract_text_from_image',
        description: 'Extract text and structured data from images (PNG, JPG) using GPT-4o Vision. Supports insurance documents, invoices, receipts, and general document extraction. Returns structured JSON with all extracted fields.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Absolute path to the image file (PNG or JPG)',
            },
            extractionType: {
              type: 'string',
              description: 'Type of extraction to perform',
              enum: ['general', 'insurance', 'invoice', 'receipt'],
              default: 'general',
            },
            useFallback: {
              type: 'boolean',
              description: 'Use Tesseract.js fallback if GPT-4o fails (offline capability)',
              default: false,
            },
          },
          required: ['filePath'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'extract_text_from_image') {
    const { filePath, extractionType = 'general', useFallback = false } = args;

    // Validate file exists
    if (!fs.existsSync(filePath)) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `File not found: ${filePath}`,
            }, null, 2),
          },
        ],
      };
    }

    // Validate file type
    const ext = path.extname(filePath).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `Unsupported file type: ${ext}. Use PNG or JPG.`,
            }, null, 2),
          },
        ],
      };
    }

    // Attempt GPT-4o extraction
    let result = await extractFromImage(filePath, extractionType);

    // Fallback to Tesseract if enabled and GPT-4o failed
    if (!result.success && useFallback) {
      console.error('[MCP] Falling back to Tesseract OCR...');
      result = await extractWithTesseract(filePath);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the MCP server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP] extract-text-from-image server running');
  console.error('[MCP] Capabilities: insurance, invoice, receipt, general extraction');
  console.error('[MCP] Model: GPT-4o Vision with structured JSON output');
}

main().catch((error) => {
  console.error('[MCP] Server error:', error);
  process.exit(1);
});
