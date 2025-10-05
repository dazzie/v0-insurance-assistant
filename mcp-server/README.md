# Vectorize MCP Server

Model Context Protocol (MCP) server for querying the Vectorize.io insurance knowledge base directly from Claude Code.

## Overview

This MCP server provides four tools for accessing insurance knowledge:

1. **search_insurance_knowledge** - General search across 235+ insurance entries
2. **get_coverage_explanation** - Get detailed coverage type explanations
3. **get_state_requirements** - Retrieve state-specific insurance requirements
4. **get_discount_opportunities** - Find applicable insurance discounts

## Installation

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

This will install:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `@vectorize-io/vectorize-client` - Vectorize.io API client
- `dotenv` - Environment variable management

### 2. Configure Environment Variables

The server reads credentials from `../.env.local`. Ensure these variables are set:

```env
VECTORIZE_IO_API_KEY=your_api_key_here
VECTORIZE_IO_ORG_ID=your_org_id_here
VECTORIZE_IO_PIPELINE_ID=your_pipeline_id_here
```

Alternatively, you can use `TOKEN` instead of `VECTORIZE_IO_API_KEY`.

### 3. Configure Claude Code

Add the MCP server to your Claude Code configuration:

**Option A: Manual Configuration**

Edit your Claude Code settings and add:

```json
{
  "mcpServers": {
    "vectorize-insurance": {
      "command": "node",
      "args": [
        "/Users/daraghmoran/Documents/maven-agentic/v0-insurance-assistant/mcp-server/index.js"
      ],
      "env": {
        "VECTORIZE_IO_API_KEY": "your_api_key_here",
        "VECTORIZE_IO_ORG_ID": "your_org_id_here",
        "VECTORIZE_IO_PIPELINE_ID": "your_pipeline_id_here"
      }
    }
  }
}
```

**Option B: Use Environment Variables**

Reference your existing `.env.local` variables:

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

### 4. Restart Claude Code

After adding the configuration, restart Claude Code to load the MCP server.

## Available Tools

### search_insurance_knowledge

Search the entire insurance knowledge base.

**Parameters:**
- `query` (string, required) - Search query
- `limit` (number, optional) - Max results (default: 5)

**Example:**
```
Query: "What is comprehensive coverage?"
Query: "California auto insurance requirements"
Query: "How to negotiate lower premiums"
```

### get_coverage_explanation

Get detailed explanation of specific coverage types.

**Parameters:**
- `coverageType` (string, required) - Coverage type name

**Examples:**
```
coverageType: "comprehensive"
coverageType: "collision"
coverageType: "liability"
coverageType: "uninsured motorist"
```

### get_state_requirements

Retrieve state-specific insurance requirements.

**Parameters:**
- `state` (string, required) - State abbreviation or full name
- `insuranceType` (string, optional) - Insurance type (default: "auto")

**Examples:**
```
state: "CA", insuranceType: "auto"
state: "California", insuranceType: "home"
state: "TX"
```

### get_discount_opportunities

Find applicable insurance discounts.

**Parameters:**
- `customerProfile` (string, required) - Customer profile description

**Examples:**
```
customerProfile: "good driver, multiple policies, safety features"
customerProfile: "young driver, good student, defensive driving course"
customerProfile: "homeowner, bundled policies, claim-free"
```

## Testing the Server

### Local Testing

Run the server directly to test:

```bash
npm start
# or
npm run dev  # with auto-reload on changes
```

The server will output:
```
Vectorize MCP Server running on stdio
Available tools:
  - search_insurance_knowledge
  - get_coverage_explanation
  - get_state_requirements
  - get_discount_opportunities
```

### Testing in Claude Code

Once configured, you can use the tools in Claude Code:

```
Use the search_insurance_knowledge tool to find information about "comprehensive coverage"

Use the get_state_requirements tool for state="CA" and insuranceType="auto"

Use the get_discount_opportunities tool with customerProfile="good driver, multiple policies"
```

## Knowledge Base Coverage

The Vectorize.io knowledge base contains **235+ entries** across **14 datasets**:

### Core Insurance Knowledge (6 files)
1. Coverage explanations (20 types)
2. Terminology glossary (20 terms)
3. State requirements (20 states)
4. Discount guide (20 types)
5. FAQs (20 Q&As)
6. Negotiation strategies (20 tactics)

### Carrier Intelligence (4 files)
7. Carrier profiles (15 carriers)
8. Carrier coverage options (15 entries)
9. Agent directory guides (20 entries)
10. Claim processes (15 types)

### Customer Guidance (4 files)
11. Life event scenarios (15 scenarios)
12. Risk factors & pricing (15 factors)
13. Troubleshooting (15 issues)
14. Money-saving tips (15 strategies)

## Troubleshooting

### Server Won't Start

**Error: Cannot find module '@modelcontextprotocol/sdk'**
```bash
cd mcp-server
npm install
```

**Error: ENOTFOUND vectorize.io**
- Check your internet connection
- Verify Vectorize.io credentials in `.env.local`
- Ensure API key, org ID, and pipeline ID are correct

### No Results Returned

**Check Vectorize pipeline:**
1. Visit https://platform.vectorize.io
2. Verify your pipeline ID
3. Confirm data has been uploaded and indexed
4. Check pipeline status is "active"

**Verify credentials:**
```bash
# Check .env.local contains:
cat ../.env.local | grep VECTORIZE
```

### Claude Code Not Detecting Server

1. Restart Claude Code completely
2. Check MCP configuration JSON syntax is valid
3. Verify absolute path to `index.js` is correct
4. Check terminal/console for MCP server errors

## Development

### Adding New Tools

Edit `index.js` and add to the tools array in `ListToolsRequestSchema` handler:

```javascript
{
  name: 'my_new_tool',
  description: 'Description of what it does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Parameter description'
      }
    },
    required: ['param1']
  }
}
```

Then add the handler in `CallToolRequestSchema`:

```javascript
case 'my_new_tool': {
  const { param1 } = args;
  // Implementation
  return { content: [...] };
}
```

### Debugging

Enable verbose logging by setting:

```javascript
// In index.js
console.error('Debug:', JSON.stringify(results, null, 2));
```

## Architecture

```
┌─────────────────┐
│   Claude Code   │
└────────┬────────┘
         │ MCP Protocol (stdio)
         │
┌────────▼────────┐
│   MCP Server    │
│   (index.js)    │
└────────┬────────┘
         │ REST API
         │
┌────────▼────────┐
│  Vectorize.io   │
│  Knowledge Base │
│   (235+ docs)   │
└─────────────────┘
```

## License

MIT
