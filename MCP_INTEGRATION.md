# MCP Integration Guide

## How It Works

This bot uses the **Model Context Protocol (MCP)** to give Claude direct access to WhatsApp tools.

### Architecture

```
┌─────────────┐
│  WhatsApp   │ (receives message)
└──────┬──────┘
       │ @mota detected
       ↓
┌─────────────┐
│  Bot Queue  │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│  Claude API + MCP Tools     │
│  - User question            │
│  - Available: send_message  │
│  - Claude answers & uses    │
│    send_message tool        │
└──────┬──────────────────────┘
       │ tool_use
       ↓
┌─────────────┐
│ MCP Server  │ (executes send_message)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  WhatsApp   │ (sends reply, quoted)
└─────────────┘
```

## Key Difference from Previous Version

### ❌ Old Way (Direct HTTP):
```javascript
// Bot manually calls MCP
await axios.post(mcpUrl, {
  method: 'tools/call',
  params: { name: 'send_message', ... }
});
```

### ✅ New Way (MCP Tools):
```javascript
// Bot gives Claude access to MCP tools
await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  tools: mcpTools, // ← Claude can use these
  messages: [{ role: 'user', content: question }]
});

// Claude decides to use send_message tool
// Bot executes Claude's tool calls
```

## Benefits

1. **Claude in Control**: Claude decides when and how to use tools
2. **Better Context**: Claude understands what tools are available
3. **Error Handling**: Claude can adapt if tools fail
4. **Flexibility**: Claude can use multiple tools if needed
5. **Natural Flow**: More like having a conversation with tools

## System Prompt

The bot gives Claude this instruction:

```
You are a helpful WhatsApp bot. A user has asked you a question.

IMPORTANT: After answering, you MUST use the send_message tool 
to send your response to WhatsApp.

Parameters:
- jid: "group-id@g.us"
- message: Your answer
- quoted_id: "original-msg-id"
```

This tells Claude:
1. Answer the user's question
2. Use the `send_message` tool with the answer

## Tool Discovery

At startup, the bot:

```javascript
// Fetch tools from MCP server
const tools = await mcpClient.getTools();
// Returns: [
//   { name: 'send_message', description: '...', input_schema: {...} },
//   { name: 'read_chat', ... },
//   ...
// ]
```

These tools are then passed to Claude on every request.

## Tool Execution Loop

```javascript
// 1. Send question to Claude with tools
response = await anthropic.messages.create({ tools, messages });

// 2. Check if Claude wants to use tools
while (response.stop_reason === 'tool_use') {
  
  // 3. Execute each tool Claude requested
  for (const toolUse of response.content) {
    result = await mcpClient.executeTool(toolUse.name, toolUse.input);
  }
  
  // 4. Send results back to Claude
  response = await anthropic.messages.create({
    messages: [...history, toolResults]
  });
}
```

## MCP Server Requirements

Your WhatsApp MCP server must:

1. **Expose `/tools/list` endpoint:**
   ```json
   {
     "jsonrpc": "2.0",
     "method": "tools/list",
     "result": {
       "tools": [
         {
           "name": "send_message",
           "description": "Send a WhatsApp message",
           "inputSchema": {
             "type": "object",
             "properties": {
               "jid": { "type": "string" },
               "message": { "type": "string" },
               "quoted_id": { "type": "string" }
             }
           }
         }
       ]
     }
   }
   ```

2. **Expose `/tools/call` endpoint:**
   ```json
   {
     "jsonrpc": "2.0",
     "method": "tools/call",
     "params": {
       "name": "send_message",
       "arguments": {
         "jid": "...",
         "message": "...",
         "quoted_id": "..."
       }
     }
   }
   ```

## Testing MCP Connection

### 1. Test tools/list:
```bash
curl -X POST http://localhost:8080/mcp/minkushibubabu \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

Expected: List of available tools

### 2. Test tools/call:
```bash
curl -X POST http://localhost:8080/mcp/minkushibubabu \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "send_message",
      "arguments": {
        "jid": "your-chat-id@g.us",
        "message": "Test message"
      }
    }
  }'
```

Expected: Message sent successfully

## Troubleshooting

### "Failed to fetch MCP tools"
- Check MCP server is running: `lsof -i :8080`
- Verify URL in .env: `WHATSAPP_MCP_URL=http://localhost:8080/mcp/...`
- Test with curl command above

### "Claude wants to use 0 tools"
- Check system prompt is correct
- Verify tools are loaded: see startup logs
- Try with Sonnet (better at tool use than Haiku)

### "Tool execution failed"
- Check MCP server logs for errors
- Verify tool parameters are correct
- Make sure MCP session is authenticated

### "Request failed with status code 400"
- Wrong MCP URL format
- Missing required tool parameters
- MCP server not accepting the request

## Environment Variables

```bash
# Full MCP URL including path
WHATSAPP_MCP_URL=http://localhost:8080/mcp/minkushibubabu

# Use Sonnet for better tool use
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

## Advantages of This Approach

1. **Agentic**: Claude makes decisions about tool use
2. **Flexible**: Can add more MCP tools without code changes
3. **Robust**: Built-in retry and error handling
4. **Standard**: Uses official MCP protocol
5. **Scalable**: Easy to add more tools (read_chat, etc.)

## Next Steps

Once this works, you can:
- Add more MCP tools (read messages, get contacts, etc.)
- Let Claude decide which tool to use based on context
- Build complex multi-step workflows
- Have Claude analyze chat history before responding
