#!/usr/bin/env node

/**
 * Vectorize MCP Server
 *
 * Provides MCP tools for querying the Vectorize.io insurance knowledge base
 * with 235+ entries covering insurance explanations, terminology, state requirements,
 * discounts, FAQs, and negotiation strategies.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PipelinesApi, Configuration } from '@vectorize-io/vectorize-client';
import dotenv from 'dotenv';
import pdf from 'pdf-parse';
import fs from 'fs/promises';

// Load environment variables
dotenv.config({ path: '../.env.local' });

// Initialize Vectorize.io API client
const config = new Configuration({
  apiKey: process.env.VECTORIZE_IO_API_KEY || process.env.TOKEN,
});

const pipelinesApi = new PipelinesApi(config);
const pipelineId = process.env.VECTORIZE_IO_PIPELINE_ID;

// Create MCP server
const server = new Server(
  {
    name: 'vectorize-insurance-kb',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_insurance_knowledge',
        description: 'Search the insurance knowledge base for information about coverage types, terminology, state requirements, discounts, FAQs, and negotiation strategies. Returns relevant information from 235+ curated insurance entries.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query (e.g., "What is comprehensive coverage?", "California auto insurance requirements", "How to negotiate lower premiums")',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 5)',
              default: 5,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_coverage_explanation',
        description: 'Get detailed explanation of a specific insurance coverage type (e.g., comprehensive, collision, liability, uninsured motorist)',
        inputSchema: {
          type: 'object',
          properties: {
            coverageType: {
              type: 'string',
              description: 'Type of coverage to explain (e.g., "comprehensive", "collision", "liability", "uninsured motorist")',
            },
          },
          required: ['coverageType'],
        },
      },
      {
        name: 'get_state_requirements',
        description: 'Get insurance requirements for a specific state',
        inputSchema: {
          type: 'object',
          properties: {
            state: {
              type: 'string',
              description: 'US state abbreviation or full name (e.g., "CA", "California")',
            },
            insuranceType: {
              type: 'string',
              description: 'Type of insurance (auto, home, life, etc.)',
              default: 'auto',
            },
          },
          required: ['state'],
        },
      },
      {
        name: 'get_discount_opportunities',
        description: 'Find available insurance discounts and qualification criteria',
        inputSchema: {
          type: 'object',
          properties: {
            customerProfile: {
              type: 'string',
              description: 'Customer profile details (e.g., "good driver, multiple policies, safety features")',
            },
          },
          required: ['customerProfile'],
        },
      },
      {
        name: 'parse_pdf_policy',
        description: 'Extract text from a PDF insurance policy document for analysis',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Absolute path to the PDF file',
            },
          },
          required: ['filePath'],
        },
      },
    ],
  };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_insurance_knowledge': {
        const { query, limit = 5 } = args;

        // Query the Vectorize.io pipeline
        const results = await pipelinesApi.query({
          pipelineId,
          query,
          limit,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                query,
                resultsCount: results.length || 0,
                results: results.map(r => ({
                  text: r.text || r.content,
                  score: r.score,
                  metadata: r.metadata,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'get_coverage_explanation': {
        const { coverageType } = args;

        const results = await pipelinesApi.query({
          pipelineId,
          query: `Explain ${coverageType} coverage in detail`,
          limit: 3,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                coverageType,
                explanations: results.map(r => ({
                  text: r.text || r.content,
                  score: r.score,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'get_state_requirements': {
        const { state, insuranceType = 'auto' } = args;

        const results = await pipelinesApi.query({
          pipelineId,
          query: `${state} ${insuranceType} insurance requirements and minimums`,
          limit: 5,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                state,
                insuranceType,
                requirements: results.map(r => ({
                  text: r.text || r.content,
                  score: r.score,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'get_discount_opportunities': {
        const { customerProfile } = args;

        const results = await pipelinesApi.query({
          pipelineId,
          query: `Insurance discounts for ${customerProfile}`,
          limit: 10,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                customerProfile,
                discounts: results.map(r => ({
                  text: r.text || r.content,
                  score: r.score,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'parse_pdf_policy': {
        const { filePath } = args;

        // Read PDF file
        const dataBuffer = await fs.readFile(filePath);

        // Parse PDF to extract text
        const pdfData = await pdf(dataBuffer);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                filePath,
                extractedText: pdfData.text,
                pages: pdfData.numpages,
                info: pdfData.info,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Vectorize MCP Server running on stdio');
  console.error('Available tools:');
  console.error('  - search_insurance_knowledge');
  console.error('  - get_coverage_explanation');
  console.error('  - get_state_requirements');
  console.error('  - get_discount_opportunities');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
