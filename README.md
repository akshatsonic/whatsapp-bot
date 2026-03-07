# WhatsApp Group Mention Bot

A simple WhatsApp bot that responds to mentions in group chats with "hello world".

## Features

- Responds to @mota mentions in WhatsApp group chats
- Works with your personal WhatsApp account (linked via QR code)
- Built with whatsapp-web.js
- Replies are linked to the original message (shows as a reply thread)
- Extracts and echoes back the question asked
- Simple "hello world" response (easily customizable)

## Prerequisites

- Node.js (v14 or higher)
- WhatsApp account on your phone
- Your phone connected to the internet

## Installation

1. Install dependencies:
```bash
npm install
```

## Setup

1. The bot will be linked to your WhatsApp account via QR code
2. When you run the bot for the first time, it will display a QR code
3. Scan the QR code using your WhatsApp account

## Running the Bot

1. Start the bot:
```bash
npm start
```

2. A QR code will appear in your terminal

3. Open WhatsApp on your phone:
   - Go to Settings > Linked Devices
   - Tap "Link a Device"
   - Scan the QR code displayed in your terminal

4. Once connected, the bot will display "WhatsApp bot is ready!"

5. In any group chat, mention the bot using `@mota` and ask your question:
   ```
   @mota what time is the meeting?
   ```

6. The bot will reply with a linked message showing your question and "hello world"

## How It Works

- The bot listens to all messages in groups where it's a member
- When a message contains `@mota`, the bot detects the mention
- It extracts the question/text after @mota
- It replies to the original message (as a linked reply/thread) with the question and "hello world"

## Session Persistence

The bot uses `LocalAuth` strategy, which saves session data in a `.wwebjs_auth` folder. This means:
- You only need to scan the QR code once
- The bot will stay authenticated across restarts
- If you want to logout, delete the `.wwebjs_auth` folder

## Customization

### Change the trigger word
To respond to a different trigger (instead of @mota), edit line 12-13 in `index.js`:
```javascript
if (messageText.startsWith('@mota') || messageText.includes(' @mota')) {
```
Replace `@mota` with your desired trigger word.

### Change the response
To customize the bot's response, edit line 20-24 in `index.js`:
```javascript
const response = question
    ? `You asked: "${question}"\n\nhello world`
    : 'hello world';
```

Replace 'hello world' with your desired response.

## Important Notes

- The bot must remain running to respond to messages
- Your phone must have WhatsApp linked to the same device (via Linked Devices)
- The bot can only respond in groups where you're a member
- Keep the terminal/process running in the background
- The bot will only respond to messages starting with `@mota`
- Replies will appear as linked messages (replies) to the original question

## Troubleshooting

- **QR code not appearing**: Make sure you have a stable internet connection
- **Authentication failed**: Try deleting the `.wwebjs_auth` folder and scanning again
- **Bot not responding**: Check that:
  - `npm start` is still running
  - You're using `@mota` in your message
  - Check the terminal for error messages
- **WhatsApp Linked Devices not working**: Make sure Linked Devices is enabled in your WhatsApp Settings
- **"Cannot find module" error**: Run `npm install` again
