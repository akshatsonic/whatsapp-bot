# WhatsApp Bot with Claude AI (@mota)

A WhatsApp bot that uses Claude AI to respond to @mota mentions in group chats. Integrates with WhatsApp MCP server for message sending.

## Architecture

```
WhatsApp Group → whatsapp-web.js (receives) → Bot → Claude AI
                                               ↓
                                          MCP Server → WhatsApp (sends)
```

## Features

- 🤖 **Claude AI Integration** - Powered by Anthropic's Claude 3.5 Sonnet
- 📥 **Queue System** - Processes @mota mentions every 5 seconds
- 🔌 **WhatsApp MCP Integration** - Uses MCP server for sending messages
- 💬 **Quoted Replies** - Responds with messages linked to the original question
- 💾 **SQLite Queue** - Persistent queue with retry on failure
- 🔐 **Session Persistence** - No QR code scanning after first login

## How It Works

1. **Receive**: Bot listens via `whatsapp-web.js` for `@mota` mentions
2. **Queue**: Message added to SQLite queue
3. **Process**: Every 5 seconds:
   - Extract question from queue
   - Send to Claude AI
   - Get Claude's response
4. **Send**: Use WhatsApp MCP to send reply (quoted to original message)
5. **Complete**: Remove from queue

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Anthropic API Key

1. Go to https://console.anthropic.com/settings/keys
2. Create a new API key
3. Copy the key

### 3. Start WhatsApp MCP Server

The bot requires a WhatsApp MCP server for sending messages:

```bash
# In another terminal, start your WhatsApp MCP server on port 8080
# Example: whatsapp-mcp with streamable HTTP transport
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Anthropic API Key (required)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# WhatsApp MCP Server URL (optional, default: http://localhost:8080)
WHATSAPP_MCP_URL=http://localhost:8080

# Claude Model (optional, default: sonnet)
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

Or copy from the example:
```bash
cp .env.example .env
# Then edit .env and add your settings
```

### 5. Start the Bot

```bash
npm start
```

**First time:**
- Scan QR code when prompted
- Session will be saved for future starts

**Subsequent starts:**
- No QR code needed!
- Bot loads saved session automatically

## Usage

### In WhatsApp Group Chat:

```
User: @mota what is the capital of France?
Bot: [Quoted reply via MCP] Paris is the capital of France...

User: @mota explain quantum computing
Bot: [Quoted reply via MCP] Quantum computing is a type of computation that...
```

### Detection Patterns:

- `@mota <question>` - Direct question
- `hey @mota what's up` - Embedded mention
- Must be in a **GROUP chat** (DMs are ignored)

## MCP Integration

### Why MCP?

Using WhatsApp MCP server for sending provides:
- ✅ Separation of concerns (receive vs send)
- ✅ Better reliability and error handling
- ✅ Can reuse existing MCP infrastructure
- ✅ Supports quoted replies via `quoted_id` parameter

### MCP Message Format

The bot sends messages using JSON-RPC 2.0:

```json
{
  "jsonrpc": "2.0",
  "id": 1234567890,
  "method": "tools/call",
  "params": {
    "name": "send_message",
    "arguments": {
      "jid": "916388394774-1578743792@g.us",
      "message": "Claude's response here",
      "quoted_id": "original_message_id"
    }
  }
}
```

### MCP Server Requirements

Your WhatsApp MCP server must:
1. ✅ Expose HTTP endpoint (default: http://localhost:8080)
2. ✅ Support `send_message` tool
3. ✅ Accept `jid`, `message`, and `quoted_id` parameters
4. ✅ Be authenticated and connected to WhatsApp

## Database

The bot uses SQLite to manage the queue:

**Location:** `./whatsapp_bot.db`

**Schema:**
```sql
mota_queue:
  - id (auto-increment)
  - message_id (unique)
  - chat_id, chat_name, group_id
  - sender_id, sender_name
  - message_text, question
  - timestamp, status (pending/processing)
```

**Check Queue:**
```bash
node check_db.js
```

## Configuration

### Choose Your Claude Model

The bot supports three Claude models:

| Model | Speed | Cost | Best For |
|-------|-------|------|----------|
| **Haiku** (`claude-3-5-haiku-20241022`) | ⚡⚡⚡ | $ | Simple Q&A, high volume |
| **Sonnet** (`claude-3-5-sonnet-20241022`) | ⚡⚡ | $$ | General purpose **(default)** |
| **Opus** (`claude-3-opus-20240229`) | ⚡ | $$$ | Complex reasoning |

**Change model in `.env`:**
```bash
# Fast & cheap
CLAUDE_MODEL=claude-3-5-haiku-20241022

# Balanced (default)
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Most capable
CLAUDE_MODEL=claude-3-opus-20240229
```

See **CLAUDE_MODELS.md** for detailed comparison and cost estimates.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | ✅ Yes | - | Your Anthropic API key |
| `WHATSAPP_MCP_URL` | ⚠️ Optional | `http://localhost:8080` | WhatsApp MCP server URL |
| `CLAUDE_MODEL` | ⚠️ Optional | `claude-3-5-sonnet-20241022` | Claude model to use (haiku/sonnet/opus) |

### Queue Processing Interval

Default: Every 5 seconds

To change, edit `index.js`:
```javascript
setInterval(() => processMotaQueue(), 5000); // milliseconds
```

### Max Tokens

Default: 1024 tokens per response

To change, edit `index.js`:
```javascript
max_tokens: 1024, // increase for longer responses
```

## File Structure

```
whatsapp-bot/
├── index.js           # Main bot logic
├── db.js              # Database management
├── check_db.js        # Queue inspection tool
├── .env               # API keys & config (gitignored)
├── .env.example       # Template for .env
├── package.json       # Dependencies
├── whatsapp_bot.db    # SQLite database (gitignored)
└── .wwebjs_auth/      # WhatsApp session (gitignored)
```

## Troubleshooting

### "ANTHROPIC_API_KEY not found"
- Make sure `.env` file exists in project root
- Check that API key is set: `ANTHROPIC_API_KEY=sk-...`
- Restart the bot after adding the key

### "Cannot connect to WhatsApp MCP"
- Make sure your WhatsApp MCP server is running
- Check the URL in `.env`: `WHATSAPP_MCP_URL=http://localhost:8080`
- Verify MCP server is authenticated and connected

### Bot not responding to @mota
- Make sure it's a **group chat** (not DM)
- Check queue: `node check_db.js`
- Look at bot logs for error messages
- Verify both WhatsApp sessions are active (receiving & MCP)

### QR code appearing every time
- Check if `.wwebjs_auth/` folder exists
- Don't delete this folder
- Make sure bot shuts down gracefully (Ctrl+C)

## API Costs

Anthropic Claude pricing (as of 2024):
- **Claude 3.5 Sonnet**: ~$3 per million input tokens, ~$15 per million output tokens
- Average message: ~$0.01-0.03 per response

Monitor usage: https://console.anthropic.com/settings/usage

## Development

### Debug Queue
```bash
node check_db.js
```

### Test MCP Connection
```bash
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "send_message",
      "arguments": {
        "jid": "YOUR_CHAT_ID",
        "message": "Test message"
      }
    }
  }'
```

### Clear Queue
```bash
sqlite3 whatsapp_bot.db "DELETE FROM mota_queue;"
```

### Reset Everything
```bash
rm -rf whatsapp_bot.db .wwebjs_auth/
npm start
# Will need to scan QR code again
```

## License

ISC
