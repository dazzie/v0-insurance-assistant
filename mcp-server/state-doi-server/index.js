#!/usr/bin/env node

/**
 * State DOI Reference MCP Server
 * 
 * Provides official insurance rate data from state Department of Insurance databases
 * for California, New York, and other states.
 * 
 * Tools:
 * - get_official_rates: Get official rates for a customer profile
 * - list_available_states: List states with available data
 * - compare_to_official: Compare engine quotes to official rates
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to DOI reference data
const DATA_FILE = path.join(__dirname, '../../data/ca-doi-reference/index.json');

/**
 * Load DOI reference data
 */
function loadDOIData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { profiles: [] };
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading DOI data:', error);
    return { profiles: [] };
  }
}

/**
 * Find matching profile based on customer data
 */
function findMatchingProfile(customerProfile, state) {
  const data = loadDOIData();
  
  // Filter by state
  const stateProfiles = data.profiles.filter(p => 
    p.state === state || p.location.includes(state)
  );
  
  if (stateProfiles.length === 0) {
    return null;
  }
  
  // Try to find exact match
  let bestMatch = stateProfiles.find(p => {
    if (customerProfile.vehicle) {
      const vehicleMatch = p.vehicle.toLowerCase().includes(
        `${customerProfile.vehicle.year} ${customerProfile.vehicle.make}`.toLowerCase()
      );
      if (vehicleMatch) return true;
    }
    return false;
  });
  
  // If no exact match, return first profile for the state
  if (!bestMatch) {
    bestMatch = stateProfiles[0];
  }
  
  return bestMatch;
}

/**
 * Get available states
 */
function getAvailableStates() {
  const data = loadDOIData();
  const states = new Set();
  
  data.profiles.forEach(p => {
    if (p.state) states.add(p.state);
  });
  
  return Array.from(states).map(state => {
    const count = data.profiles.filter(p => p.state === state).length;
    return { state, profiles: count };
  });
}

/**
 * Compare engine quotes to official rates
 */
function compareToOfficial(engineQuotes, officialRates) {
  const comparison = [];
  
  Object.entries(officialRates).forEach(([carrier, rates]) => {
    const engineQuote = engineQuotes.find(q => 
      q.carrierName.toLowerCase().includes(carrier.toLowerCase())
    );
    
    if (engineQuote && rates.monthly) {
      const diff = engineQuote.monthlyPremium - rates.monthly;
      const diffPercent = ((diff / rates.monthly) * 100).toFixed(1);
      
      comparison.push({
        carrier,
        official: rates.monthly,
        engine: engineQuote.monthlyPremium,
        difference: diff,
        differencePercent: parseFloat(diffPercent),
        accurate: Math.abs(parseFloat(diffPercent)) <= 15
      });
    }
  });
  
  return comparison;
}

// Create MCP server
const server = new Server(
  {
    name: 'state-doi-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_official_rates',
        description: 'Get official insurance rates from state DOI databases. Returns actual rates from California DOI, New York DFS, and other state insurance departments for a given customer profile.',
        inputSchema: {
          type: 'object',
          properties: {
            state: {
              type: 'string',
              description: 'Two-letter state code (e.g., CA, NY, TX)',
            },
            customerProfile: {
              type: 'object',
              description: 'Customer profile information',
              properties: {
                vehicle: {
                  type: 'object',
                  properties: {
                    year: { type: 'number' },
                    make: { type: 'string' },
                    model: { type: 'string' },
                  },
                },
                location: { type: 'string' },
                coverage: { type: 'string' },
                drivingRecord: { type: 'string' },
              },
            },
          },
          required: ['state'],
        },
      },
      {
        name: 'list_available_states',
        description: 'List all states that have official DOI rate data available in the reference database.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'compare_to_official',
        description: 'Compare quote engine results to official state DOI rates. Useful for validation and accuracy checking.',
        inputSchema: {
          type: 'object',
          properties: {
            state: {
              type: 'string',
              description: 'Two-letter state code',
            },
            engineQuotes: {
              type: 'array',
              description: 'Array of quotes from the rating engine',
              items: {
                type: 'object',
                properties: {
                  carrierName: { type: 'string' },
                  monthlyPremium: { type: 'number' },
                },
              },
            },
            customerProfile: {
              type: 'object',
              description: 'Customer profile for matching',
            },
          },
          required: ['state', 'engineQuotes'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_official_rates': {
        const { state, customerProfile = {} } = args;
        
        const profile = findMatchingProfile(customerProfile, state);
        
        if (!profile) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: `No official rate data available for state: ${state}`,
                  availableStates: getAvailableStates(),
                }, null, 2),
              },
            ],
          };
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                state,
                source: state === 'CA' 
                  ? 'California Department of Insurance'
                  : state === 'NY' 
                  ? 'New York Department of Financial Services'
                  : `${state} Department of Insurance`,
                profile: {
                  id: profile.id,
                  name: profile.name,
                  vehicle: profile.vehicle,
                  location: profile.location,
                  coverage: profile.coverage,
                },
                rates: profile.rates,
                collectedDate: profile.collectedDate,
                note: 'These are official rates from state insurance department databases',
              }, null, 2),
            },
          ],
        };
      }

      case 'list_available_states': {
        const states = getAvailableStates();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                totalStates: states.length,
                totalProfiles: states.reduce((sum, s) => sum + s.profiles, 0),
                states,
                details: states.map(s => ({
                  state: s.state,
                  name: s.state === 'CA' ? 'California' : s.state === 'NY' ? 'New York' : s.state,
                  profiles: s.profiles,
                  tool: s.state === 'CA' 
                    ? 'https://interactive.web.insurance.ca.gov/'
                    : s.state === 'NY'
                    ? 'https://myportal.dfs.ny.gov/'
                    : 'State DOI tool',
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'compare_to_official': {
        const { state, engineQuotes, customerProfile = {} } = args;
        
        const profile = findMatchingProfile(customerProfile, state);
        
        if (!profile) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: `No official data for ${state}`,
                }, null, 2),
              },
            ],
          };
        }
        
        const comparison = compareToOfficial(engineQuotes, profile.rates);
        const accurateCount = comparison.filter(c => c.accurate).length;
        const accuracy = comparison.length > 0 
          ? ((accurateCount / comparison.length) * 100).toFixed(1)
          : 0;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                state,
                profile: profile.name,
                comparison,
                summary: {
                  totalCarriers: comparison.length,
                  accurate: accurateCount,
                  accuracyRate: `${accuracy}%`,
                  targetAccuracy: '±15%',
                  status: parseFloat(accuracy) >= 70 ? 'Good' : 'Needs Calibration',
                },
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${error.message}`
    );
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('State DOI MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

