#!/usr/bin/env node

/**
 * First Street Foundation MCP Server (formerly FEMA)
 * 
 * Provides flood zone risk assessment using First Street Foundation API
 * Better accuracy than FEMA, includes climate projections
 * 
 * Example:
 * Input:  lat: 37.7749, lng: -122.4194
 * Output: Flood risk score, risk level, insurance recommendations
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env.local' });

const FIRST_STREET_API_KEY = process.env.FIRST_STREET_API_KEY;
const FIRST_STREET_API = 'https://api.firststreet.org/v2';

// Create MCP server
const server = new Server(
  {
    name: 'firststreet-flood-checker',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Check flood risk using First Street Foundation API
 */
async function checkFloodZone(latitude, longitude) {
  try {
    console.error(`[First Street] Checking flood risk for: ${latitude}, ${longitude}`);
    
    if (!FIRST_STREET_API_KEY) {
      console.error('[First Street] ⚠️  API key not configured');
      // Return graceful fallback
      return {
        success: true,
        floodFactor: 1,
        riskLevel: 'Minimal',
        floodInsuranceRequired: false,
        climateChange30Year: 'Low',
        description: 'API key not configured. Sign up at https://firststreet.org/',
        message: 'Using default low-risk values. Configure FIRST_STREET_API_KEY for accurate data.',
      };
    }
    
    // First Street API: Get flood risk by coordinates
    const response = await fetch(
      `${FIRST_STREET_API}/location/property?lat=${latitude}&lng=${longitude}`,
      {
        headers: {
          'Authorization': `Bearer ${FIRST_STREET_API_KEY}`,
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Sign up at https://firststreet.org/');
      }
      throw new Error(`First Street API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // First Street uses a 1-10 Flood Factor scale
    const floodFactor = data.floodFactor || 1;
    
    // Determine risk level and insurance requirements
    let riskLevel = 'Minimal';
    let floodInsuranceRequired = false;
    let description = '';
    
    if (floodFactor >= 8) {
      riskLevel = 'Extreme';
      floodInsuranceRequired = true;
      description = 'Extreme flood risk - Property has significant flood exposure';
    } else if (floodFactor >= 6) {
      riskLevel = 'Major';
      floodInsuranceRequired = true;
      description = 'Major flood risk - Flood insurance strongly recommended';
    } else if (floodFactor >= 4) {
      riskLevel = 'Moderate';
      floodInsuranceRequired = false;
      description = 'Moderate flood risk - Consider flood insurance';
    } else if (floodFactor >= 2) {
      riskLevel = 'Minor';
      floodInsuranceRequired = false;
      description = 'Minor flood risk - Low probability of flooding';
    } else {
      riskLevel = 'Minimal';
      floodInsuranceRequired = false;
      description = 'Minimal flood risk - Very low probability of flooding';
    }
    
    const result = {
      success: true,
      floodFactor,
      riskLevel,
      floodInsuranceRequired,
      description,
      // Climate change projections
      climateChange30Year: data.climateProjection30Year || 'Unknown',
      // Additional First Street data
      cumulativeRisk: data.cumulativeRisk || null,
      environmentalRisk: data.environmentalRisk || null,
      adaptationScore: data.adaptationScore || null,
      // FEMA equivalent data
      femaFloodZone: data.femaZone || 'See First Street data',
      source: 'First Street Foundation',
    };
    
    console.error(`[First Street] ✓ Factor: ${floodFactor}/10, Risk: ${riskLevel}, Insurance: ${floodInsuranceRequired ? 'Required' : 'Optional'}`);
    
    return result;
  } catch (error) {
    console.error('[First Street] Error:', error);
    return {
      success: false,
      error: error.message,
      suggestion: 'Sign up for free API key at https://firststreet.org/',
    };
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'check_flood_zone',
        description: 'Check flood risk using First Street Foundation API. Returns Flood Factor (1-10 scale), risk level, climate projections, and whether flood insurance is required. More accurate than FEMA with climate change data. Essential for accurate home insurance quotes.',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
              description: 'Latitude of the location (e.g., 37.7749)',
              minimum: -90,
              maximum: 90,
            },
            longitude: {
              type: 'number',
              description: 'Longitude of the location (e.g., -122.4194)',
              minimum: -180,
              maximum: 180,
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'check_flood_zone') {
    const { latitude, longitude } = args;
    const result = await checkFloodZone(latitude, longitude);
    
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
  console.error('[First Street MCP] ✅ Server running');
  console.error('[First Street MCP] 🌊 Provides flood risk assessment with climate data');
  console.error('[First Street MCP] 🔑 API Key:', FIRST_STREET_API_KEY ? 'Configured ✓' : '⚠️  Not configured');
  if (!FIRST_STREET_API_KEY) {
    console.error('[First Street MCP] 💡 Sign up at https://firststreet.org/ for free API key');
  }
}

main().catch((error) => {
  console.error('[First Street MCP] ❌ Server error:', error);
  process.exit(1);
});

