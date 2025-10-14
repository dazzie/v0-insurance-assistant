# State DOI MCP Server - Setup Instructions

## Quick Setup

### Option 1: Install Dependencies (Recommended)

```bash
# From project root
cd mcp-server/state-doi-server

# Clear npm cache if you have proxy issues
npm config delete proxy
npm config delete https-proxy
npm config set registry https://registry.npmjs.org/

# Install
npm install

# Test
npm test
```

### Option 2: Use Without MCP (Temporary Testing)

If you have network/proxy issues, you can test the functionality directly:

```bash
# Create a simple test without MCP SDK
node test-direct.js
```

## Verify Installation

### Check Files

```bash
ls -la mcp-server/state-doi-server/
# Should see:
# - index.js (MCP server)
# - package.json
# - README.md
# - AI-SDK-INTEGRATION.md
# - test.js
```

### Check Data

```bash
ls -la data/ca-doi-reference/
# Should see:
# - index.json (with 10 profiles: 5 CA + 5 NY)
```

### Test Data Access

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/ca-doi-reference/index.json', 'utf-8'));
console.log('Total profiles:', data.profiles.length);
console.log('States:', [...new Set(data.profiles.map(p => p.state))].join(', '));
"
```

## Integration Steps

### Step 1: Install AI SDK Dependencies

```bash
# From project root
npm install ai @ai-sdk/openai zod
```

### Step 2: Add MCP Client to Chat API

See `AI-SDK-INTEGRATION.md` for complete examples.

Basic integration:

```typescript
// app/api/chat/route.ts
import { StateDOIMCPClient, createStateDOITools } from '@/lib/mcp-client-state-doi';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const mcpClient = new StateDOIMCPClient();
  const tools = createStateDOITools(mcpClient);
  
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools, // AI can now use state DOI tools
  });
  
  mcpClient.close();
  return result.toAIStreamResponse();
}
```

### Step 3: Test AI Integration

```bash
# Start dev server
npm run dev

# Test in browser or curl
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "What are the official CA rates for a 2015 Tesla?"
    }]
  }'
```

## Troubleshooting

### Network/Proxy Issues

If `npm install` fails:

1. Check proxy settings:
   ```bash
   npm config list
   ```

2. Clear proxy:
   ```bash
   npm config delete proxy
   npm config delete https-proxy
   ```

3. Use alternative registry:
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

4. Or install globally and link:
   ```bash
   npm install -g @modelcontextprotocol/sdk
   cd mcp-server/state-doi-server
   npm link @modelcontextprotocol/sdk
   ```

### MCP Server Not Starting

Check if data file exists:
```bash
test -f data/ca-doi-reference/index.json && echo "✅ Data file exists" || echo "❌ Missing data file"
```

If missing, collect data:
```bash
node scripts/batch-collect-ca-doi.js --yes
node scripts/batch-collect-ny-doi.js --yes
```

### AI SDK Integration Issues

1. Ensure AI SDK is installed:
   ```bash
   npm list ai @ai-sdk/openai zod
   ```

2. Check TypeScript config:
   ```bash
   cat tsconfig.json | grep "esModuleInterop"
   # Should be true
   ```

3. Verify import paths:
   ```typescript
   // Use absolute imports
   import { StateDOIMCPClient } from '@/lib/mcp-client-state-doi';
   ```

## Current Status

✅ **Created**:
- MCP Server: `mcp-server/state-doi-server/index.js`
- MCP Client: `lib/mcp-client-state-doi.ts`
- Data: 10 profiles (5 CA + 5 NY)
- Documentation: Complete guides

📋 **Next Steps**:
1. Install dependencies: `cd mcp-server/state-doi-server && npm install`
2. Test MCP server: `npm test`
3. Integrate with AI SDK (see AI-SDK-INTEGRATION.md)
4. Test in chat interface

🚀 **Ready to Use**:
- State DOI data collection ✅
- MCP server code ✅  
- AI SDK integration guide ✅
- Just needs npm install + integration ✅

## Quick Start Commands

```bash
# 1. Install (from project root)
cd mcp-server/state-doi-server && npm install && cd ../..

# 2. Test MCP server
cd mcp-server/state-doi-server && npm test && cd ../..

# 3. Verify data
node -e "console.log(require('./data/ca-doi-reference/index.json').profiles.length + ' profiles loaded')"

# 4. Start dev server with MCP integration
npm run dev
```

## What You'll See

Once integrated, users can ask:

**"What are the official California rates?"**

AI will:
1. Call `get_official_insurance_rates` tool
2. Query MCP server
3. Return official DOI data
4. Stream response in real-time

**Response**:
```
Based on official California Department of Insurance data:

Progressive: $138/month
GEICO: $143/month
State Farm: $158/month
Allstate: $175/month

These are actual rates from the state database, collected on Jan 15, 2025.
```

---

**Ready to proceed?** Run the Quick Start Commands above! 🚀

