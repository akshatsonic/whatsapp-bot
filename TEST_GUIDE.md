# Testing Guide

## Setup Order

### 1. Start WhatsApp MCP Server (Terminal 1)
```bash
cd ~/Documents/projects/open-source/whatsapp-mcp
# Start your MCP server on port 8080
# Make sure it's connected to WhatsApp and authenticated
```

### 2. Configure This Bot (Terminal 2)
```bash
cd ~/Documents/projects/fun_projects/whatsapp-bot

# Edit .env file
nano .env
```

Add:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
WHATSAPP_MCP_URL=http://localhost:8080
```

### 3. Start This Bot
```bash
npm start
```

Expected output:
```
🚀 Starting WhatsApp bot...
🤖 Claude AI integrated (API key found)
🔌 WhatsApp MCP URL: http://localhost:8080
🔍 Checking for saved session in .wwebjs_auth/...
✅ Saved session found! Using existing authentication...
✅ WhatsApp BOT IS READY!
📊 Queue Stats: 0 pending
```

## Testing Flow

### 1. Send Test Message in WhatsApp Group
```
@mota what is 2+2?
```

### 2. Watch Bot Logs
```
🎯 @mota DETECTED in message!
   - Is Group: true
   - From Me: true
   ✅ Adding to queue...
✅ Added to mota_queue: ID 1

🔄 Processing 1 messages from queue...
   📤 Sending to Claude: "what is 2+2?"
   📥 Claude replied: "2 + 2 equals 4...."
   🔌 Sending via MCP: http://localhost:8080
✅ Processed queue item 1 for chat: Your Group Name
✅ Removed from mota_queue: ID 1
```

### 3. Check WhatsApp
You should see bot's reply (quoted to your message):
```
┌─────────────────────────────┐
│ @mota what is 2+2?         │ ← Your message
├─────────────────────────────┤
│ 2 + 2 equals 4.            │ ← Bot's reply via MCP
│                             │
│ This is a basic arithmetic  │
│ addition problem...         │
└─────────────────────────────┘
```

## Verify MCP Connection

Test MCP endpoint manually:
```bash
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

Should return available tools including `send_message`.

## Check Database Queue

```bash
node check_db.js
```

Should show:
- Queue statistics
- Pending/processed messages

## Troubleshooting

### Bot receives but doesn't respond
- Check MCP server is running: `curl http://localhost:8080`
- Check bot logs for MCP connection errors
- Verify `WHATSAPP_MCP_URL` in .env

### "Cannot connect to WhatsApp MCP"
```bash
# Check if MCP is running
lsof -i :8080

# Check MCP logs for errors
# Make sure MCP is authenticated to WhatsApp
```

### Claude API errors
- Verify API key in .env
- Check Anthropic Console for usage/errors
- Check rate limits

## Success Indicators

✅ Bot starts without errors  
✅ MCP connection confirmed in logs  
✅ @mota messages added to queue  
✅ Claude API called successfully  
✅ Reply sent via MCP  
✅ Message appears in WhatsApp (quoted)  
✅ Queue item removed after processing  

## Debug Mode

For verbose logging, add to your bot:
```javascript
// In index.js, add more logging
console.log('Full MCP payload:', JSON.stringify(payload, null, 2));
console.log('MCP response:', JSON.stringify(response.data, null, 2));
```
