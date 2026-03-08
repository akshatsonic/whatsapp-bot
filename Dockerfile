FROM node:22-slim

# Install Chromium and dependencies for Puppeteer/whatsapp-web.js
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app files
COPY . .

# Create directories for persistent data
RUN mkdir -p /app/.wwebjs_auth /app/data

# Run as non-root user for security
RUN useradd -m botuser && \
    chown -R botuser:botuser /app
USER botuser

# Expose no ports (bot doesn't need external access)

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "require('fs').statSync('.wwebjs_auth')" || exit 1

# Start the bot
CMD ["node", "index.js"]
