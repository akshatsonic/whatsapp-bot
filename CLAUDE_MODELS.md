# Claude Models Guide

## Available Models

### 🚀 Claude 3.5 Haiku (Fastest & Cheapest)
**Model ID:** `claude-3-5-haiku-20241022`

**Best for:**
- Quick, simple responses
- High-volume usage
- Cost optimization
- Fast response times

**Pricing:**
- Input: $1 per million tokens
- Output: $5 per million tokens

**Speed:** ~300-500 tokens/second  
**Cost per response:** ~$0.001-0.005

---

### ⚡ Claude 3.5 Sonnet (Recommended)
**Model ID:** `claude-3-5-sonnet-20241022`

**Best for:**
- General purpose
- Balance of speed & intelligence
- Complex questions
- Most use cases

**Pricing:**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Speed:** ~200-400 tokens/second  
**Cost per response:** ~$0.01-0.03

**✅ This is the default model**

---

### 🎯 Claude 3 Opus (Most Capable)
**Model ID:** `claude-3-opus-20240229`

**Best for:**
- Complex reasoning
- Detailed analysis
- Research tasks
- Maximum quality

**Pricing:**
- Input: $15 per million tokens
- Output: $75 per million tokens

**Speed:** ~100-200 tokens/second  
**Cost per response:** ~$0.05-0.15

---

## How to Change Models

### In `.env` file:
```bash
# Use Haiku (fast & cheap)
CLAUDE_MODEL=claude-3-5-haiku-20241022

# Use Sonnet (balanced, recommended)
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Use Opus (most capable)
CLAUDE_MODEL=claude-3-opus-20240229
```

### Quick Comparison

| Model | Speed | Cost | Intelligence | Best For |
|-------|-------|------|--------------|----------|
| **Haiku** | ⚡⚡⚡ | 💰 | ⭐⭐⭐ | Simple Q&A, high volume |
| **Sonnet** | ⚡⚡ | 💰💰 | ⭐⭐⭐⭐ | General purpose (default) |
| **Opus** | ⚡ | 💰💰💰 | ⭐⭐⭐⭐⭐ | Complex analysis |

## Cost Estimation

Assuming average response is ~500 tokens:

### Haiku
- 1000 messages/day: ~$2-5/day
- Perfect for: High-volume bots

### Sonnet (Default)
- 1000 messages/day: ~$10-30/day
- Perfect for: Most use cases

### Opus
- 1000 messages/day: ~$50-150/day
- Perfect for: Quality-critical applications

## Testing Different Models

Try the same question with different models:

```bash
# Test with Haiku
CLAUDE_MODEL=claude-3-5-haiku-20241022 npm start

# Test with Sonnet
CLAUDE_MODEL=claude-3-5-sonnet-20241022 npm start

# Test with Opus
CLAUDE_MODEL=claude-3-opus-20240229 npm start
```

## Recommendations

### For Personal Use
→ **Sonnet** - Best balance

### For High-Volume Bots
→ **Haiku** - Optimize costs

### For Research/Complex Tasks
→ **Opus** - Maximum intelligence

### For Testing/Development
→ **Haiku** - Cheap, fast iterations

## Switching Models

You can change models anytime:
1. Edit `.env` file
2. Change `CLAUDE_MODEL` value
3. Restart bot: `npm start`
4. No need to rescan QR code!

## Monitor Usage

Track your API usage at:
https://console.anthropic.com/settings/usage

Set billing alerts to avoid surprises!
