import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { InventoryService } from './modules/inventories/inventory-service';
import prisma from './config/database'; // Ensure prisma connection is reused or initialized

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
            isPrivate: z.coerce.boolean().optional().describe('Whether the inventory is private (default: true)'),
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
            quantity: z.coerce.number().describe('Quantity of the item'),
            unit: z.string().optional().describe('Unit of measurement'),
            expiryDate: z.string().optional().describe('Expiry date (ISO string)'),
            notes: z.string().optional().describe('Notes'),
            // Nutrition & Price & Category (Estimated by AI if not provided)
            calories: z.coerce.number().optional().describe('Calories per unit (or for total quantity if unit implies it)'),
            protein: z.coerce.number().optional().describe('Protein (g)'),
            carbohydrates: z.coerce.number().optional().describe('Carbs (g)'),
            fat: z.coerce.number().optional().describe('Fat (g)'),
            price: z.coerce.number().optional().describe('Price/Cost of the item'),
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
            quantity: z.coerce.number().describe('Amount consumed'),
            unit: z.string().optional().describe('Unit of measurement'),
            calories: z.coerce.number().optional().describe('Calories consumed'),
            protein: z.coerce.number().optional().describe('Protein consumed'),
            carbohydrates: z.coerce.number().optional().describe('Carbs consumed'),
            fat: z.coerce.number().optional().describe('Fat consumed'),
            fiber: z.coerce.number().optional().describe('Fiber consumed'),
            sugar: z.coerce.number().optional().describe('Sugar consumed'),
            sodium: z.coerce.number().optional().describe('Sodium consumed'),
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
            quantity: z.coerce.number().describe('Amount consumed'),
            unit: z.string().optional().describe('Unit of measurement'),
            calories: z.coerce.number().optional().describe('Calories consumed'),
            protein: z.coerce.number().optional().describe('Protein consumed'),
            carbohydrates: z.coerce.number().optional().describe('Carbs consumed'),
            fat: z.coerce.number().optional().describe('Fat consumed'),
            fiber: z.coerce.number().optional().describe('Fiber consumed'),
            sugar: z.coerce.number().optional().describe('Sugar consumed'),
            sodium: z.coerce.number().optional().describe('Sodium consumed'),
            price: z.coerce.number().optional().describe('Estimated price/cost of this consumption'),
            category: z.string().optional().describe('Category (e.g. Produce, Dairy) - added to notes for now'),
            consumedAt: z.string().optional().describe('Date consumed (ISO string)'),
            notes: z.string().optional().describe('Consumption notes'),
        },
    },
    async (args) => {
        try {
            const { userId, price, category, ...data } = args;
            // Calls logConsumption WITHOUT inventoryId implies direct consumption
            // The service logic: "calculatedCost = foodItemAny.basePrice * ratio".
            // It seems I can't pass cost directly effectively.
            // Actually, line 254 in service: "Estimating details for new item".
            // If I can pass basePrice into JIT creation...
            // The service does: `if (!effectiveFoodItemId && data.itemName) { ... create foodItem ... }`.
            // It doesn't take price from `data` to create it, it calls AI.
            // OK, I'll rely on the service's AI for now to avoid modifying core service logic too much,
            // OR I can pass it in 'notes'.

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
                // We would need to import prisma here to update it manually?
                // Yes, prisma is imported at top.
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

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Inventory MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main loop:", error);
    process.exit(1);
});
