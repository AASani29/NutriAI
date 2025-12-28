
import { PrismaClient } from '@prisma/client';
import { inventoryService } from './modules/inventories/inventory-service';

const prisma = new PrismaClient();

async function verifyAnalytics() {
    console.log('🧪 Starting analytics verification...');

    try {
        // 1. Create a test user
        const testUserEmail = `test-analytics-${Date.now()}@example.com`;
        const testClerkId = `user_analytics_${Date.now()}`;

        console.log('👤 Creating test user:', testUserEmail);
        const user = await prisma.user.create({
            data: {
                email: testUserEmail,
                clerkId: testClerkId,
                firstName: 'Test',
                lastName: 'Analytics',
            },
        });

        console.log('✅ User created:', user.id);

        // 2. Create a test FoodItem (simulating JIT creation)
        console.log('🍎 Creating test FoodItem...');
        const foodItem = await prisma.foodItem.create({
            data: {
                name: 'Test Apple',
                category: 'Fruits',
                calories: 95,
                protein: 0.5,
                carbohydrates: 25,
                fat: 0.3,
                basePrice: 50, // 50 BDT per unit
                nutritionBasis: 1,
            },
        });
        console.log('✅ FoodItem created:', foodItem.id);

        // 3. Log Direct Consumption (No Inventory)
        console.log('📝 Logging direct consumption...');
        // We manually create a log since we want to test RECOLLECTION/AGGREGATION, not creation (which we tested before)
        // But using inventoryService.logConsumption is better if we can mocking the items.
        // Let's just create raw logs as that's what we want to query.

        await prisma.consumptionLog.create({
            data: {
                userId: user.id,
                foodItemId: foodItem.id,
                quantity: 2, // 2 Apples
                consumedAt: new Date(),
                calories: 190, // 95 * 2
                cost: 100,     // 50 * 2
                // Intentionally leaving inventoryId and inventoryItemId null
            },
        });
        console.log('✅ Direct consumption log created');

        // 4. Retrieve Analytics
        console.log('📊 Fetching consumption patterns...');
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        const patterns = await inventoryService.getConsumptionPatterns(
            testClerkId,
            startDate,
            endDate
        );

        console.log('📈 Analytics Result:', JSON.stringify(patterns, null, 2));

        // 5. Verification
        const todayKey = new Date().toISOString().split('T')[0];
        const todaysNutrition = patterns.dailyNutrition.find(d => d.date === todayKey);
        const todaysCost = patterns.dailyCost.find(d => d.date === todayKey);

        let passed = true;

        if (!todaysNutrition) {
            console.error('❌ Missing nutrition data for today');
            passed = false;
        } else {
            if (todaysNutrition.calories === 190) {
                console.log('✅ Calories aggregated correctly: 190');
            } else {
                console.error(`❌ Incorrect calories: expected 190, got ${todaysNutrition.calories}`);
                passed = false;
            }
        }

        if (!todaysCost) {
            console.error('❌ Missing cost data for today');
            passed = false;
        } else {
            if (todaysCost.cost === 100) {
                console.log('✅ Cost aggregated correctly: 100');
            } else {
                console.error(`❌ Incorrect cost: expected 100, got ${todaysCost.cost}`);
                passed = false;
            }
        }

        if (passed) {
            console.log('✨ EQUAL SUCCESS: Direct consumption analytics are working correctly!');
        } else {
            console.error('💥 VERIFICATION FAILED');
        }

        // Cleanup
        await prisma.consumptionLog.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
        await prisma.foodItem.delete({ where: { id: foodItem.id } });

    } catch (error) {
        console.error('❌ Error during verification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyAnalytics();
