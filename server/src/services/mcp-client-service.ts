
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
        if (this.client) return this.client;

        const mcpUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001/sse';
        console.log(`🔌 Connecting to MCP Server at ${mcpUrl}...`);

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
