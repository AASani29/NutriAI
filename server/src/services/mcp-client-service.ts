
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { EventSource } from 'eventsource';

// Polyfill EventSource for Node.js environment
// @ts-ignore
global.EventSource = EventSource;

export class McpClientService {
    private client: Client | null = null;
    private transport: SSEClientTransport | null = null;
    private static instance: McpClientService;

    private constructor() { }

    public static getInstance(): McpClientService {
        if (!McpClientService.instance) {
            McpClientService.instance = new McpClientService();
        }
        return McpClientService.instance;
    }

    async connect() {
        if (this.client) {
            // Check if we are actually connected
            try {
                // A small check might be needed here, or just assume it's okay if it reached here
                // For now, if connect() succeeded once, we reuse.
                return this.client;
            } catch (e) {
                this.client = null;
            }
        }

        const mcpUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001/sse';
        console.log(`🔌 Connecting to MCP Server at ${mcpUrl}...`);

        try {
            this.transport = new SSEClientTransport(new URL(mcpUrl));
            this.client = new Client(
                {
                    name: 'nutriai-backend-client',
                    version: '1.0.0',
                },
                {
                    capabilities: {},
                }
            );

            await this.client.connect(this.transport);
            console.log('✅ Connected to MCP Server via HTTP/SSE');
            return this.client;
        } catch (error) {
            console.error('❌ Failed to connect to MCP Server:', error);
            this.client = null;
            this.transport = null;
            throw error;
        }
    }

    async listTools() {
        const client = await this.connect();
        return await client.listTools();
    }

    async callTool(name: string, args: any) {
        const client = await this.connect();
        return await client.callTool({
            name,
            arguments: args,
        });
    }
}

export const mcpClientService = McpClientService.getInstance();
