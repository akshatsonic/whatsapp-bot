const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Create a new client instance with local authentication
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
        ],
    },
    // Pin a stable WhatsApp Web version to avoid breakage
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1015901307-alpha.html',
    },
});

// ─── CONNECTION EVENTS ────────────────────────────────────────────

client.on('qr', (qr) => {
    console.log('\n╔════════════════════════════════╗');
    console.log('║  📱 SCAN QR CODE TO LOGIN      ║');
    console.log('╚════════════════════════════════╝\n');
    console.log('Settings > Linked Devices > Link a Device\n');
    qrcode.generate(qr, { small: true });
    console.log('\nWaiting for authentication...\n');
});

client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Loading: ${percent}% - ${message}`);
});

client.on('authenticated', () => {
    console.log('🔐 [EVENT] authenticated - Session authenticated!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ [EVENT] auth_failure -', msg);
});

client.on('ready', async () => {
    console.log('\n╔════════════════════════════════╗');
    console.log('║  ✅ WhatsApp BOT IS READY!     ║');
    console.log('╚════════════════════════════════╝\n');
    console.log(`📱 Bot Number: ${client.info.wid._serialized}`);
    console.log(`📛 Bot Name:   ${client.info.pushname}`);
    console.log(`Listening for all events...\n`);

    // Keep-alive ping every 30 seconds to prevent Puppeteer from going idle
    setInterval(async () => {
        try {
            const state = await client.getState();
            console.log(`💓 Keep-alive ping - State: ${state} [${new Date().toLocaleTimeString()}]`);
        } catch (err) {
            console.error('❌ Keep-alive ping failed:', err.message);
        }
    }, 30000);
});

// Recover from Puppeteer page crashes
client.on('change_state', async (state) => {
    console.log(`🔄 [EVENT] change_state - State: ${state}`);
    if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
        console.log('⚠️  Conflict detected, trying to take over...');
        await client.takeOver();
    }
});

client.on('disconnected', (reason) => {
    console.log('❌ [EVENT] disconnected - Reason:', reason);
});

// ─── MESSAGE EVENTS ───────────────────────────────────────────────

// Fires for messages received from OTHERS
client.on('message', async (message) => {
    await handleMessage('message (from others)', message);
});

// Fires for ALL messages including ones you send yourself
client.on('message_create', async (message) => {
    await handleMessage('message_create (all messages)', message);
});

// Fires when message is acknowledged (sent/delivered/read)
client.on('message_ack', (message, ack) => {
    const ackMap = { 0: 'PENDING', 1: 'SENT', 2: 'DELIVERED', 3: 'READ', 4: 'PLAYED' };
    console.log(`📬 [EVENT] message_ack - Msg: "${message.body}" | Ack: ${ackMap[ack] || ack}`);
});

// Fires when a message is deleted for everyone
client.on('message_revoke_everyone', (msg, revokedMsg) => {
    console.log(`🗑️  [EVENT] message_revoke_everyone - "${msg.body}" was deleted`);
});

// ─── GROUP EVENTS ─────────────────────────────────────────────────

client.on('group_join', (notification) => {
    console.log(`👋 [EVENT] group_join - ${notification.id.remote}`);
});

client.on('group_leave', (notification) => {
    console.log(`🚪 [EVENT] group_leave - ${notification.id.remote}`);
});

client.on('group_update', (notification) => {
    console.log(`✏️  [EVENT] group_update - ${notification.id.remote}`);
});

// ─── CALL EVENTS ──────────────────────────────────────────────────

client.on('call', (call) => {
    console.log(`📞 [EVENT] call - From: ${call.from}`);
});

// ─── MESSAGE HANDLER ──────────────────────────────────────────────

async function handleMessage(eventName, message) {
    try {
        const chat = await message.getChat();
        const messageText = message.body ? message.body.trim() : '';
        const sender = message.author || message.from || 'Unknown';

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📨 [EVENT: ${eventName}]`);
        console.log(`Time:      ${new Date().toLocaleTimeString()}`);
        console.log(`Chat:      ${chat.isGroup ? `GROUP: ${chat.name}` : 'DM'}`);
        console.log(`From:      ${sender}`);
        console.log(`Body:      "${messageText}"`);
        console.log(`Type:      ${message.type}`);
        console.log(`From me:   ${message.fromMe}`);
        console.log(`Is Group:  ${chat.isGroup}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Only respond in groups, to messages not from the bot itself
        if (!chat.isGroup || message.fromMe) return;

        const hasMota = messageText.toLowerCase().startsWith('@mota') ||
                        messageText.toLowerCase().includes(' @mota');

        if (hasMota) {
            console.log(`🎯 @mota DETECTED - sending reply...`);
            const question = messageText.replace(/@mota\s*/i, '').trim();
            const response = question
                ? `You asked: "${question}"\n\nhello world`
                : 'hello world';

            await message.reply(response);
            console.log('✅ REPLIED!');
        }

    } catch (error) {
        console.error(`❌ Error in handleMessage:`, error.message);
    }
}

// ─── START ────────────────────────────────────────────────────────

console.log('🚀 Starting WhatsApp bot...');
client.initialize();
