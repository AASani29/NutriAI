
import { mcpClientService } from './src/services/mcp-client-service';

async function testMcp() {
    try {
        console.log('Testing MCP connection...');
        const tools = await mcpClientService.listTools();
        console.log('✅ MCP Connection successful!');
        console.log('Tools found:', tools);
    } catch (error) {
        console.error('❌ MCP Connection failed:', error);
    }
}

testMcp();
