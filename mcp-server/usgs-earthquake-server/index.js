#!/usr/bin/env node

/**
 * USGS Earthquake Risk MCP Server
 * 
 * Provides seismic hazard assessment using USGS Earthquake Hazards Program data
 * FREE API - no key needed
 * 
 * Example:
 * Input:  latitude: 37.7749, longitude: -122.4194
 * Output: Earthquake risk level, PGA (peak ground acceleration), probability
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env.local' });

// USGS Earthquake API (FREE - no key needed)
const USGS_API = 'https://earthquake.usgs.gov/ws/designmaps/asce7-16.json';

// Create MCP server
const server = new Server(
  {
    name: 'usgs-earthquake-checker',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Seismic hazard zones by state (simplified for quick lookup)
 * Based on USGS National Seismic Hazard Model
 */
const SEISMIC_ZONES = {
  // Very High Risk (Zone 4)
  'CA': { zone: 4, riskLevel: 'Very High', baseRisk: 8 },
  'AK': { zone: 4, riskLevel: 'Very High', baseRisk: 9 },
  
  // High Risk (Zone 3)
  'WA': { zone: 3, riskLevel: 'High', baseRisk: 6 },
  'OR': { zone: 3, riskLevel: 'High', baseRisk: 6 },
  'NV': { zone: 3, riskLevel: 'High', baseRisk: 5 },
  'ID': { zone: 3, riskLevel: 'High', baseRisk: 5 },
  'UT': { zone: 3, riskLevel: 'High', baseRisk: 5 },
  'HI': { zone: 3, riskLevel: 'High', baseRisk: 6 },
  
  // Moderate Risk (Zone 2)
  'MT': { zone: 2, riskLevel: 'Moderate', baseRisk: 3 },
  'WY': { zone: 2, riskLevel: 'Moderate', baseRisk: 3 },
  'SC': { zone: 2, riskLevel: 'Moderate', baseRisk: 3 },
  'MO': { zone: 2, riskLevel: 'Moderate', baseRisk: 4 }, // New Madrid
  'AR': { zone: 2, riskLevel: 'Moderate', baseRisk: 4 }, // New Madrid
  'TN': { zone: 2, riskLevel: 'Moderate', baseRisk: 4 }, // New Madrid
  'KY': { zone: 2, riskLevel: 'Moderate', baseRisk: 3 },
  
  // Low Risk (Zone 1) - Most other states
  'DEFAULT': { zone: 1, riskLevel: 'Low', baseRisk: 1 }
};

/**
 * Assess earthquake risk for a location
 */
async function assessEarthquakeRisk(latitude, longitude, state) {
  try {
    console.error(`[USGS Earthquake] Assessing risk for: ${latitude}, ${longitude} (${state})`);
    
    // Get state-based risk (fallback if API fails)
    const stateRisk = SEISMIC_ZONES[state] || SEISMIC_ZONES['DEFAULT'];
    
    try {
      // Try USGS API for precise data
      const response = await fetch(
        `${USGS_API}?latitude=${latitude}&longitude=${longitude}&riskCategory=ASCE7-16&siteClass=C&title=Seismic%20Design`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Extract Peak Ground Acceleration (PGA)
        const pga = data.response?.data?.pga || 0;
        
        // Calculate risk score (0-10 scale) based on PGA
        // PGA > 0.4g = Very High (9-10)
        // PGA 0.2-0.4g = High (6-8)
        // PGA 0.1-0.2g = Moderate (3-5)
        // PGA < 0.1g = Low (1-2)
        let riskScore = stateRisk.baseRisk;
        let riskLevel = stateRisk.riskLevel;
        
        if (pga >= 0.4) {
          riskScore = 9;
          riskLevel = 'Very High';
        } else if (pga >= 0.2) {
          riskScore = 7;
          riskLevel = 'High';
        } else if (pga >= 0.1) {
          riskScore = 4;
          riskLevel = 'Moderate';
        } else if (pga > 0) {
          riskScore = 2;
          riskLevel = 'Low';
        }
        
        console.error(`[USGS Earthquake] ✓ Risk assessed: ${riskLevel} (Score: ${riskScore}/10, PGA: ${pga.toFixed(2)}g)`);
        
        return {
          success: true,
          earthquakeRisk: riskScore,
          riskLevel,
          peakGroundAcceleration: parseFloat(pga.toFixed(3)),
          seismicZone: stateRisk.zone,
          description: `${riskLevel} earthquake risk - ${getDescription(riskLevel)}`,
          usgsData: true,
          enrichmentSource: 'USGS Earthquake Hazards Program'
        };
      }
    } catch (apiError) {
      console.error('[USGS Earthquake] API error, using state-based fallback:', apiError.message);
    }
    
    // Fallback to state-based risk
    console.error(`[USGS Earthquake] ✓ Risk assessed (fallback): ${stateRisk.riskLevel} (Zone: ${stateRisk.zone})`);
    
    return {
      success: true,
      earthquakeRisk: stateRisk.baseRisk,
      riskLevel: stateRisk.riskLevel,
      peakGroundAcceleration: null,
      seismicZone: stateRisk.zone,
      description: `${stateRisk.riskLevel} earthquake risk - ${getDescription(stateRisk.riskLevel)}`,
      usgsData: false,
      message: 'Using state-based seismic zone data',
      enrichmentSource: 'USGS National Seismic Hazard Model'
    };
  } catch (error) {
    console.error('[USGS Earthquake] Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function getDescription(riskLevel) {
  switch (riskLevel) {
    case 'Very High':
      return 'Major earthquakes likely - earthquake insurance strongly recommended';
    case 'High':
      return 'Significant earthquake risk - earthquake insurance recommended';
    case 'Moderate':
      return 'Moderate earthquake activity - consider earthquake coverage';
    case 'Low':
      return 'Low earthquake probability - standard coverage may be sufficient';
    default:
      return 'Minimal earthquake risk';
  }
}

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'assess_earthquake_risk',
        description: 'Assess earthquake risk for a location using USGS seismic hazard data. Returns risk level (0-10), seismic zone, and peak ground acceleration.',
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
              description: 'State abbreviation (e.g., "CA") for fallback data',
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
  if (request.params.name === 'assess_earthquake_risk') {
    const { latitude, longitude, state } = request.params.arguments;
    const result = await assessEarthquakeRisk(latitude, longitude, state);
    
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
  console.error('USGS Earthquake MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});


