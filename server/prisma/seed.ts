
import { PrismaClient, ListingStatus, ResourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Seeding V3 (High-Volume Data for Power Users)...');

  // 1. Seed Food Items (Diverse, including local Bangladeshi items)
  const foodItemsData = [
    { name: 'Basmati Rice', unit: 'kg', category: 'Grain', typicalExpirationDays: 365, sampleCostPerUnit: 120, description: 'Premium long-grain rice' },
    { name: 'Red Lentils (Dal)', unit: 'kg', category: 'Protein', typicalExpirationDays: 180, sampleCostPerUnit: 140, description: 'High-protein staple' },
    { name: 'Hilsa Fish (Ilish)', unit: 'kg', category: 'Protein', typicalExpirationDays: 3, sampleCostPerUnit: 1200, description: 'Freshwater delicacy' },
    { name: 'Spinach (Palong Shak)', unit: 'bunch', category: 'Vegetable', typicalExpirationDays: 4, sampleCostPerUnit: 30, description: 'Iron-rich greens' },
    { name: 'Mango (Himsagar)', unit: 'kg', category: 'Fruit', typicalExpirationDays: 7, sampleCostPerUnit: 150, description: 'Sweet seasonal mangoes' },
    { name: 'Milk (Liquid)', unit: 'litre', category: 'Dairy', typicalExpirationDays: 5, sampleCostPerUnit: 80, description: 'Fresh pasteurized milk' },
    { name: 'Eggs (Farm)', unit: 'dozen', category: 'Dairy', typicalExpirationDays: 21, sampleCostPerUnit: 150, description: 'Large farm eggs' },
    { name: 'Chicken Breast', unit: 'kg', category: 'Protein', typicalExpirationDays: 3, sampleCostPerUnit: 450, description: 'Lean protein source' },
    { name: 'Beef (Bone-in)', unit: 'kg', category: 'Protein', typicalExpirationDays: 4, sampleCostPerUnit: 750, description: 'Local grass-fed beef' },
    { name: 'Potatoes (Diamond)', unit: 'kg', category: 'Vegetable', typicalExpirationDays: 30, sampleCostPerUnit: 40, description: 'Versatile staple' },
    { name: 'Onions', unit: 'kg', category: 'Vegetable', typicalExpirationDays: 60, sampleCostPerUnit: 80, description: 'Essential cooking base' },
    { name: 'Almond Milk', unit: 'litre', category: 'Dairy', typicalExpirationDays: 14, sampleCostPerUnit: 350, description: 'Plant-based alternative' },
    { name: 'Quinoa', unit: 'kg', category: 'Grain', typicalExpirationDays: 365, sampleCostPerUnit: 800, description: 'High-protein grain' },
    { name: 'Avocado', unit: 'pcs', category: 'Fruit', typicalExpirationDays: 5, sampleCostPerUnit: 200, description: 'Healthy fats source' },
    { name: 'Garlic', unit: 'kg', category: 'Vegetable', typicalExpirationDays: 90, sampleCostPerUnit: 220, description: 'Fresh garlic' },
    { name: 'Ginger', unit: 'kg', category: 'Vegetable', typicalExpirationDays: 60, sampleCostPerUnit: 180, description: 'Fresh ginger' },
    { name: 'Green Chili', unit: 'kg', category: 'Vegetable', typicalExpirationDays: 14, sampleCostPerUnit: 120, description: 'Spicy green chilies' },
  ];

  for (const item of foodItemsData) {
    const itemId = `item-${item.name.replace(/\s+/g, '-').toLowerCase()}`;
    await prisma.foodItem.upsert({
      where: { id: itemId },
      update: { ...item },
      create: { ...item, id: itemId },
    });
  }
  const foodItems = await prisma.foodItem.findMany();
  console.log(`✅ Seeded ${foodItems.length} food items.`);

  // 2. Seed Resources (Basic set)
  const resourcesData = [
    { title: 'Reducing Food Waste in Dhaka', description: 'Practical tips for urban food management', url: 'https://nutriai.app/blog/dhaka-waste', type: ResourceType.Article, tags: ['dhaka', 'waste-reduction'] },
    { title: 'Plant-Based Protein Guide', description: 'Diverse sources of protein for vegetarians', url: 'https://nutriai.app/blog/plant-protein', type: ResourceType.Article, tags: ['vegan', 'nutrition', 'protein'] },
    { title: 'How to Store Hilsa Fish', description: 'Extend the freshness of your Ilish', url: 'https://youtube.com/watch?v=ilish-storage', type: ResourceType.Video, tags: ['storage', 'tips', 'ilish'] },
  ];

  for (const res of resourcesData) {
    const { tags, ...resData } = res;
    await prisma.resource.upsert({
      where: { id: `res-${res.title.replace(/\s+/g, '-').toLowerCase()}` },
      update: { ...resData },
      create: { 
        ...resData, 
        id: `res-${res.title.replace(/\s+/g, '-').toLowerCase()}`,
        tags: {
          create: tags.map(t => ({
            tag: {
              connectOrCreate: {
                where: { tag: t },
                create: { tag: t }
              }
            }
          }))
        }
      }
    });
  }
  console.log(`✅ Seeded ${resourcesData.length} resources.`);

  // 3. Seed Targeted Users with MASSIVE Data
  const targetUserIds = [
    '4be90fc1-d2a3-438f-9777-c7b21203433e',
    'ac4c4d20-4293-4101-959f-b5ef441d4ee2'
  ];

  for (const userId of targetUserIds) {
    // 1. Ensure user exists (Upsert just in case, though they should exist)
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) {
      console.log(`⚠️ User ${userId} not found, skipping deep seed.`);
      continue;
    }

    console.log(`🌀 Seeding massive data for User: ${dbUser.email || userId}`);

    // 2. Create 5 diverse Inventories for this user
    const invNames = ['Main Kitchen', 'Home Freezer', 'Pantry Room', 'Office Snacks', 'Monthly Stock'];
    for (const name of invNames) {
      const inv = await prisma.inventory.create({
        data: {
          name,
          description: `Large scale storage for ${name}`,
          createdById: userId,
          isPrivate: Math.random() > 0.5,
          members: {
            create: { userId: userId, role: 'admin' }
          }
        }
      });

      // 3. Add 40-60 items to each inventory (Total ~250 items for user)
      const itemCount = Math.floor(Math.random() * 20) + 40;
      for (let j = 0; j < itemCount; j++) {
        const foodItem = foodItems[Math.floor(Math.random() * foodItems.length)];
        const expiry = new Date();
        const daysOffset = Math.floor(Math.random() * 60) - 10; // Mix of expired and fresh
        expiry.setDate(expiry.getDate() + daysOffset);

        const invItem = await prisma.inventoryItem.create({
          data: {
            inventoryId: inv.id,
            foodItemId: foodItem.id,
            customName: foodItem.name,
            quantity: Math.floor(Math.random() * 20) + 5,
            unit: foodItem.unit,
            expiryDate: expiry,
            addedById: userId
          }
        });

        // 4. Batch create historical consumption logs for this item
        const logCount = Math.floor(Math.random() * 10) + 15;
        const logsData = [];
        for (let l = 0; l < logCount; l++) {
          const consumptionDate = new Date();
          consumptionDate.setDate(consumptionDate.getDate() - Math.floor(Math.random() * 90)); // Last 3 months
          
          logsData.push({
            userId,
            inventoryId: inv.id,
            inventoryItemId: invItem.id,
            foodItemId: foodItem.id,
            itemName: foodItem.name,
            quantity: Math.random() * 2,
            unit: foodItem.unit,
            consumedAt: consumptionDate,
            cost: (foodItem.sampleCostPerUnit || 10) * (Math.random() * 2)
          });
        }
        await prisma.consumptionLog.createMany({ data: logsData });
        
        // 5. Occasionally create listings
        if (Math.random() > 0.95) {
           await prisma.foodListing.create({
             data: {
               inventoryItemId: invItem.id,
               listerId: userId,
               title: `Excess ${foodItem.name}`,
               description: "Sharing with neighbors!",
               quantity: 2,
               unit: foodItem.unit,
               pickupLocation: "Dhaka",
               status: ListingStatus.AVAILABLE
             }
           });
        }
      }
    }
  }

  console.log('✅ High-Volume Database Seeding Completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });