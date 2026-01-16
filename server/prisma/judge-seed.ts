import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_USER_ID = 'a4032177-9e87-48a0-bcb5-9b83e90a4f46';
const TARGET_CLERK_ID = 'user_judge_demo_123'; // Placeholder if not found

const categories = [
    {
        name: 'Grains',
        foods: [
            { name: 'Miniket Rice', unit: 'kg', price: 70, nutrition: { calories: 350, protein: 7, carbs: 78, fat: 0.5 } },
            { name: 'Atta (Flour)', unit: 'kg', price: 55, nutrition: { calories: 340, protein: 12, carbs: 72, fat: 1.5 } },
            { name: 'Puffed Rice (Muri)', unit: 'kg', price: 80, nutrition: { calories: 400, protein: 6, carbs: 90, fat: 0.1 } },
        ]
    },
    {
        name: 'Lentils',
        foods: [
            { name: 'Masoor Dal', unit: 'kg', price: 140, nutrition: { calories: 350, protein: 24, carbs: 60, fat: 1 } },
            { name: 'Moong Dal', unit: 'kg', price: 160, nutrition: { calories: 345, protein: 23, carbs: 62, fat: 1.2 } },
            { name: 'Chola (Chickpeas)', unit: 'kg', price: 110, nutrition: { calories: 360, protein: 19, carbs: 61, fat: 6 } },
        ]
    },
    {
        name: 'Vegetables',
        foods: [
            { name: 'Potato', unit: 'kg', price: 50, nutrition: { calories: 77, protein: 2, carbs: 17, fat: 0.1 } },
            { name: 'Onion', unit: 'kg', price: 90, nutrition: { calories: 40, protein: 1.1, carbs: 9, fat: 0.1 } },
            { name: 'Tomato', unit: 'kg', price: 60, nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 } },
        ]
    },
    {
        name: 'Fruits',
        foods: [
            { name: 'Sagor Banana', unit: 'dozen', price: 120, nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 } },
            { name: 'Green Mango', unit: 'kg', price: 100, nutrition: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 } },
            { name: 'Guava', unit: 'kg', price: 80, nutrition: { calories: 68, protein: 2.5, carbs: 14, fat: 0.9 } },
        ]
    },
    {
        name: 'Fish',
        foods: [
            { name: 'Hilsa (Ilish)', unit: 'kg', price: 1400, nutrition: { calories: 250, protein: 22, carbs: 0, fat: 19 } },
            { name: 'Rui Fish', unit: 'kg', price: 350, nutrition: { calories: 110, protein: 19, carbs: 0, fat: 3 } },
            { name: 'Tilapia', unit: 'kg', price: 220, nutrition: { calories: 96, protein: 20, carbs: 0, fat: 1.7 } },
        ]
    },
    {
        name: 'Meat',
        foods: [
            { name: 'Beef', unit: 'kg', price: 750, nutrition: { calories: 250, protein: 26, carbs: 0, fat: 15 } },
            { name: 'Broiler Chicken', unit: 'kg', price: 190, nutrition: { calories: 239, protein: 27, carbs: 0, fat: 14 } },
            { name: 'Mutton', unit: 'kg', price: 1100, nutrition: { calories: 294, protein: 25, carbs: 0, fat: 21 } },
        ]
    },
    {
        name: 'Dairy',
        foods: [
            { name: 'Liquid Milk', unit: 'litre', price: 90, nutrition: { calories: 60, protein: 3.2, carbs: 4.8, fat: 3.3 } },
            { name: 'Yogurt (Doi)', unit: 'kg', price: 250, nutrition: { calories: 97, protein: 3.5, carbs: 4.7, fat: 3.3 } },
            { name: 'Eggs', unit: 'dozen', price: 150, nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11 } },
        ]
    },
    {
        name: 'Oils',
        foods: [
            { name: 'Soybean Oil', unit: 'litre', price: 165, nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
            { name: 'Mustard Oil', unit: 'litre', price: 210, nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
            { name: 'Ghee', unit: 'kg', price: 1200, nutrition: { calories: 900, protein: 0, carbs: 0, fat: 100 } },
        ]
    },
    {
        name: 'Spices',
        foods: [
            { name: 'Turmeric Powder', unit: 'g', price: 0.5, nutrition: { calories: 354, protein: 8, carbs: 65, fat: 10 } },
            { name: 'Red Chili Powder', unit: 'g', price: 0.6, nutrition: { calories: 318, protein: 12, carbs: 56, fat: 17 } },
            { name: 'Ginger', unit: 'kg', price: 240, nutrition: { calories: 80, protein: 1.8, carbs: 18, fat: 0.8 } },
        ]
    },
    {
        name: 'Snacks',
        foods: [
            { name: 'Chanachur', unit: 'kg', price: 300, nutrition: { calories: 500, protein: 15, carbs: 50, fat: 30 } },
            { name: 'Energy Biscuits', unit: 'pack', price: 10, nutrition: { calories: 450, protein: 6, carbs: 70, fat: 15 } },
            { name: 'Instant Noodles', unit: 'pack', price: 20, nutrition: { calories: 400, protein: 8, carbs: 50, fat: 18 } },
        ]
    }
];

async function main() {
    console.log('--- Starting Judge Demo Seeding ---');

    // 1. Setup User
    const user = await prisma.user.upsert({
        where: { id: TARGET_USER_ID },
        update: {},
        create: {
            id: TARGET_USER_ID,
            clerkId: TARGET_CLERK_ID,
            email: 'judge@example.com',
        }
    });
    console.log(`User ready: ${user.id}`);

    await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            fullName: 'Judge Demo User',
            dietaryPreference: 'Normal',
            location: 'Dhaka, Bangladesh',
            budgetRange: 15000,
            weight: 70,
            height: 170,
        }
    });

    // 2. Create Food Items
    console.log('Seeding Food Items...');
    const createdFoods = [];
    for (const cat of categories) {
        for (const food of cat.foods) {
            const f = await prisma.foodItem.create({
                data: {
                    name: food.name,
                    category: cat.name,
                    unit: food.unit,
                    basePrice: food.price,
                    nutritionPerUnit: food.nutrition as any,
                    createdById: user.id,
                }
            });
            createdFoods.push(f);
        }
    }

    // 3. Create Inventories
    console.log('Creating Inventories...');
    const inventory1 = await prisma.inventory.create({
        data: {
            name: 'Home Kitchen',
            description: 'Main storage for daily essentials',
            createdById: user.id,
            members: { create: { userId: user.id, role: 'admin' } }
        }
    });

    const inventory2 = await prisma.inventory.create({
        data: {
            name: 'Pantry/Dry Storage',
            description: 'Bulk items and long-term storage',
            createdById: user.id,
            members: { create: { userId: user.id, role: 'admin' } }
        }
    });

    const inventories = [inventory1, inventory2];

    // 4. Populate Inventories and Logs (2 months span)
    console.log('Populating data logs for the last 60 days...');
    const now = new Date();
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    for (const inv of inventories) {
        // Pick 10 random foods for this inventory
        const invFoods = [...createdFoods].sort(() => 0.5 - Math.random()).slice(0, 12);
        
        for (const food of invFoods) {
            const invItem = await prisma.inventoryItem.create({
                data: {
                    inventoryId: inv.id,
                    foodItemId: food.id,
                    customName: food.name,
                    quantity: Math.floor(Math.random() * 10) + 5,
                    unit: food.unit,
                    addedById: user.id,
                    expiryDate: new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
                }
            });

            // Create some consumption logs over the 60 days
            for (let i = 0; i < 15; i++) {
                const logDate = new Date(sixtyDaysAgo.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000);
                const qty = (Math.random() * 2).toFixed(2);
                const nutrition = (food.nutritionPerUnit as any) || {};

                await prisma.consumptionLog.create({
                    data: {
                        userId: user.id,
                        inventoryId: inv.id,
                        inventoryItemId: invItem.id,
                        foodItemId: food.id,
                        itemName: food.name,
                        quantity: parseFloat(qty),
                        unit: food.unit,
                        calories: nutrition.calories ? nutrition.calories * parseFloat(qty) : 0,
                        protein: nutrition.protein ? nutrition.protein * parseFloat(qty) : 0,
                        carbohydrates: nutrition.carbs ? nutrition.carbs * parseFloat(qty) : 0,
                        fat: nutrition.fat ? nutrition.fat * parseFloat(qty) : 0,
                        cost: (food.basePrice || 0) * parseFloat(qty),
                        consumedAt: logDate,
                    }
                });
            }
        }
    }

    // 5. Seed SDG Scores (Weekly for 8 weeks)
    console.log('Seeding SDG Scores...');
    for (let i = 0; i < 8; i++) {
        const weekDate = new Date();
        weekDate.setDate(now.getDate() - (i * 7));
        await prisma.sdgScore.create({
            data: {
                userId: user.id,
                weekStartDate: weekDate,
                wasteReductionScore: Math.floor(Math.random() * 40) + 60,
                nutritionScore: Math.floor(Math.random() * 30) + 70,
                budgetScore: Math.floor(Math.random() * 50) + 50,
                sustainabilityScore: Math.floor(Math.random() * 40) + 60,
                totalScore: Math.floor(Math.random() * 30) + 70,
                insights: { msg: "Good progress on waste reduction this week!" },
                recommendations: ["Try to consume more leafy greens", "Watch out for expiring milk"],
            }
        });
    }

    // 6. Seed AI Insights
    console.log('Seeding AI Insights...');
    await prisma.aiInsight.createMany({
        data: [
            {
                userId: user.id,
                insightType: 'waste_pattern',
                data: { pattern: "High waste in dairy products noted on Tuesdays.", saving_potential: "500 BDT/month" },
                expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            },
            {
                userId: user.id,
                insightType: 'nutrition_gap',
                data: { gap: "Low protein intake in the last 14 days.", suggestion: "Add more lentils and eggs to your diet." },
                expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            }
        ]
    });

    // 7. Seed Fitness and Hydration logs
    console.log('Seeding Fitness and Hydration...');
    for (let i = 0; i < 30; i++) {
        const logDate = new Date();
        logDate.setDate(now.getDate() - i);
        
        await prisma.fitnessLog.upsert({
            where: { userId_date: { userId: user.id, date: logDate } },
            update: {},
            create: {
                userId: user.id,
                date: logDate,
                steps: Math.floor(Math.random() * 5000) + 3000,
                caloriesBurned: Math.floor(Math.random() * 500) + 200,
            }
        });

        await prisma.hydrationLog.upsert({
            where: { userId_date: { userId: user.id, date: logDate } },
            update: {},
            create: {
                userId: user.id,
                date: logDate,
                amount: Math.random() * 2 + 1,
                goal: 2.5,
            }
        });
    }

    console.log('--- Seeding Completed Successfully ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
