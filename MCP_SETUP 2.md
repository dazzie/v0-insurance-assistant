# MCP Server Setup - Quick Start Guide

## What is MCP?

Model Context Protocol (MCP) allows Claude Code to directly query your Vectorize.io insurance knowledge base (235+ entries) during conversations. No more manual searches - Claude fetches relevant insurance information automatically.

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

If you encounter network issues, you can install later. The code is ready.

### 2. Configure Claude Code

Add this to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "vectorize-insurance": {
      "command": "node",
      "args": [
        "/Users/daraghmoran/Documents/maven-agentic/v0-insurance-assistant/mcp-server/index.js"
      ]
    }
  }
}
```

**How to access Claude Code MCP settings:**
1. Open Claude Code settings
2. Look for "MCP Servers" or "Model Context Protocol" section
3. Add the configuration above
4. Save and restart Claude Code

### 3. Verify Environment Variables

Ensure your `.env.local` (in the root project directory) contains:

```env
VECTORIZE_IO_API_KEY=your_api_key
VECTORIZE_IO_ORG_ID=your_org_id
VECTORIZE_IO_PIPELINE_ID=your_pipeline_id
```

The MCP server automatically reads from `../.env.local`.

### 4. Restart Claude Code

After adding the configuration, fully restart Claude Code to load the MCP server.

## Available Tools

Once configured, Claude Code can use these tools automatically:

### 🔍 search_insurance_knowledge
**Search across all 235+ insurance entries**

Example prompts:
- "Search for comprehensive coverage information"
- "Find state requirements for California"
- "Look up negotiation strategies"

### 📖 get_coverage_explanation
**Get detailed coverage type explanations**

Example prompts:
- "Explain collision coverage"
- "What is uninsured motorist coverage?"
- "Get details on liability insurance"

### 🗺️ get_state_requirements
**Retrieve state-specific requirements**

Example prompts:
- "Get California auto insurance requirements"
- "What are Texas home insurance minimums?"
- "Show me Florida insurance laws"

### 💰 get_discount_opportunities
**Find applicable insurance discounts**

Example prompts:
- "Find discounts for good drivers"
- "What discounts apply to bundled policies?"
- "Show me safety feature discounts"

## Testing the Setup

### Test 1: Basic Search
In Claude Code, ask:
```
Use the search_insurance_knowledge tool to find information about "comprehensive coverage"
```

You should get results with insurance knowledge entries.

### Test 2: Coverage Explanation
```
Use get_coverage_explanation for "liability"
```

You should get detailed liability coverage explanations.

### Test 3: State Requirements
```
Use get_state_requirements for California auto insurance
```

You should get CA-specific insurance minimums.

## Troubleshooting

### "MCP server not found" or "Connection failed"

1. **Verify the absolute path** in your config matches your actual file location
2. **Check Node.js is installed**: `node -v` (should be 18+)
3. **Restart Claude Code** completely
4. **Check logs** in Claude Code console for error messages

### "No results returned" or "Empty response"

1. **Verify Vectorize credentials** in `.env.local`
2. **Check Vectorize pipeline** is active at https://platform.vectorize.io
3. **Confirm data is uploaded** (14 JSON files should be indexed)
4. **Test Vectorize directly** using the main app's RAG features

### "Cannot find module @modelcontextprotocol/sdk"

Run the installation:
```bash
cd mcp-server
npm install
```

If network issues persist, you may need to configure npm registry or use a different network.

## What Gets Searched?

The MCP server queries **14 datasets with 235+ entries**:

### Core Knowledge (6 files)
- 20 coverage type explanations
- 20 insurance terms and definitions
- 20 state requirement guides
- 20 discount types and criteria
- 20 comprehensive FAQs
- 20 negotiation tactics and scripts

### Carrier Intelligence (4 files)
- 15 major carrier profiles (GEICO, State Farm, Progressive, etc.)
- 15 carrier-specific coverage options
- 20 agent selection and evaluation guides
- 15 claim process walkthroughs

### Customer Guidance (4 files)
- 15 life event insurance scenarios
- 15 pricing risk factors
- 15 troubleshooting guides
- 15 money-saving strategies

## Benefits

✅ **Automatic Context** - Claude fetches insurance info as needed during conversations
✅ **Faster Development** - No manual searching through knowledge base
✅ **Accurate Answers** - Direct access to curated insurance data
✅ **Up-to-date** - Queries live Vectorize.io pipeline
✅ **Comprehensive** - All 235+ entries accessible via simple prompts

## Advanced Configuration

### Use Specific Environment Variables

If you want to use different credentials for the MCP server:

```json
{
  "mcpServers": {
    "vectorize-insurance": {
      "command": "node",
      "args": [
        "/Users/daraghmoran/Documents/maven-agentic/v0-insurance-assistant/mcp-server/index.js"
      ],
      "env": {
        "VECTORIZE_IO_API_KEY": "specific_key_for_mcp",
        "VECTORIZE_IO_ORG_ID": "org_id",
        "VECTORIZE_IO_PIPELINE_ID": "pipeline_id"
      }
    }
  }
}
```

### Enable Debug Logging

Edit `index.js` and add:
```javascript
console.error('Debug - Query:', query);
console.error('Debug - Results:', JSON.stringify(results, null, 2));
```

Check Claude Code's console/terminal for debug output.

## Next Steps

1. ✅ Install dependencies: `cd mcp-server && npm install`
2. ✅ Configure Claude Code MCP settings
3. ✅ Restart Claude Code
4. ✅ Test with a search query
5. 🚀 Start using insurance knowledge in your conversations!

For detailed documentation, see `/mcp-server/README.md`
