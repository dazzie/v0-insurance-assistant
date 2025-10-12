#!/usr/bin/env node

/**
 * OpenCage MCP Server
 * 
 * Provides address standardization and geocoding using OpenCage Data API
 * Free tier: 2,500 requests/day
 * 
 * Example:
 * Input:  "1234 Market St, SF, CA"
 * Output: Standardized address + coordinates
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env.local' });

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
const OPENCAGE_API = 'https://api.opencagedata.com/geocode/v1/json';

// Create MCP server
const server = new Server(
  {
    name: 'opencage-geocoder',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Geocode address using OpenCage
 */
async function geocodeAddress(address) {
  try {
    if (!OPENCAGE_API_KEY) {
      return {
        success: false,
        error: 'OPENCAGE_API_KEY not configured in .env.local',
        message: 'Sign up at https://opencagedata.com/ for a free API key (2,500 requests/day)',
      };
    }
    
    console.error(`[OpenCage] Geocoding address: ${address}`);
    
    const params = new URLSearchParams({
      q: address,
      key: OPENCAGE_API_KEY,
      countrycode: 'us', // Limit to US addresses
      no_annotations: '0',
      limit: '1',
    });
    
    const response = await fetch(`${OPENCAGE_API}?${params}`);
    
    if (!response.ok) {
      throw new Error(`OpenCage API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results.length === 0) {
      return {
        success: false,
        error: 'Address not found',
        suggestions: 'Try including more details (city, state, zip code)',
      };
    }
    
    const result = data.results[0];
    const components = result.components;
    
    const geocoded = {
      success: true,
      formatted: result.formatted,
      street: `${components.house_number || ''} ${components.road || ''}`.trim() || null,
      city: components.city || components.town || components.village || null,
      state: components.state_code || null,
      zipCode: components.postcode || null,
      county: components.county || null,
      country: components.country || null,
      latitude: result.geometry.lat,
      longitude: result.geometry.lng,
      timezone: result.annotations?.timezone?.name || null,
      confidence: result.confidence,
      bbox: result.bounds || null,
    };
    
    console.error(`[OpenCage] ✓ Geocoded to: ${geocoded.city}, ${geocoded.state} (${geocoded.latitude}, ${geocoded.longitude})`);
    
    return geocoded;
  } catch (error) {
    console.error('[OpenCage] Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'geocode_address',
        description: 'Standardize and geocode US addresses. Returns formatted address, coordinates, timezone, and confidence score. Useful for normalizing addresses and getting location data for insurance quotes.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Address to geocode (e.g., "1234 Market Street, San Francisco, CA 94102")',
            },
          },
          required: ['address'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'geocode_address') {
    const { address } = args;
    const result = await geocodeAddress(address);
    
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

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[OpenCage MCP] ✅ Server running');
  console.error('[OpenCage MCP] 📍 Provides address standardization & geocoding');
  console.error('[OpenCage MCP] 🔑 API Key:', OPENCAGE_API_KEY ? 'Configured' : '⚠️  Missing (see .env.local)');
  if (!OPENCAGE_API_KEY) {
    console.error('[OpenCage MCP] 💡 Sign up at https://opencagedata.com/ (free: 2,500/day)');
  }
}

main().catch((error) => {
  console.error('[OpenCage MCP] ❌ Server error:', error);
  process.exit(1);
});

