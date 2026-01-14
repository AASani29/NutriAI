
import { mcpClientService } from './src/services/mcp-client-service';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    try {
        console.log("Connecting to MCP...");
        await mcpClientService.connect();
        
        console.log("Listing tools...");
        const toolsList = await mcpClientService.listTools();
        
        console.log("--- Tool Schemas ---");
        console.log(JSON.stringify(toolsList, null, 2));
        console.log("--------------------");
        
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
