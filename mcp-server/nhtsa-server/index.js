#!/usr/bin/env node

/**
 * NHTSA MCP Server
 * 
 * Provides VIN decoding using the NHTSA Vehicle API
 * Free, no API key required
 * 
 * Example:
 * Input:  VIN "5YJ3E1EA8JF000123"
 * Output: Complete vehicle details (make, model, year, safety features, etc.)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const NHTSA_API = 'https://vpic.nhtsa.dot.gov/api';

// Create MCP server
const server = new Server(
  {
    name: 'nhtsa-vin-decoder',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Decode VIN using NHTSA API
 */
async function decodeVIN(vin) {
  try {
    console.error(`[NHTSA] Decoding VIN: ${vin}`);
    
    const response = await fetch(
      `${NHTSA_API}/vehicles/DecodeVinValues/${vin}?format=json`
    );
    
    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }
    
    const data = await response.json();
    const result = data.Results[0];
    
    // Check if VIN was successfully decoded
    if (!result.Make || result.ErrorCode !== '0') {
      return {
        success: false,
        error: result.ErrorText || 'Invalid VIN or unable to decode',
        vin: vin,
      };
    }
    
    // Transform to our format
    const vehicleData = {
      success: true,
      vin: vin,
      year: parseInt(result.ModelYear) || null,
      make: result.Make || null,
      model: result.Model || null,
      trim: result.Trim || null,
      bodyClass: result.BodyClass || null,
      engineType: result.EngineConfiguration || null,
      fuelType: result.FuelTypePrimary || null,
      displacement: result.DisplacementL || null,
      cylinders: result.EngineCylinders || null,
      doors: parseInt(result.Doors) || 4,
      driveType: result.DriveType || null,
      transmission: result.TransmissionStyle || null,
      abs: result.ABS === 'Standard' || result.ABS === 'Yes',
      esc: result.ESC === 'Standard' || result.ESC === 'Yes',
      gvwr: result.GVWR || null,
      manufacturer: result.Manufacturer || null,
      plantCountry: result.PlantCountry || null,
      vehicleType: result.VehicleType || null,
      plantCity: result.PlantCity || null,
      plantState: result.PlantState || null,
      series: result.Series || null,
      trim2: result.Trim2 || null,
    };
    
    console.error(`[NHTSA] Successfully decoded: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`);
    
    return vehicleData;
  } catch (error) {
    console.error('[NHTSA] Error:', error);
    return {
      success: false,
      error: error.message,
      vin: vin,
    };
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'decode_vin',
        description: 'Decode a Vehicle Identification Number (VIN) to get complete vehicle details including make, model, year, safety features, and specifications. Uses the free NHTSA Vehicle API.',
        inputSchema: {
          type: 'object',
          properties: {
            vin: {
              type: 'string',
              description: '17-character Vehicle Identification Number (VIN)',
              pattern: '^[A-HJ-NPR-Z0-9]{17}$',
            },
          },
          required: ['vin'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'decode_vin') {
    const { vin } = args;
    
    // Validate VIN format (17 characters, no I, O, or Q)
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Invalid VIN format. VIN must be exactly 17 characters (no I, O, or Q).',
              vin: vin,
            }, null, 2),
          },
        ],
      };
    }
    
    const result = await decodeVIN(vin);
    
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
  console.error('[NHTSA MCP] ✅ Server running');
  console.error('[NHTSA MCP] 🚗 Provides VIN decoding using NHTSA API');
  console.error('[NHTSA MCP] 💰 Free, no API key required');
}

main().catch((error) => {
  console.error('[NHTSA MCP] ❌ Server error:', error);
  process.exit(1);
});

