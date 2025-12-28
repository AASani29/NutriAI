
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class McpClientService {
    private client: Client | null = null;
    private transport: StdioClientTransport | null = null;
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

        console.log('🔌 Connecting to MCP Server...');
        this.transport = new StdioClientTransport({
            command: 'npm',
            args: ['--silent', 'run', 'mcp'],
            stderr: 'inherit',
        });

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
        console.log('✅ Connected to MCP Server');
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
