# State DOI MCP Server - AI SDK Integration Guide

Complete guide for integrating the State DOI MCP server with Vercel AI SDK for streaming AI responses.

## Overview

The State DOI MCP server provides official insurance rates to your AI agent, allowing it to:
- Fetch real rates from state DOI databases during conversations
- Validate quote engine accuracy in real-time
- Provide customers with official state data
- Stream responses with tool calls

## Architecture

```
User Message
     ↓
AI Agent (GPT-4 with streaming)
     ↓
Tool Call: get_official_rates
     ↓
MCP Server (State DOI)
     ↓
DOI Reference Database
     ↓
Stream Response to User
```

## Installation

### 1. Install MCP Server Dependencies

```bash
cd mcp-server/state-doi-server
npm install
```

### 2. Install AI SDK (if not already installed)

```bash
npm install ai @ai-sdk/openai zod
```

## Integration Steps

### Step 1: Update Chat API Route

Modify `app/api/chat/route.ts`:

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { StateDOIMCPClient, createStateDOITools } from '@/lib/mcp-client-state-doi';

export async function POST(req: Request) {
  const { messages, customerProfile } = await req.json();
  
  // Initialize MCP client
  const mcpClient = new StateDOIMCPClient();
  
  // Create AI SDK tools from MCP server
  const tools = createStateDOITools(mcpClient);
  
  try {
    // Stream response with MCP tools
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages: convertToCoreMessages(messages),
      tools,
      maxToolRoundtrips: 5, // Allow AI to call tools multiple times
      system: `You are an insurance assistant with access to official state DOI data.
      
When customers ask about rates, use these tools:
- get_official_insurance_rates: Get actual rates from state insurance departments
- list_available_insurance_states: Check which states have data
- validate_quote_accuracy: Compare our quotes to official rates

Always tell customers when you're using official state data.`,
    });
    
    return result.toAIStreamResponse();
  } finally {
    // Cleanup MCP client
    mcpClient.close();
  }
}
```

### Step 2: Client-Side Streaming

In your React component (`components/chat-interface.tsx`):

```typescript
'use client';

import { useChat } from 'ai/react';

export function ChatInterface({ customerProfile }: { customerProfile: any }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      customerProfile,
    },
    onToolCall: ({ toolCall }) => {
      // Optional: Show tool call UI
      console.log('AI is calling tool:', toolCall.toolName);
    },
  });

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? '👤' : '🤖'} {message.content}
          
          {/* Show tool calls if any */}
          {message.toolInvocations?.map((tool, idx) => (
            <div key={idx} className="tool-call">
              🔧 {tool.toolName}
              {tool.state === 'result' && (
                <pre>{JSON.stringify(tool.result, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>
      ))}
      
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
```

## Usage Examples

### Example 1: Get Official Rates

**User**: "What are the official California rates for my 2015 Tesla?"

**AI**:
1. Calls `get_official_insurance_rates` with:
   ```json
   {
     "state": "CA",
     "customerProfile": {
       "vehicle": { "year": 2015, "make": "Tesla", "model": "Model S" }
     }
   }
   ```

2. Receives official rates and streams response:

**AI Response**:
```
Based on official California Department of Insurance data:

Progressive: $138/month ($1,656/year)
GEICO: $143/month ($1,716/year)
State Farm: $158/month ($1,896/year)
Allstate: $175/month ($2,100/year)

This data is from the official state database, collected on Jan 15, 2025.
These are actual rates, not estimates.
```

### Example 2: Validate Quote Accuracy

**User**: "How accurate are your quotes compared to official rates?"

**AI**:
1. Generates quotes using the rating engine
2. Calls `validate_quote_accuracy` to compare

**AI Response**:
```
I've compared our quotes to official California DOI data:

Progressive:
  Official: $138/mo
  Our Quote: $119/mo
  Difference: -$19 (-13.8%)
  ✅ Within target accuracy (±15%)

GEICO:
  Official: $143/mo
  Our Quote: $95/mo
  Difference: -$48 (-33.6%)
  ❌ Needs calibration

Summary: 50% of carriers are within target accuracy.
```

### Example 3: Multi-State Availability

**User**: "Which states can you get official rates for?"

**AI**:
1. Calls `list_available_insurance_states`

**AI Response**:
```
I currently have official rate data from:

- California (CA): 5 profiles available
  Source: https://interactive.web.insurance.ca.gov/

- New York (NY): 5 profiles available
  Source: https://myportal.dfs.ny.gov/

Total: 2 states with 10 profiles of official data.
More states are being added regularly!
```

## Advanced: Custom Tool Integration

### Add Streaming Progress

```typescript
const result = await streamText({
  model: openai('gpt-4-turbo'),
  messages,
  tools,
  onToolCall: ({ toolCall }) => {
    // Send progress to client
    console.log(`Calling ${toolCall.toolName}...`);
  },
});

return result.toAIStreamResponse({
  onError: (error) => {
    console.error('Streaming error:', error);
  },
});
```

### Add Context from Customer Profile

```typescript
const tools = createStateDOITools(mcpClient);

// Enhance tool context with customer profile
const enhancedTools = {
  ...tools,
  get_official_insurance_rates: {
    ...tools.get_official_insurance_rates,
    execute: async (args) => {
      // Auto-inject customer profile if not provided
      if (!args.customerProfile && customerProfile) {
        args.customerProfile = {
          vehicle: customerProfile.vehicles?.[0],
          location: customerProfile.address,
        };
      }
      return tools.get_official_insurance_rates.execute(args);
    },
  },
};
```

## Best Practices

### 1. Tool Call Optimization

```typescript
// Add instructions to the system prompt
system: `Use get_official_insurance_rates when:
- Customer asks about "official", "actual", or "state" rates
- Customer wants to verify accuracy
- Customer compares to another source

Use validate_quote_accuracy when:
- Customer questions quote accuracy
- You've just generated quotes and want to validate
- Customer asks "how accurate are these?"`,
```

### 2. Error Handling

```typescript
const tools = {
  get_official_insurance_rates: {
    // ... schema
    execute: async (args) => {
      try {
        return await mcpClient.getOfficialRates(args.state, args.customerProfile);
      } catch (error) {
        return `I couldn't fetch official rates right now. ${error.message}`;
      }
    },
  },
};
```

### 3. Response Formatting

```typescript
execute: async (args) => {
  const result = await mcpClient.getOfficialRates(args.state, args.customerProfile);
  
  // Format for better readability
  return `📊 **Official ${result.state} DOI Rates**

Profile: ${result.profile.name}
${result.profile.vehicle}

**Monthly Premiums:**
${Object.entries(result.rates)
  .map(([carrier, rates]) => `• ${carrier}: $${rates.monthly}`)
  .join('\n')}

_Source: ${result.source}_
_Data collected: ${new Date(result.collectedDate).toLocaleDateString()}_`;
}
```

## Testing

### Test MCP Server

```bash
cd mcp-server/state-doi-server
npm test
```

### Test AI Integration

```bash
# Start dev server
npm run dev

# Send test request
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What are the official CA rates for a 2015 Tesla?"
      }
    ],
    "customerProfile": {
      "vehicles": [{ "year": 2015, "make": "Tesla", "model": "Model S" }],
      "address": "San Francisco, CA",
      "state": "CA"
    }
  }'
```

## Deployment

### Vercel

The MCP server runs as a child process, so ensure:

1. Add to `package.json`:
   ```json
   {
     "scripts": {
       "postinstall": "cd mcp-server/state-doi-server && npm install"
     }
   }
   ```

2. Vercel automatically bundles the MCP server with your app

### Environment Variables

No additional environment variables needed - the MCP server uses local data files.

## Monitoring

### Add Logging

```typescript
const mcpClient = new StateDOIMCPClient();

// Log all tool calls
const originalCallTool = mcpClient.callTool.bind(mcpClient);
mcpClient.callTool = async (name, args) => {
  console.log(`[MCP] Calling ${name}:`, JSON.stringify(args));
  const result = await originalCallTool(name, args);
  console.log(`[MCP] Result:`, result);
  return result;
};
```

### Track Usage

```typescript
let toolCallCount = 0;

const tools = createStateDOITools(mcpClient);

Object.keys(tools).forEach(toolName => {
  const original = tools[toolName].execute;
  tools[toolName].execute = async (args) => {
    toolCallCount++;
    console.log(`Tool calls: ${toolCallCount}`);
    return original(args);
  };
});
```

## Next Steps

1. **Add More States**: Run collection scripts for TX, FL, IL
2. **Real-Time Updates**: Set up quarterly DOI data updates
3. **Caching**: Add Redis caching for frequently requested profiles
4. **Analytics**: Track which states are most requested

## Troubleshooting

**Issue**: MCP server not responding
- Check if server is running: `ps aux | grep state-doi-server`
- View logs: Enable DEBUG mode
- Restart: Kill process and reinitialize

**Issue**: Tool calls timing out
- Increase timeout in `mcp-client-state-doi.ts`
- Check data file exists: `data/ca-doi-reference/index.json`
- Verify server has data: `curl http://localhost:3000/api/state-doi/health`

**Issue**: Streaming not working
- Ensure AI SDK version >= 3.0
- Check tool parameters match schema
- Verify response format is correct

---

**You're ready!** The State DOI MCP server is now integrated with streaming AI. 🚀

