import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to connect and run a simple query
    const userCount = await prisma.user.count();
    console.log(`Connected successfully! Found ${userCount} users in the database.`);
    
    // Test creating a simple record
    const newUser = await prisma.user.create({
      data: {
        clerkId: 'test_user_' + Date.now(),
        email: `test${Date.now()}@example.com`,
      }
    });
    
    console.log(`Created test user with ID: ${newUser.id}`);
    
    // Clean up: delete the test user
    await prisma.user.delete({
      where: { id: newUser.id }
    });
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();