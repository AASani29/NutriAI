import { USDAFoodService } from './src/services/usda-food-service';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyUSDA() {
    const service = new USDAFoodService();
    console.log('Testing USDA Food Service...');
    console.log('API Key:', process.env.USDA_FOOD_API_KEY ? 'Present' : 'Missing (using DEMO_KEY)');

    console.log('\n1. Searching for "apple"...');
    const results = await service.searchFood('apple', 1);
    if (results.length > 0) {
        console.log('✅ Found:', results[0].description);
        console.log('   Nutrients:', results[0].nutrients);
    } else {
        console.log('❌ No results found.');
    }

    console.log('\n2. Searching for "chicken breast"...');
    const chicken = await service.searchFood('chicken breast', 1);
    if (chicken.length > 0) {
        console.log('✅ Found:', chicken[0].description);
        console.log('   Nutrients:', chicken[0].nutrients);
    } else {
        console.log('❌ No results found.');
    }
}

verifyUSDA().catch(console.error);
