#!/usr/bin/env node
require('dotenv').config();
const MCPClient = require('./mcp_client');

async function testMCP() {
    const mcpUrl = process.env.WHATSAPP_MCP_URL || 'http://localhost:8080';
    
    console.log('🧪 Testing MCP Connection');
    console.log('='.repeat(60));
    console.log(`URL: ${mcpUrl}\n`);

    const client = new MCPClient(mcpUrl);

    try {
        console.log('1️⃣ Testing tools/list...\n');
        const tools = await client.getTools();
        console.log(`\n✅ SUCCESS! Found ${tools.length} tools:`);
        tools.forEach((tool, i) => {
            console.log(`   ${i + 1}. ${tool.name} - ${tool.description}`);
        });

    } catch (error) {
        console.error('\n❌ FAILED:', error.message);
        console.error('\n💡 Possible issues:');
        console.error('   - MCP server not running');
        console.error('   - Wrong URL in WHATSAPP_MCP_URL');
        console.error('   - MCP server not configured for HTTP transport');
        console.error('   - MCP endpoint expects different payload format');
        process.exit(1);
    }

    console.log('\n' + '='.repeat(60));
}

testMCP();
