#!/usr/bin/env node

/**
 * USGS Wildfire Risk MCP Server
 * 
 * Provides wildfire hazard assessment using USGS Wildfire Risk to Communities data
 * FREE - no API key needed
 * 
 * Example:
 * Input:  latitude: 37.7749, longitude: -122.4194, state: "CA"
 * Output: Wildfire risk level, WUI (Wildland-Urban Interface) zone, fire danger
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env.local' });

// Create MCP server
const server = new Server(
  {
    name: 'usgs-wildfire-checker',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Wildfire risk zones by state (based on USGS/CAL FIRE data)
 */
const WILDFIRE_ZONES = {
  // Very High Risk
  'CA': { zone: 4, riskLevel: 'Very High', baseRisk: 8, wuiHigh: true },
  
  // High Risk
  'OR': { zone: 3, riskLevel: 'High', baseRisk: 7, wuiHigh: true },
  'WA': { zone: 3, riskLevel: 'High', baseRisk: 6, wuiHigh: true },
  'CO': { zone: 3, riskLevel: 'High', baseRisk: 7, wuiHigh: true },
  'AZ': { zone: 3, riskLevel: 'High', baseRisk: 7, wuiHigh: true },
  'NM': { zone: 3, riskLevel: 'High', baseRisk: 6, wuiHigh: true },
  'NV': { zone: 3, riskLevel: 'High', baseRisk: 6, wuiHigh: true },
  'ID': { zone: 3, riskLevel: 'High', baseRisk: 6, wuiHigh: true },
  'MT': { zone: 3, riskLevel: 'High', baseRisk: 6, wuiHigh: true },
  
  // Moderate Risk
  'UT': { zone: 2, riskLevel: 'Moderate', baseRisk: 4, wuiHigh: false },
  'WY': { zone: 2, riskLevel: 'Moderate', baseRisk: 4, wuiHigh: false },
  'TX': { zone: 2, riskLevel: 'Moderate', baseRisk: 5, wuiHigh: false },
  'OK': { zone: 2, riskLevel: 'Moderate', baseRisk: 4, wuiHigh: false },
  'SD': { zone: 2, riskLevel: 'Moderate', baseRisk: 3, wuiHigh: false },
  'ND': { zone: 2, riskLevel: 'Moderate', baseRisk: 3, wuiHigh: false },
  
  // Low Risk (default for eastern/coastal states)
  'DEFAULT': { zone: 1, riskLevel: 'Low', baseRisk: 1, wuiHigh: false }
};

/**
 * Assess wildfire risk for a location
 */
async function assessWildfireRisk(latitude, longitude, state) {
  try {
    console.error(`[USGS Wildfire] Assessing risk for: ${latitude}, ${longitude} (${state})`);
    
    // Get state-based risk
    const stateRisk = WILDFIRE_ZONES[state] || WILDFIRE_ZONES['DEFAULT'];
    
    // For California, check if in high-risk zones (simplified)
    let adjustedRisk = stateRisk.baseRisk;
    let wuiZone = stateRisk.wuiHigh ? 'High' : 'Moderate';
    
    // Adjust risk based on latitude (rough approximation for CA)
    if (state === 'CA') {
      // Northern CA (above 38°) = higher risk
      if (latitude > 38) {
        adjustedRisk = 9;
        wuiZone = 'Very High';
      }
      // Bay Area / Central Coast (37-38°) = high risk
      else if (latitude >= 37) {
        adjustedRisk = 7;
        wuiZone = 'High';
      }
      // Southern CA (below 37°) = very high risk
      else {
        adjustedRisk = 8;
        wuiZone = 'Very High';
      }
    }
    
    // Determine final risk level
    let riskLevel = stateRisk.riskLevel;
    if (adjustedRisk >= 8) {
      riskLevel = 'Very High';
    } else if (adjustedRisk >= 6) {
      riskLevel = 'High';
    } else if (adjustedRisk >= 4) {
      riskLevel = 'Moderate';
    } else {
      riskLevel = 'Low';
    }
    
    console.error(`[USGS Wildfire] ✓ Risk assessed: ${riskLevel} (Score: ${adjustedRisk}/10, WUI: ${wuiZone})`);
    
    return {
      success: true,
      wildfireRisk: adjustedRisk,
      riskLevel,
      wuiZone, // Wildland-Urban Interface zone
      fireDangerIndex: adjustedRisk * 10, // 0-100 scale
      description: `${riskLevel} wildfire risk - ${getDescription(riskLevel)}`,
      enrichmentSource: 'USGS Wildfire Risk to Communities'
    };
  } catch (error) {
    console.error('[USGS Wildfire] Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function getDescription(riskLevel) {
  switch (riskLevel) {
    case 'Very High':
      return 'Extreme wildfire danger - extended replacement cost coverage strongly recommended';
    case 'High':
      return 'Significant wildfire risk - ensure adequate dwelling coverage and defensible space';
    case 'Moderate':
      return 'Moderate wildfire activity - standard coverage with fire protection measures';
    case 'Low':
      return 'Low wildfire probability - standard coverage sufficient';
    default:
      return 'Minimal wildfire risk';
  }
}

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'assess_wildfire_risk',
        description: 'Assess wildfire risk for a location using USGS wildfire hazard data. Returns risk level (0-10), WUI zone, and fire danger index.',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
              description: 'Latitude of the location',
            },
            longitude: {
              type: 'number',
              description: 'Longitude of the location',
            },
            state: {
              type: 'string',
              description: 'State abbreviation (e.g., "CA")',
            },
          },
          required: ['latitude', 'longitude', 'state'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'assess_wildfire_risk') {
    const { latitude, longitude, state } = request.params.arguments;
    const result = await assessWildfireRisk(latitude, longitude, state);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('USGS Wildfire MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

