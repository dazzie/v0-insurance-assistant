#!/usr/bin/env node

/**
 * Test script for State DOI MCP Server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPServer() {
  console.log('🧪 Testing State DOI MCP Server...\n');

  // Start MCP server
  const server = spawn('node', [join(__dirname, 'index.js')], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  // Test 1: List available states
  console.log('📋 Test 1: List Available States');
  const listRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'list_available_states',
      arguments: {}
    }
  };

  server.stdin.write(JSON.stringify(listRequest) + '\n');

  // Test 2: Get official rates for CA
  console.log('\n📊 Test 2: Get Official Rates for California');
  const getRatesRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get_official_rates',
      arguments: {
        state: 'CA',
        customerProfile: {
          vehicle: {
            year: 2015,
            make: 'Tesla',
            model: 'Model S'
          },
          location: 'San Francisco, CA',
          coverage: 'Standard'
        }
      }
    }
  };

  setTimeout(() => {
    server.stdin.write(JSON.stringify(getRatesRequest) + '\n');
  }, 100);

  // Test 3: Compare to official
  console.log('\n🔍 Test 3: Compare Engine Quotes to Official Rates');
  const compareRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'compare_to_official',
      arguments: {
        state: 'CA',
        engineQuotes: [
          { carrierName: 'Progressive Insurance', monthlyPremium: 119 },
          { carrierName: 'GEICO Insurance', monthlyPremium: 95 },
          { carrierName: 'State Farm', monthlyPremium: 125 }
        ],
        customerProfile: {
          vehicle: { year: 2015, make: 'Tesla' }
        }
      }
    }
  };

  setTimeout(() => {
    server.stdin.write(JSON.stringify(compareRequest) + '\n');
  }, 200);

  // Collect output
  let output = '';
  server.stdout.on('data', (data) => {
    output += data.toString();
    
    // Try to parse and display results
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        try {
          const response = JSON.parse(line);
          if (response.result && response.result.content) {
            const content = response.result.content[0].text;
            console.log('\n✅ Response:', JSON.parse(content));
          }
        } catch (e) {
          // Not valid JSON, skip
        }
      }
    });
  });

  // Cleanup after tests
  setTimeout(() => {
    server.kill();
    console.log('\n✨ Tests complete!\n');
  }, 500);
}

testMCPServer().catch(console.error);

