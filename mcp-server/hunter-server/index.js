#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

dotenv.config();

const HUNTER_API_KEY = process.env.HUNTER_API_KEY;
const HUNTER_API_BASE = 'https://api.hunter.io/v2';

/**
 * Hunter.io MCP Server
 * 
 * Provides email verification and validation using Hunter.io API
 * 
 * Tools:
 * - verify_email: Verify email address deliverability and validity
 * 
 * API Key: Sign up at https://hunter.io/ for free tier (25 searches/month)
 */

class HunterServer {
  constructor() {
    this.server = new Server(
      {
        name: 'hunter-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'verify_email',
          description: 'Verify email address deliverability, validity, and risk score using Hunter.io. Returns deliverability status, email type, risk assessment, and SMTP validation.',
          inputSchema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                description: 'Email address to verify (e.g., john.doe@example.com)',
              },
            },
            required: ['email'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'verify_email') {
        return await this.verifyEmail(args.email);
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async verifyEmail(email) {
    try {
      // Validate email format first (basic check)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'Invalid email format',
                email: email,
              }, null, 2),
            },
          ],
        };
      }

      // Check if API key is configured
      if (!HUNTER_API_KEY) {
        console.warn('[Hunter] No API key configured, returning mock validation');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'Hunter.io API key not configured. Set HUNTER_API_KEY in .env.local',
                email: email,
                note: 'Sign up at https://hunter.io/ for free tier (25 verifications/month)',
              }, null, 2),
            },
          ],
        };
      }

      // Call Hunter.io Email Verifier API
      const url = `${HUNTER_API_BASE}/email-verifier?email=${encodeURIComponent(email)}&api_key=${HUNTER_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.details || `Hunter API error: ${response.status}`);
      }

      const verification = data.data;

      // Parse the response
      const result = {
        success: true,
        email: verification.email,
        status: verification.status, // valid, invalid, accept_all, webmail, disposable, unknown
        result: verification.result, // deliverable, undeliverable, risky, unknown
        score: verification.score, // 0-100 (higher is better)
        regexp: verification.regexp, // Email format validation
        gibberish: verification.gibberish, // Is email gibberish?
        disposable: verification.disposable, // Is disposable email?
        webmail: verification.webmail, // Is webmail (gmail, yahoo, etc)?
        mxRecords: verification.mx_records, // MX records exist?
        smtpServer: verification.smtp_server, // SMTP server accessible?
        smtpCheck: verification.smtp_check, // SMTP validation performed?
        acceptAll: verification.accept_all, // Server accepts all emails?
        block: verification.block, // Is email blocked?
        
        // Additional info
        sources: verification.sources?.length || 0, // Number of public sources found
        firstName: verification.first_name,
        lastName: verification.last_name,
        position: verification.position,
        company: verification.company,
        
        // Risk assessment
        risk: this.assessRisk(verification),
        
        enrichmentSource: 'Hunter.io',
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };

    } catch (error) {
      console.error('[Hunter] Email verification error:', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              email: email,
              error: error.message,
            }, null, 2),
          },
        ],
      };
    }
  }

  assessRisk(verification) {
    const score = verification.score || 0;
    const disposable = verification.disposable;
    const gibberish = verification.gibberish;
    const acceptAll = verification.accept_all;
    const result = verification.result;

    // High risk
    if (disposable || gibberish || result === 'undeliverable') {
      return 'high';
    }

    // Medium risk
    if (acceptAll || score < 50 || result === 'risky') {
      return 'medium';
    }

    // Low risk
    if (score >= 70 && result === 'deliverable') {
      return 'low';
    }

    return 'unknown';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Hunter.io MCP Server running on stdio');
  }
}

const server = new HunterServer();
server.run().catch(console.error);


