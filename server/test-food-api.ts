import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testFoodAPI() {
  console.log('Testing Food API endpoints...\n');

  try {
    // Test 1: Get all food items
    console.log('1. Testing GET /api/foods (all food items)...');
    const getAllResponse = await axios.get(`${BASE_URL}/api/foods`);
    console.log(`   Status: ${getAllResponse.status}`);
    console.log(`   Count: ${getAllResponse.data.data?.length || 0} items`);
    console.log('   Sample item:', getAllResponse.data.data?.[0] || 'No items found');
    console.log('');

    // Test 2: Get food items by category (fruit)
    console.log('2. Testing GET /api/foods?category=fruit (filter by category)...');
    const getFruitsResponse = await axios.get(`${BASE_URL}/api/foods?category=fruit`);
    console.log(`   Status: ${getFruitsResponse.status}`);
    console.log(`   Count: ${getFruitsResponse.data.data?.length || 0} fruit items`);
    console.log('   Sample fruit item:', getFruitsResponse.data.data?.[0] || 'No fruit items found');
    console.log('');

    // Test 3: Get food items with expiration filter (less than 10 days)
    console.log('3. Testing GET /api/foods?maxExpiration=10 (filter by expiration)...');
    const getShortExpResponse = await axios.get(`${BASE_URL}/api/foods?maxExpiration=10`);
    console.log(`   Status: ${getShortExpResponse.status}`);
    console.log(`   Count: ${getShortExpResponse.data.data?.length || 0} items expiring soon`);
    console.log('   Sample short expiration item:', getShortExpResponse.data.data?.[0] || 'No short exp items found');
    console.log('');

    // Test 4: Get a specific food item (by ID if any exist)
    if (getAllResponse.data.data && getAllResponse.data.data.length > 0) {
      const firstItemId = getAllResponse.data.data[0].id;
      console.log(`4. Testing GET /api/foods/${firstItemId} (specific item)...`);
      const getOneResponse = await axios.get(`${BASE_URL}/api/foods/${firstItemId}`);
      console.log(`   Status: ${getOneResponse.status}`);
      console.log('   Item details:', getOneResponse.data.data);
      console.log('');
    }

    console.log('All API tests passed successfully!');
  } catch (error: any) {
    console.error('Error during API testing:', error.response?.data || error.message);
  }
}

// Run the test
testFoodAPI();