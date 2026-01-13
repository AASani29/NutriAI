import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { InventoryService } from './modules/inventories/inventory-service';
import prisma from './config/database';

// Initialize InventoryService
const inventoryService = new InventoryService();

// Create MCP Server
const server = new McpServer({
    name: 'inventory-server',
    version: '1.0.0',
});

// Tool: get_inventories
server.registerTool(
    'get_inventories',
    {
        description: 'List all inventories available to the user',
        inputSchema: {
            userId: z.string().describe('The user ID (Clerk ID) to fetch inventories for'),
        },
    },
    async ({ userId }) => {
        try {
            const inventories = await inventoryService.getUserInventories(userId);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(inventories, null, 2),
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error fetching inventories: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    },
);

// Tool: create_inventory
server.registerTool(
    'create_inventory',
    {
        description: 'Create a new inventory (e.g. Fridge, Pantry, Office)',
        inputSchema: {
            userId: z.string().describe('The user ID (Clerk ID)'),
            name: z.string().describe('Name of the new inventory'),
            description: z.string().optional().describe('Description of the inventory'),
            isPrivate: z.union([z.boolean(), z.string()]).optional().transform(v => String(v) === 'true').describe('Whether the inventory is private (default: true)'),
        },
    },
    async ({ userId, name, description, isPrivate }) => {
        try {
            const result = await inventoryService.createInventory(userId, {
                name,
                description,
                isPrivate: isPrivate ?? true,
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error creating inventory: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    },
);

// Tool: add_inventory_item
server.registerTool(
    'add_inventory_item',
    {
        description: 'Add a new item to an inventory',
        inputSchema: {
            userId: z.string().describe('The user ID (Clerk ID)'),
            inventoryId: z.string().describe('The ID of the inventory to add to'),
            foodItemId: z.string().optional().describe('The ID of the food item'),
            customName: z.string().optional().describe('Custom name for the item if not a known food item'),
            quantity: z.union([z.number(), z.string()]).transform(Number).describe('Quantity of the item'),
            unit: z.string().optional().describe('Unit of measurement'),
            expiryDate: z.string().optional().describe('Expiry date (ISO string)'),
            notes: z.string().optional().describe('Notes'),
            // Nutrition & Price & Category (Estimated by AI if not provided)
            calories: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Calories per unit (or for total quantity if unit implies it)'),
            protein: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Protein (g)'),
            carbohydrates: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Carbs (g)'),
            fat: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Fat (g)'),
            price: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Price/Cost of the item'),
            category: z.string().optional().describe('Category (e.g., Produce, Dairy, Meat)'),
        },
    },
    async (args) => {
        try {
            const { userId, inventoryId, calories, protein, carbohydrates, fat, price, category, ...rest } = args;

            // Construct nutrition object if provided
            let nutritionPerUnit: any = undefined;
            if (calories !== undefined || protein !== undefined) {
                nutritionPerUnit = {
                    calories,
                    protein,
                    carbohydrates,
                    fat
                };
            }

            const result = await inventoryService.addInventoryItem(userId, inventoryId, {
                ...rest,
                basePrice: price,
                nutritionPerUnit,
                nutritionUnit: rest.unit,
                nutritionBasis: 1, // Defaulting to 1 unit basis for simplicity
                expiryDate: rest.expiryDate ? new Date(rest.expiryDate) : undefined,
                category: category,
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error adding inventory item: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    },
);


// Tool: consume_inventory_item
server.registerTool(
    'consume_inventory_item',
    {
        description: 'Consume an item FROM AN EXISTING INVENTORY, reducing its quantity.',
        inputSchema: {
            userId: z.string().describe('The user ID (Clerk ID)'),
            inventoryId: z.string().describe('The inventory ID'),
            inventoryItemId: z.string().optional().describe('The specific inventory item ID to consume from'),
            foodItemId: z.string().optional().describe('The food item ID (if not using inventory item ID)'),
            itemName: z.string().optional().describe('Name of the item consumed'),
            quantity: z.union([z.number(), z.string()]).transform(Number).describe('Amount consumed'),
            unit: z.string().optional().describe('Unit of measurement'),
            calories: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Calories consumed'),
            protein: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Protein consumed'),
            carbohydrates: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Carbs consumed'),
            fat: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Fat consumed'),
            fiber: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Fiber consumed'),
            sugar: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Sugar consumed'),
            sodium: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Sodium consumed'),
            consumedAt: z.string().optional().describe('Date consumed (ISO string)'),
            notes: z.string().optional().describe('Consumption notes'),
        },
    },
    async (args) => {
        try {
            const { userId, ...data } = args;
            const result = await inventoryService.logConsumption(userId, {
                ...data,
                itemName: data.itemName || 'Unknown Item',
                consumedAt: data.consumedAt ? new Date(data.consumedAt) : undefined,
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error consuming item: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    },
);

// Tool: log_food_consumption (Direct Consumption)
server.registerTool(
    'log_food_consumption',
    {
        description: 'Log food consumption directly (without removing from inventory). Use this when the user eats something not tracked in their inventory. Always estimate nutrition/price if not provided.',
        inputSchema: {
            userId: z.string().describe('The user ID (Clerk ID)'),
            itemName: z.string().describe('Name of the item consumed'),
            quantity: z.union([z.number(), z.string()]).transform(Number).describe('Amount consumed'),
            unit: z.string().optional().describe('Unit of measurement'),
            calories: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Calories consumed'),
            protein: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Protein consumed'),
            carbohydrates: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Carbs consumed'),
            fat: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Fat consumed'),
            fiber: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Fiber consumed'),
            sugar: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Sugar consumed'),
            sodium: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Sodium consumed'),
            price: z.union([z.number(), z.string()]).optional().transform(v => v ? Number(v) : undefined).describe('Estimated price/cost of this consumption'),
            category: z.string().optional().describe('Category (e.g. Produce, Dairy) - added to notes for now'),
            consumedAt: z.string().optional().describe('Date consumed (ISO string)'),
            notes: z.string().optional().describe('Consumption notes'),
        },
    },
    async (args) => {
        try {
            const { userId, price, category, ...data } = args;
            // Calls logConsumption WITHOUT inventoryId implies direct consumption

            const notesWithCategory = category
                ? `${data.notes || ''} [Category: ${category}] [Cost: ${price}]`.trim()
                : `${data.notes || ''} [Cost: ${price}]`.trim();

            const result = await inventoryService.logConsumption(userId, {
                ...data,
                consumedAt: data.consumedAt ? new Date(data.consumedAt) : undefined,
                notes: notesWithCategory,
            });

            // Hack: If we have explicit price, maybe we can update the log?
            if (price !== undefined && result.id) {
                await prisma.consumptionLog.update({
                    where: { id: result.id },
                    data: { cost: price }
                });
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error logging consumption: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    },
);

const app = express();
const PORT = process.env.MCP_PORT || 3001;

app.use(cors());

// SSE Endpoint
const transports = new Map<string, SSEServerTransport>();

app.get('/sse', async (req, res) => {
    console.log(`🔌 New SSE connection established`);
    const transport = new SSEServerTransport('/message', res);
    await server.connect(transport);

    // Assuming transport has a sessionId property after connection
    // @ts-ignore
    const sessionId = transport.sessionId;
    if (sessionId) {
        transports.set(sessionId, transport);
        console.log(`✅ Transport registered for session: ${sessionId}`);
        
        // Cleanup on close
        res.on('close', () => {
            console.log(`🔌 SSE connection closed for session: ${sessionId}`);
            transports.delete(sessionId);
        });
    }
});

// Message Endpoint for POST requests from client
app.post('/message', async (req, res) => {
    console.log('📩 Received message on /message');
    const sessionId = req.query.sessionId as string;
    
    if (!sessionId) {
        res.status(400).send("Missing sessionId query parameter");
        return;
    }

    const transport = transports.get(sessionId);
    if (!transport) {
        console.warn(`⚠️ Session not found: ${sessionId}`);
        res.status(404).send("Session not found");
        return;
    }

    await transport.handlePostMessage(req as any, res);
});

app.listen(PORT, () => {
    console.log(`🚀 Inventory MCP Server running on http://localhost:${PORT}/sse`);
});
