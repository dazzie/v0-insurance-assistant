# State DOI Reference MCP Server

MCP server that provides official insurance rate data from state Department of Insurance databases (California DOI, New York DFS, etc.).

## Features

- **Get Official Rates**: Query actual rates from state DOI databases
- **Multi-State Support**: CA, NY, and expanding
- **Profile Matching**: Find closest matching profile based on customer data
- **Validation**: Compare quote engine results to official rates
- **AI Integration**: Stream-compatible for use with Vercel AI SDK

## Tools

### 1. `get_official_rates`

Get official insurance rates for a customer profile from state DOI databases.

**Input:**
```json
{
  "state": "CA",
  "customerProfile": {
    "vehicle": {
      "year": 2015,
      "make": "Tesla",
      "model": "Model S"
    },
    "location": "San Francisco, CA",
    "coverage": "Standard",
    "drivingRecord": "Clean"
  }
}
```

**Output:**
```json
{
  "success": true,
  "state": "CA",
  "source": "California Department of Insurance",
  "profile": {
    "id": "sf-tesla-2015-standard-clean",
    "name": "SF Standard Mid-Age Tesla",
    "vehicle": "2015 Tesla Model S",
    "location": "San Francisco, CA (94122)",
    "coverage": "Standard"
  },
  "rates": {
    "Progressive": { "annual": 1650, "monthly": 138 },
    "GEICO": { "annual": 1720, "monthly": 143 },
    "State Farm": { "annual": 1890, "monthly": 158 },
    "Allstate": { "annual": 2100, "monthly": 175 }
  },
  "collectedDate": "2025-01-15T10:30:00Z",
  "note": "These are official rates from state insurance department databases"
}
```

### 2. `list_available_states`

List all states with available official DOI rate data.

**Input:**
```json
{}
```

**Output:**
```json
{
  "success": true,
  "totalStates": 2,
  "totalProfiles": 10,
  "states": [
    { "state": "CA", "profiles": 5 },
    { "state": "NY", "profiles": 5 }
  ],
  "details": [
    {
      "state": "CA",
      "name": "California",
      "profiles": 5,
      "tool": "https://interactive.web.insurance.ca.gov/"
    },
    {
      "state": "NY",
      "name": "New York",
      "profiles": 5,
      "tool": "https://myportal.dfs.ny.gov/"
    }
  ]
}
```

### 3. `compare_to_official`

Compare quote engine results to official state DOI rates for validation.

**Input:**
```json
{
  "state": "CA",
  "engineQuotes": [
    { "carrierName": "Progressive Insurance", "monthlyPremium": 119 },
    { "carrierName": "GEICO Insurance", "monthlyPremium": 95 }
  ],
  "customerProfile": {
    "vehicle": { "year": 2015, "make": "Tesla" }
  }
}
```

**Output:**
```json
{
  "success": true,
  "state": "CA",
  "profile": "SF Standard Mid-Age Tesla",
  "comparison": [
    {
      "carrier": "Progressive",
      "official": 138,
      "engine": 119,
      "difference": -19,
      "differencePercent": -13.8,
      "accurate": true
    },
    {
      "carrier": "GEICO",
      "official": 143,
      "engine": 95,
      "difference": -48,
      "differencePercent": -33.6,
      "accurate": false
    }
  ],
  "summary": {
    "totalCarriers": 2,
    "accurate": 1,
    "accuracyRate": "50.0%",
    "targetAccuracy": "±15%",
    "status": "Needs Calibration"
  }
}
```

## Installation

```bash
cd mcp-server/state-doi-server
npm install
```

## Usage

### Standalone

```bash
node index.js
```

### With MCP Inspector

```bash
npx @modelcontextprotocol/inspector node index.js
```

### Test

```bash
npm test
```

## Integration with AI SDK

### In Next.js API Route

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createMCPClient } from '@/lib/mcp-client';

export async function POST(req: Request) {
  const { messages, customerProfile } = await req.json();
  
  // Create MCP client for state DOI server
  const mcpClient = await createMCPClient('state-doi-server');
  
  // Get available MCP tools
  const mcpTools = await mcpClient.listTools();
  
  // Convert MCP tools to AI SDK tool format
  const tools = {
    get_official_rates: {
      description: 'Get official insurance rates from state DOI databases',
      parameters: mcpTools.find(t => t.name === 'get_official_rates').inputSchema,
      execute: async (args) => {
        const result = await mcpClient.callTool('get_official_rates', args);
        return result.content[0].text;
      }
    },
    // ... other tools
  };
  
  // Stream response with MCP tools
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools,
    maxToolRoundtrips: 5,
  });
  
  return result.toAIStreamResponse();
}
```

### AI Conversation Example

**User**: "What are the official rates for my 2015 Tesla in California?"

**AI**: *Calls `get_official_rates` tool*

```json
{
  "state": "CA",
  "customerProfile": {
    "vehicle": { "year": 2015, "make": "Tesla", "model": "Model S" },
    "location": "San Francisco, CA"
  }
}
```

**AI Response**: "Based on official California Department of Insurance data, here are the actual rates for a 2015 Tesla Model S in San Francisco:

- Progressive: $138/month
- GEICO: $143/month
- State Farm: $158/month
- Allstate: $175/month

These rates are from the official state database, collected on [date]."

## Data Source

The MCP server reads from: `../../data/ca-doi-reference/index.json`

This file contains official rates collected from:
- **California**: https://interactive.web.insurance.ca.gov/
- **New York**: https://myportal.dfs.ny.gov/
- **Other states**: As they are added

To add more data:
```bash
# For California
node scripts/batch-collect-ca-doi.js --file my-ca-rates.json

# For New York
node scripts/batch-collect-ny-doi.js --file my-ny-rates.json
```

## Architecture

```
┌─────────────────┐
│   AI Agent      │
│  (Vercel AI SDK)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MCP Tools      │
│  - get_rates    │
│  - compare      │
│  - list_states  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ State DOI MCP   │
│    Server       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ DOI Reference   │
│   Database      │
│  (index.json)   │
└─────────────────┘
```

## Benefits

1. **Official Data**: Real rates from state insurance departments
2. **Validation**: Ensure quote engine accuracy
3. **Multi-State**: Expandable to all 50 states
4. **AI-Native**: Designed for AI agent use with streaming
5. **Fast**: In-memory lookups, sub-10ms responses
6. **Automatic**: AI can fetch rates without manual intervention

## Development

### Adding a New State

1. Collect data:
   ```bash
   node scripts/batch-collect-[state]-doi.js --file my-rates.json
   ```

2. MCP server automatically picks it up (no code changes needed)

3. Test:
   ```bash
   npm test
   ```

### Debugging

Enable debug logging:
```bash
DEBUG=mcp:* node index.js
```

## License

MIT

