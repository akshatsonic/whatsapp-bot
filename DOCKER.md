# Docker Deployment Guide

## Prerequisites

- Docker installed (20.10+)
- Docker Compose installed (2.0+)
- `.env` file configured with your credentials

## Quick Start

### 1. Configure Environment

Make sure your `.env` file has all required variables:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Optional (with defaults)
WHATSAPP_MCP_URL=http://localhost:8080/mcp/minkushibubabu
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

### 2. Build and Start

```bash
# Build and start in detached mode
docker-compose up -d --build

# Or just start if already built
docker-compose up -d
```

### 3. First Time Setup (QR Code)

On first run, you need to scan the WhatsApp QR code:

```bash
# View logs to see QR code
docker-compose logs -f whatsapp-bot
```

Scan the QR code with WhatsApp (Settings > Linked Devices > Link a Device)

Once authenticated, the session is saved in a Docker volume.

## Common Commands

### View Logs
```bash
# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# View specific service
docker-compose logs -f whatsapp-bot
```

### Restart Bot
```bash
docker-compose restart
```

### Stop Bot
```bash
docker-compose stop
```

### Start Bot
```bash
docker-compose start
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Complete Cleanup (removes volumes - WILL DELETE SESSION!)
```bash
docker-compose down -v
```

### Stop Without Removing Volumes (keeps session)
```bash
docker-compose down
```

## Check Bot Status

```bash
# Check if container is running
docker-compose ps

# Check container health
docker inspect whatsapp-bot --format='{{.State.Health.Status}}'

# Execute commands inside container
docker-compose exec whatsapp-bot node check_db.js
```

## Database Access

```bash
# Check queue status
docker-compose exec whatsapp-bot node check_db.js

# Access SQLite database
docker-compose exec whatsapp-bot sqlite3 whatsapp_bot.db "SELECT * FROM mota_queue;"
```

## Volumes

The bot uses Docker volumes to persist data:

- `whatsapp-auth`: WhatsApp session data (.wwebjs_auth/)
- `whatsapp-data`: Application data
- `./whatsapp_bot.db`: SQLite database (mounted from host)

### Backup Session Data

```bash
# Create backup of WhatsApp session
docker run --rm -v whatsapp-bot_whatsapp-auth:/data -v $(pwd):/backup \
  alpine tar czf /backup/whatsapp-session-backup.tar.gz -C /data .

# Restore from backup
docker run --rm -v whatsapp-bot_whatsapp-auth:/data -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/whatsapp-session-backup.tar.gz"
```

## Troubleshooting

### QR Code Not Showing
```bash
# Make sure container is running
docker-compose ps

# Check logs for errors
docker-compose logs --tail=50

# Restart if needed
docker-compose restart
```

### "Session Expired" - Need to Re-scan QR
```bash
# Remove old session and restart
docker-compose down
docker volume rm whatsapp-bot_whatsapp-auth
docker-compose up -d
docker-compose logs -f
```

### Bot Not Responding
```bash
# Check logs
docker-compose logs -f

# Check if MCP is accessible
docker-compose exec whatsapp-bot node test_mcp.js

# Restart bot
docker-compose restart
```

### High Memory Usage
```bash
# Check resource usage
docker stats whatsapp-bot

# Adjust limits in docker-compose.yml if needed
# (See deploy.resources section)
```

### Permission Errors
```bash
# Fix ownership (run on host)
sudo chown -R 1000:1000 .wwebjs_auth/ whatsapp_bot.db
```

## Production Deployment

### Using Host Network (for localhost MCP)

If your MCP server is on `localhost`, uncomment in `docker-compose.yml`:

```yaml
network_mode: host
```

Then update `.env`:
```bash
WHATSAPP_MCP_URL=http://localhost:8080/mcp/minkushibubabu
```

### Running on Remote Server

1. Copy project to server:
   ```bash
   scp -r . user@server:/path/to/whatsapp-bot/
   ```

2. SSH into server and start:
   ```bash
   cd /path/to/whatsapp-bot/
   docker-compose up -d
   ```

3. View QR code via logs:
   ```bash
   docker-compose logs -f
   ```

### Auto-restart on System Reboot

The `restart: unless-stopped` policy in docker-compose.yml ensures the bot automatically restarts on system reboot.

### Update Bot Code

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

## Environment Variables

All environment variables from `.env` are loaded into the container:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | ✅ Yes | - | Claude API key |
| `WHATSAPP_MCP_URL` | ⚠️ Optional | `http://localhost:8080` | MCP server URL |
| `CLAUDE_MODEL` | ⚠️ Optional | `claude-3-5-sonnet-20241022` | Claude model |
| `TZ` | ⚠️ Optional | `Asia/Kolkata` | Timezone |
| `NODE_ENV` | ⚠️ Optional | `production` | Node environment |

## Security Notes

- Container runs as non-root user (`botuser`)
- No ports are exposed (bot doesn't need external access)
- Session data is isolated in Docker volumes
- Use `no-new-privileges` security option
- Resource limits prevent runaway processes

## Logs Location

Inside container: `/app/` (stdout/stderr captured by Docker)

View with: `docker-compose logs`

## Performance Tuning

Adjust in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'      # Increase CPU limit
      memory: 2G       # Increase memory limit
```

## Complete Reset

To start fresh (will require QR scan again):

```bash
# Stop and remove everything
docker-compose down -v

# Remove database
rm whatsapp_bot.db

# Start fresh
docker-compose up -d --build
docker-compose logs -f
```
