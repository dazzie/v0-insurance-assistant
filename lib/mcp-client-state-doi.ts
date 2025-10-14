/**
 * MCP Client for State DOI Server
 * Integrates with Vercel AI SDK streaming
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { z } from 'zod';

// MCP message types
interface MCPRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * State DOI MCP Client
 */
export class StateDOIMCPClient {
  private process: any;
  private requestId = 0;
  private pendingRequests = new Map<number, (response: any) => void>();
  private buffer = '';

  constructor() {
    // Start MCP server process
    const serverPath = join(process.cwd(), 'mcp-server/state-doi-server/index.js');
    
    this.process = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    // Handle responses
    this.process.stdout.on('data', (data: Buffer) => {
      this.buffer += data.toString();
      const lines = this.buffer.split('\n');
      
      // Process complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        try {
          const response: MCPResponse = JSON.parse(lines[i]);
          const resolver = this.pendingRequests.get(response.id);
          if (resolver) {
            resolver(response);
            this.pendingRequests.delete(response.id);
          }
        } catch (e) {
          // Ignore invalid JSON
        }
      }
      
      // Keep incomplete line in buffer
      this.buffer = lines[lines.length - 1];
    });
  }

  /**
   * Send request to MCP server
   */
  private async sendRequest(method: string, params?: any): Promise<any> {
    const id = ++this.requestId;
    
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, resolve);
      this.process.stdin.write(JSON.stringify(request) + '\n');
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('MCP request timeout'));
        }
      }, 5000);
    });
  }

  /**
   * List available tools
   */
  async listTools() {
    const response = await this.sendRequest('tools/list');
    return response.result?.tools || [];
  }

  /**
   * Call a tool
   */
  async callTool(name: string, args: any) {
    const response = await this.sendRequest('tools/call', { name, arguments: args });
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.result;
  }

  /**
   * Get official rates for a customer profile
   */
  async getOfficialRates(state: string, customerProfile: any) {
    const result = await this.callTool('get_official_rates', {
      state,
      customerProfile,
    });
    
    const data = JSON.parse(result.content[0].text);
    return data;
  }

  /**
   * List available states
   */
  async listAvailableStates() {
    const result = await this.callTool('list_available_states', {});
    const data = JSON.parse(result.content[0].text);
    return data;
  }

  /**
   * Compare engine quotes to official rates
   */
  async compareToOfficial(state: string, engineQuotes: any[], customerProfile?: any) {
    const result = await this.callTool('compare_to_official', {
      state,
      engineQuotes,
      customerProfile,
    });
    
    const data = JSON.parse(result.content[0].text);
    return data;
  }

  /**
   * Cleanup
   */
  close() {
    this.process.kill();
  }
}

/**
 * Create MCP tools for AI SDK integration
 */
export function createStateDOITools(mcpClient: StateDOIMCPClient) {
  return {
    get_official_insurance_rates: {
      description: 'Get official insurance rates from state Department of Insurance databases. Returns actual rates from California DOI, New York DFS, and other state insurance departments. Use this when the customer asks about official or actual rates from the state.',
      parameters: z.object({
        state: z.string().describe('Two-letter state code (e.g., CA, NY, TX)'),
        customerProfile: z.object({
          vehicle: z.object({
            year: z.number().optional(),
            make: z.string().optional(),
            model: z.string().optional(),
          }).optional(),
          location: z.string().optional(),
          coverage: z.string().optional(),
          drivingRecord: z.string().optional(),
        }).optional(),
      }),
      execute: async ({ state, customerProfile }: { state: string; customerProfile?: any }) => {
        const result = await mcpClient.getOfficialRates(state, customerProfile || {});
        
        if (!result.success) {
          return result.message;
        }
        
        // Format response for AI
        let response = `Official rates from ${result.source}:\n\n`;
        response += `Profile: ${result.profile.name}\n`;
        response += `Vehicle: ${result.profile.vehicle}\n`;
        response += `Location: ${result.profile.location}\n`;
        response += `Coverage: ${result.profile.coverage}\n\n`;
        response += `Monthly Premiums:\n`;
        
        Object.entries(result.rates).forEach(([carrier, rates]: [string, any]) => {
          response += `- ${carrier}: $${rates.monthly}/month ($${rates.annual}/year)\n`;
        });
        
        response += `\nData collected: ${new Date(result.collectedDate).toLocaleDateString()}\n`;
        response += `Note: ${result.note}`;
        
        return response;
      },
    },
    
    list_available_insurance_states: {
      description: 'List all US states that have official DOI rate data available. Use this to check which states you can query for official rates.',
      parameters: z.object({}),
      execute: async () => {
        const result = await mcpClient.listAvailableStates();
        
        let response = `Available states with official DOI data:\n\n`;
        result.details.forEach((detail: any) => {
          response += `- ${detail.name} (${detail.state}): ${detail.profiles} profiles available\n`;
          response += `  Source: ${detail.tool}\n\n`;
        });
        
        response += `Total: ${result.totalStates} states, ${result.totalProfiles} profiles`;
        
        return response;
      },
    },
    
    validate_quote_accuracy: {
      description: 'Compare quote engine results to official state DOI rates to validate accuracy. Use this to check how accurate our quotes are compared to state databases.',
      parameters: z.object({
        state: z.string().describe('Two-letter state code'),
        engineQuotes: z.array(z.object({
          carrierName: z.string(),
          monthlyPremium: z.number(),
        })).describe('Array of quotes from our rating engine'),
        customerProfile: z.object({
          vehicle: z.object({
            year: z.number().optional(),
            make: z.string().optional(),
          }).optional(),
        }).optional(),
      }),
      execute: async ({ state, engineQuotes, customerProfile }: any) => {
        const result = await mcpClient.compareToOfficial(state, engineQuotes, customerProfile);
        
        if (!result.success) {
          return result.message;
        }
        
        let response = `Validation Results for ${state}:\n\n`;
        response += `Comparing to: ${result.profile}\n\n`;
        
        result.comparison.forEach((comp: any) => {
          const status = comp.accurate ? '✅ Accurate' : '❌ Off Target';
          response += `${comp.carrier}:\n`;
          response += `  Official: $${comp.official}/mo\n`;
          response += `  Our Quote: $${comp.engine}/mo\n`;
          response += `  Difference: $${comp.difference} (${comp.differencePercent}%)\n`;
          response += `  Status: ${status}\n\n`;
        });
        
        response += `Summary:\n`;
        response += `- Accuracy Rate: ${result.summary.accuracyRate}\n`;
        response += `- Status: ${result.summary.status}\n`;
        response += `- Target: ${result.summary.targetAccuracy} variance`;
        
        return response;
      },
    },
  };
}

