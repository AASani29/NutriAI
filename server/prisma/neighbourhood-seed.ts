import { PrismaClient, ListingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Starting Neighbourhood Food Sharing Seed...');

  // Get existing users to create listings
  const users = await prisma.user.findMany({
    take: 5,
    include: {
      inventoriesCreated: {
        include: {
          items: {
            include: {
              foodItem: true
            }
          }
        }
      }
    }
  });

  if (users.length === 0) {
    console.log('⚠️  No users found. Please run main seed first.');
    return;
  }

  console.log(`Found ${users.length} users to create listings for`);

  // Sample Dhaka locations for pickups
  const dhakaLocations = [
    { area: 'Gulshan 2', lat: 23.7925, lng: 90.4078 },
    { area: 'Dhanmondi 27', lat: 23.7461, lng: 90.3742 },
    { area: 'Banani', lat: 23.7937, lng: 90.4066 },
    { area: 'Mirpur 10', lat: 23.8067, lng: 90.3685 },
    { area: 'Uttara Sector 7', lat: 23.8759, lng: 90.3795 },
    { area: 'Mohammadpur', lat: 23.7650, lng: 90.3563 },
    { area: 'Bashundhara R/A', lat: 23.8223, lng: 90.4254 },
    { area: 'Motijheel', lat: 23.7332, lng: 90.4175 },
    { area: 'Old Dhaka (Lalbag)', lat: 23.7193, lng: 90.3891 },
    { area: 'Tejgaon', lat: 23.7547, lng: 90.3929 },
  ];

  // Listing titles and descriptions
  const listingTemplates = [
    {
      prefix: 'Fresh',
      descriptions: [
        'Just bought too much from the market! Still fresh and ready to use.',
        'Surplus from weekly shopping. Help reduce waste!',
        'Great quality, but need to clear space in fridge.',
      ]
    },
    {
      prefix: 'Extra',
      descriptions: [
        'Cooked more than we could eat. Perfect for dinner!',
        'Bought in bulk, happy to share with neighbors.',
        'Family event surplus - excellent condition!',
      ]
    },
    {
      prefix: 'Leftover',
      descriptions: [
        'From party prep, too good to waste!',
        'Clean, well-preserved. Pick up today!',
        'Can\'t finish before expiry. Your gain!',
      ]
    }
  ];

  let totalListings = 0;

  // Create listings for each user
  for (const user of users) {
    const userInventories = user.inventoriesCreated;
    
    if (userInventories.length === 0) continue;

    // Create 3-8 listings per user
    const listingsToCreate = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < listingsToCreate; i++) {
      // Pick random inventory and item
      const randomInv = userInventories[Math.floor(Math.random() * userInventories.length)];
      const items = randomInv.items.filter(item => item.foodItem);
      
      if (items.length === 0) continue;
      
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const location = dhakaLocations[Math.floor(Math.random() * dhakaLocations.length)];
      const template = listingTemplates[Math.floor(Math.random() * listingTemplates.length)];
      const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];

      // Determine status
      const statusOptions = [
        ListingStatus.AVAILABLE,
        ListingStatus.AVAILABLE,
        ListingStatus.AVAILABLE, // More available listings
        ListingStatus.CLAIMED,
        ListingStatus.COMPLETED,
      ];
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

      // Calculate available until (1-7 days from now)
      const availableUntil = new Date();
      availableUntil.setDate(availableUntil.getDate() + Math.floor(Math.random() * 7) + 1);

      try {
        const listing = await prisma.foodListing.create({
          data: {
            inventoryItemId: randomItem.id,
            listerId: user.id,
            title: `${template.prefix} ${randomItem.foodItem?.name || randomItem.customName}`,
            description: description,
            quantity: Math.floor(Math.random() * 5) + 1,
            unit: randomItem.unit || 'kg',
            pickupLocation: location.area,
            latitude: location.lat + (Math.random() - 0.5) * 0.01, // Add small random offset
            longitude: location.lng + (Math.random() - 0.5) * 0.01,
            availableUntil: availableUntil,
            status: status,
          }
        });

        // If claimed or completed, create sharing log
        if (status === ListingStatus.CLAIMED || status === ListingStatus.COMPLETED) {
          // Find another user to be the claimer
          const otherUsers = users.filter(u => u.id !== user.id);
          if (otherUsers.length > 0) {
            const claimer = otherUsers[Math.floor(Math.random() * otherUsers.length)];
            
            const claimedAt = new Date();
            claimedAt.setDate(claimedAt.getDate() - Math.floor(Math.random() * 5));
            
            await prisma.sharingLog.create({
              data: {
                listingId: listing.id,
                claimerId: claimer.id,
                claimerName: claimer.email?.split('@')[0] || 'User',
                claimedAt: claimedAt,
                completedAt: status === ListingStatus.COMPLETED ? new Date() : null,
                quantityClaimed: listing.quantity,
                notes: 'Thanks for sharing!',
              }
            });
          }
        }

        totalListings++;
      } catch (error) {
        console.error(`Error creating listing: ${error}`);
      }
    }
  }

  console.log(`✅ Successfully created ${totalListings} neighbourhood food listings`);
  console.log(`📍 Listings distributed across ${dhakaLocations.length} Dhaka locations`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
