# Error Handling Guide

## Overview

When anything breaks during message processing, the bot will:
1. ✅ Send an error notification to WhatsApp (quoted to original message)
2. ✅ Remove the message from queue (no infinite retries)
3. ✅ Log detailed error information to console

## Error Types & Messages

### 🔑 API Key Issues

**Triggers:** 
- Missing ANTHROPIC_API_KEY
- Invalid API key
- Expired key

**User sees:**
```
❌ Sorry, something went wrong:

🔑 API key issue. Please contact the bot administrator.
```

**Admin action:** Check `.env` file, verify API key

---

### ⏱️ Rate Limits

**Triggers:**
- Too many requests to Claude API
- HTTP 429 errors
- "rate limit" in error message

**User sees:**
```
❌ Sorry, something went wrong:

⏱️ Too many requests. Please try again in a few minutes.
```

**Admin action:** Wait for rate limit to reset, consider upgrading plan

---

### 🔌 Connection Issues

**Triggers:**
- MCP server unreachable
- Network errors
- Connection refused
- "Cannot connect to MCP"

**User sees:**
```
❌ Sorry, something went wrong:

🔌 Connection issue. The bot is temporarily unavailable.
```

**Admin action:** 
- Check MCP server is running
- Verify WHATSAPP_MCP_URL in .env
- Check network connectivity

---

### ⏱️ Timeout Errors

**Triggers:**
- Claude API timeout
- MCP tool execution timeout
- Long-running requests

**User sees:**
```
❌ Sorry, something went wrong:

⏱️ Request timed out. Please try with a simpler question.
```

**Admin action:** 
- Check if question is too complex
- Consider increasing max_tokens
- Verify MCP server response time

---

### ⚠️ Other Errors

**Triggers:**
- Unknown errors
- Unexpected exceptions
- Any error not matching above patterns

**User sees:**
```
❌ Sorry, something went wrong:

⚠️ [Actual error message]

Please try again later.
```

**Admin action:** Check console logs for full stack trace

---

## Console Logs

### Successful Processing
```
🔄 Processing 1 messages from queue...
   📤 Processing: "what is AI?"
   🤖 Claude responded with 2 content blocks
   🔧 Claude wants to use 1 tool(s)
   🔌 Executing: send_message
   ✅ Tool executed successfully
✅ Processed queue item 1 for chat: My Group
✅ Removed from mota_queue: ID 1
```

### Failed Processing
```
🔄 Processing 1 messages from queue...
   📤 Processing: "what is AI?"
❌ Error processing queue item 1: Cannot connect to MCP at http://localhost:8080. Is it running?
   Stack: Error: Cannot connect to MCP at http://localhost:8080
       at MCPClient.executeTool (mcp_client.js:45:19)
       at processMotaQueue (index.js:250:35)
   📱 Error notification sent to WhatsApp
   🗑️  Removed failed item from queue
```

---

## Behavior Comparison

### Before Error Handling:
```
Error occurs → Message stays in queue → Retry forever → Queue clogs up
User: ❓ (no feedback, waits forever)
```

### After Error Handling:
```
Error occurs → Send error to WhatsApp → Remove from queue → Ready for next
User: ✅ (gets immediate feedback, can try again)
```

---

## Testing Error Scenarios

### Test Connection Error:
```bash
# Stop MCP server
# Send @mota message
# Should see connection error in WhatsApp
```

### Test Rate Limit:
```bash
# Send many @mota messages quickly
# Should see rate limit error after threshold
```

### Test API Key Error:
```bash
# Set invalid ANTHROPIC_API_KEY in .env
# Restart bot
# Send @mota message
# Should see API key error
```

---

## Monitoring

### Check Queue Status:
```bash
node check_db.js
```

Should show 0 pending items if errors are handled correctly.

### Check Logs:
```bash
# Look for error patterns
grep "❌ Error processing" logs.txt

# Count error types
grep "Connection issue" logs.txt | wc -l
```

---

## Best Practices

1. **Monitor Errors**: Set up alerts for repeated errors
2. **Check MCP**: Ensure MCP server is always running
3. **API Limits**: Monitor Claude API usage
4. **User Feedback**: Errors messages guide users on what to do
5. **No Retries**: Failed messages removed to prevent queue backup

---

## Fallback Behavior

If error notification fails to send:
```
❌ Error processing queue item 1: Original error
   ⚠️  Failed to send error notification: MCP error
   🗑️  Removed failed item from queue
```

The message is still removed from queue to prevent infinite loops.

---

## Debug Mode

For more detailed error info, check:
1. Console logs (full stack traces)
2. MCP server logs
3. Claude API dashboard
4. Database queue status (`node check_db.js`)
