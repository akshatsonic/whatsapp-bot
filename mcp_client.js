class MCPClient {
    constructor(mcpUrl) {
        this.mcpUrl = mcpUrl;
        this.client = null;
        this.tools = null;
        this.connected = false;
        this.SDK = null;
    }

    /**
     * Load the MCP SDK (ESM)
     */
    async loadSDK() {
        if (this.SDK) return;
        
        try {
            // Dynamically import ESM modules
            const clientModule = await import('@modelcontextprotocol/sdk/client/index.js');
            const transportModule = await import('@modelcontextprotocol/sdk/client/streamableHttp.js');
            
            this.SDK = {
                Client: clientModule.Client,
                StreamableHTTPClientTransport: transportModule.StreamableHTTPClientTransport
            };
        } catch (error) {
            console.error('❌ Failed to load MCP SDK:', error.message);
            throw error;
        }
    }

    /**
     * Connect to MCP server using StreamableHTTPClientTransport
     */
    async connect() {
        if (this.connected) return;

        try {
            console.log(`🔌 Connecting to MCP server: ${this.mcpUrl}`);

            // Load SDK first
            await this.loadSDK();

            // Create transport
            const transport = new this.SDK.StreamableHTTPClientTransport(
                new URL(this.mcpUrl)
            );

            // Create MCP client
            this.client = new this.SDK.Client({
                name: "whatsapp-bot",
                version: "1.0.0"
            }, {
                capabilities: {}
            });

            // Connect
            await this.client.connect(transport);
            this.connected = true;

            console.log(`✅ Connected to MCP server`);
        } catch (error) {
            console.error(`❌ Failed to connect to MCP server:`, error.message);
            throw new Error(`MCP connection failed: ${error.message}`);
        }
    }

    /**
     * Fetch available tools from MCP server
     */
    async getTools() {
        // Return cached tools if available
        if (this.tools) return this.tools;

        // Ensure connected
        if (!this.connected) {
            await this.connect();
        }

        try {
            console.log(`📋 Fetching tools from MCP server...`);

            // List tools using MCP SDK
            const response = await this.client.listTools();
            
            console.log(`📥 MCP Response:`, JSON.stringify(response, null, 2));

            // Convert MCP tools to Claude format
            this.tools = response.tools.map(tool => ({
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema
            }));

            console.log(`✅ Loaded ${this.tools.length} tools:`, this.tools.map(t => t.name).join(', '));
            return this.tools;

        } catch (error) {
            console.error(`❌ Failed to fetch tools:`, error.message);
            console.error(`   Stack:`, error.stack);
            throw new Error(`Failed to fetch MCP tools: ${error.message}`);
        }
    }

    /**
     * Execute a tool call via MCP server
     */
    async executeTool(toolName, toolInput) {
        // Ensure connected
        if (!this.connected) {
            await this.connect();
        }

        try {
            console.log(`🔧 Calling tool: ${toolName}`);
            console.log(`   Arguments:`, JSON.stringify(toolInput, null, 2));

            // Call tool using MCP SDK
            const result = await this.client.callTool({
                name: toolName,
                arguments: toolInput
            });

            console.log(`✅ Tool result:`, JSON.stringify(result, null, 2));
            return result;

        } catch (error) {
            console.error(`❌ Tool execution failed:`, error.message);
            console.error(`   Stack:`, error.stack);
            throw new Error(`Tool execution failed (${toolName}): ${error.message}`);
        }
    }

    /**
     * Close the MCP connection
     */
    async close() {
        if (this.client && this.connected) {
            await this.client.close();
            this.connected = false;
            console.log('🔌 MCP connection closed');
        }
    }
}

module.exports = MCPClient;
