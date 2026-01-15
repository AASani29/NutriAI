import prisma from '../../config/database';
import { aiAnalyticsService } from '../../services/aiAnalyticsService';
import { usdaFoodService } from '../../services/usda-food-service';
import {
  ConsumptionLogRequest,
  ConsumptionLogFilters,
  InventoryItemFilters,
  InventoryItemRequest,
  InventoryRequest,
  UpdateInventoryItemRequest,
  UpdateInventoryRequest,
} from './inventory-types';

export class InventoryService {
  private async getDbUser(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new Error('User not found in database');
    }

    return user;
  }

  private async ensureInventoryAccess(
    inventoryId: string,
    userDbId: string,
    { requireOwner = false }: { requireOwner?: boolean } = {},
  ) {
    const inventory = await prisma.inventory.findFirst({
      where: {
        id: inventoryId,
        isDeleted: false,
        OR: [
          { createdById: userDbId },
          {
            members: {
              some: {
                userId: userDbId,
                isDeleted: false,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!inventory) {
      throw new Error('Inventory not found or access denied');
    }

    const isOwner = inventory.createdById === userDbId;
    if (requireOwner && !isOwner) {
      throw new Error('Inventory access denied for non-owner');
    }

    return { inventory, isOwner };
  }

  private normalizeIdentifiers(identifiers?: string[]) {
    if (!identifiers) return [];
    const trimmed = identifiers
      .map(id => (id || '').trim())
      .filter(id => id.length > 0);
    return Array.from(new Set(trimmed.map(id => id.toLowerCase())));
  }

  private async addMembersToInventory(
    inventoryId: string,
    addedById: string,
    identifiers?: string[],
  ) {
    const normalized = this.normalizeIdentifiers(identifiers);
    if (normalized.length === 0) return [] as any[];

    const createdMembers = [] as any[];

    for (const identifier of normalized) {
      const userMatch = await prisma.user.findFirst({
        where: {
          isDeleted: false,
          OR: [
            { email: { equals: identifier, mode: 'insensitive' } },
            {
              profile: {
                fullName: { equals: identifier, mode: 'insensitive' },
              },
            },
          ],
        },
        include: {
          profile: true,
        },
      });

      // Avoid duplicate memberships for resolved users
      if (userMatch) {
        const existing = await prisma.inventoryMember.findFirst({
          where: {
            inventoryId,
            userId: userMatch.id,
            isDeleted: false,
          },
        });
        if (existing) {
          createdMembers.push(existing);
          continue;
        }
      }

      const memberName =
        userMatch?.profile?.fullName || userMatch?.email || identifier;

      const membership = await prisma.inventoryMember.create({
        data: {
          inventoryId,
          userId: userMatch?.id,
          memberName,
          role: 'member',
          addedById,
        },
      });

      createdMembers.push(membership);
    }

    return createdMembers;
  }

  /**
   * Get all inventories for a user
   */
  async getUserInventories(userId: string) {
    const user = await this.getDbUser(userId);
    console.log('Clerk userId:', userId, 'DB user:', user);
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const inventories = await prisma.inventory.findMany({
      where: {
        isDeleted: false,
        OR: [
          { createdById: user.id },
          {
            members: {
              some: {
                userId: user.id,
                isDeleted: false,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        isPrivate: true,
        isArchived: true,
        archivedAt: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
        createdBy: {
          select: {
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        members: {
          where: { isDeleted: false },
          select: {
            id: true,
            userId: true,
            memberName: true,
            role: true,
          },
        },
        _count: {
          select: {
            items: {
              where: { isDeleted: false, removed: false },
            },
          },
        },
        items: {
          where: {
            isDeleted: false,
            removed: false,
            expiryDate: {
              gte: today,
              lte: next7Days,
            },
          },
          select: { id: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map to include expiring count explicitly
    const mappedInventories = inventories.map(inv => ({
      id: inv.id,
      name: inv.name,
      description: inv.description,
      isPrivate: inv.isPrivate,
      isArchived: inv.isArchived,
      archivedAt: inv.archivedAt,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
      itemCount: inv._count.items,
      expiringCount: inv.items.length,
      accessRole: inv.createdById === user.id ? 'owner' : 'member',
      ownerName:
        inv.createdBy?.profile?.fullName || inv.createdBy?.email || undefined,
      members: inv.members,
    }));

    console.log('Inventories found with counts:', mappedInventories.length);
    return mappedInventories;
  }

  /**
   * Get a specific inventory by ID
   */
  async getInventoryById(inventoryId: string, userId: string) {
    const user = await this.getDbUser(userId);
    await this.ensureInventoryAccess(inventoryId, user.id);

    return await prisma.inventory.findFirst({
      where: {
        id: inventoryId,
        isDeleted: false,
      },
      include: {
        members: {
          where: { isDeleted: false },
          select: {
            id: true,
            memberName: true,
            userId: true,
            role: true,
          },
        },
        items: {
          where: {
            isDeleted: false,
            removed: false,
          },
          select: {
            id: true,
            foodItemId: true,
            customName: true,
            quantity: true,
            unit: true,
            addedAt: true,
            expiryDate: true,
            notes: true,
            foodItem: {
              select: {
                id: true,
                name: true,
                category: true,
                unit: true,
                typicalExpirationDays: true,
                description: true,
                nutritionPerUnit: true,
                nutritionUnit: true,
                nutritionBasis: true,
                basePrice: true,
              },
            },
          },
          orderBy: {
            addedAt: 'desc',
          },
        },
      },
    });
  }

  /**
   * Create a new inventory
   */
  async createInventory(userId: string, data: InventoryRequest) {
    const user = await this.getDbUser(userId);

    const inventory = await prisma.inventory.create({
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate ?? true,
        createdById: user.id,
      },
    });

    if (data.shareWith && data.shareWith.length > 0) {
      await this.addMembersToInventory(inventory.id, user.id, data.shareWith);
    }

    return inventory;
  }

  /**
   * Update an inventory
   */
  async updateInventory(
    inventoryId: string,
    userId: string,
    data: UpdateInventoryRequest,
  ) {
    const user = await this.getDbUser(userId);
    await this.ensureInventoryAccess(inventoryId, user.id, { requireOwner: true });

    return await prisma.inventory.update({
      where: {
        id: inventoryId,
        createdById: user.id,
      },
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete an inventory (soft delete)
   */
  async deleteInventory(inventoryId: string, userId: string) {
    const user = await this.getDbUser(userId);
    await this.ensureInventoryAccess(inventoryId, user.id, { requireOwner: true });

    return await prisma.inventory.update({
      where: {
        id: inventoryId,
        createdById: user.id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Archive an inventory
   */
  async archiveInventory(inventoryId: string, userId: string) {
    const user = await this.getDbUser(userId);
    await this.ensureInventoryAccess(inventoryId, user.id, { requireOwner: true });

    return await prisma.inventory.update({
      where: {
        id: inventoryId,
        createdById: user.id,
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });
  }

  /**
   * Unarchive an inventory
   */
  async unarchiveInventory(inventoryId: string, userId: string) {
    const user = await this.getDbUser(userId);
    await this.ensureInventoryAccess(inventoryId, user.id, { requireOwner: true });

    return await prisma.inventory.update({
      where: {
        id: inventoryId,
        createdById: user.id,
      },
      data: {
        isArchived: false,
        archivedAt: null,
      },
    });
  }

  /**
   * Add an item to an inventory
   */
  async addInventoryItem(
    userId: string,
    inventoryId: string,
    data: InventoryItemRequest,
  ) {
    const user = await this.getDbUser(userId);
    await this.ensureInventoryAccess(inventoryId, user.id);

    // Handle food item lookup logic
    let finalFoodItemId = data.foodItemId;
    let finalCustomName = data.customName;
    let finalUnit = data.unit;

    if (data.foodItemId) {
      // If a foodItemId is provided, verify it exists
      const foodItem = await prisma.foodItem.findFirst({
        where: {
          id: data.foodItemId,
          isDeleted: false,
        },
      });

      if (!foodItem) {
        throw new Error('Food item not found');
      }
    } else if (data.customName) {
      // 1. Try to find a PRIVATE food item created by THIS user that matches BOTH Name AND Price (to avoid overwriting history)

      // Determine normalization basis first to compare apples to apples
      const nutritionBasis = data.nutritionBasis || (['g', 'ml'].includes(data.unit || '') ? 100 : 1);

      // Calculate normalized target price
      let targetPrice: number | undefined = undefined;
      if (data.basePrice) {
        targetPrice = (data.basePrice / data.quantity) * nutritionBasis;
      }

      // Find ALL matching names
      const candidateItems = await prisma.foodItem.findMany({
        where: {
          name: {
            equals: data.customName.trim(),
            mode: 'insensitive',
          },
          createdById: user.id, // Scoped to user
          isDeleted: false,
        },
      });

      // Find exact price match
      let matchingFoodItem = null;
      if (candidateItems.length > 0) {
        if (targetPrice !== undefined) {
          // Look for price match within small tolerance
          matchingFoodItem = candidateItems.find(item =>
            item.basePrice && Math.abs(item.basePrice - targetPrice) < 0.5
          );
        }

        // If the user didn't provide a new price (targetPrice undefined), we can reuse the most recent one.
        // If the user DID provide a new price, and it didn't match any existing, matchingFoodItem remains null.
        if (!matchingFoodItem && targetPrice === undefined) {
          matchingFoodItem = candidateItems[0];
        }
      }

      // 2. If NO private item found, and we have custom data (nutrition/price), FORCE CREATE NEW PRIVATE ITEM
      if (!matchingFoodItem) {
        try {
          // Determine basis first
          const nutritionBasis = data.nutritionBasis || (['g', 'ml'].includes(data.unit || '') ? 100 : 1);

          // Calculate normalized basePrice (Price Per Basis) derived from the Total Price provided by frontend
          // Frontend sends 'basePrice' as the TOTAL estimated price for 'quantity'
          let normalizedBasePrice: number | undefined = undefined;
          if (data.basePrice) {
            normalizedBasePrice = (data.basePrice / data.quantity) * nutritionBasis;
            console.log(`🧮 Normalized Price: Total ${data.basePrice} for ${data.quantity} -> ${normalizedBasePrice} per ${nutritionBasis}`);
          }

          let itemData = {
            nutritionPerUnit: data.nutritionPerUnit,
            nutritionUnit: data.nutritionUnit || data.unit,
            nutritionBasis: nutritionBasis,
            basePrice: normalizedBasePrice, // Use normalized price
            category: data.category || 'Uncategorized'
          };

          // If nutrition is missing, try USDA Food API first
          if (!itemData.nutritionPerUnit && data.customName) {
            console.log(`📡 Searching USDA Food API for: ${data.customName}`);
            const usdaFoods = await usdaFoodService.searchFood(data.customName, 1);
            if (usdaFoods.length > 0) {
              const usdaFood = usdaFoods[0];
              console.log(`✅ Found USDA data for: ${usdaFood.description}`);
              itemData.nutritionPerUnit = usdaFood.nutrients;
              itemData.nutritionUnit = 'g'; // USDA is per 100g
              itemData.nutritionBasis = 100;
              // If category is missing, USDA doesn't give a simple category, we might still need AI for category/price
            }
          }

          // If price/category is still missing, try to estimate it using AI
          if (!itemData.basePrice || !itemData.nutritionPerUnit) {
            console.log(`🤖 Estimating remaining details for new item: ${data.customName}`);
            try {
              const estimated = await aiAnalyticsService.estimateItemDetails(data.customName);
              if (estimated) {
                if (!itemData.basePrice) {
                  console.log(`✅ AI Estimated price: ${estimated.basePrice}`);
                  itemData.basePrice = estimated.basePrice;
                }
                if (estimated.category && itemData.category === 'Uncategorized') {
                  itemData.category = estimated.category;
                }

                // Also fill nutrition if still missing after USDA check
                if (!itemData.nutritionPerUnit) {
                  itemData.nutritionPerUnit = estimated.nutritionPerUnit;
                  itemData.nutritionUnit = estimated.nutritionUnit;
                  itemData.nutritionBasis = estimated.nutritionBasis;
                }
              }
            } catch (e) {
              console.warn('Failed to estimate item details:', e);
            }
          }

          // Only create if we have at least some data (price or nutrition), otherwise fall through to global search
          if (itemData.basePrice || itemData.nutritionPerUnit) {
            const newFoodItem = await prisma.foodItem.create({
              data: {
                name: data.customName?.trim() || 'Unknown Item',
                category: itemData.category,
                unit: data.unit,
                nutritionPerUnit: itemData.nutritionPerUnit || {},
                nutritionUnit: itemData.nutritionUnit,
                nutritionBasis: itemData.nutritionBasis,
                basePrice: itemData.basePrice,
                createdById: user.id
              }
            });
            console.log('Creates new PRIVATE FoodItem from USDA/AI:', newFoodItem.name);
            matchingFoodItem = newFoodItem;
          }
        } catch (err) {
          console.error('Failed to create Private FoodItem:', err);
        }
      }

      // 3. If STILL no item found (meaning no private existing, and no custom data provided),
      // Try to find a GLOBAL food item (createdById: null)
      if (!matchingFoodItem) {
        matchingFoodItem = await prisma.foodItem.findFirst({
          where: {
            name: {
              equals: data.customName.trim(),
              mode: 'insensitive',
            },
            createdById: null, // Global item
            isDeleted: false,
          },
        });
      }

      // Final Assignment
      if (matchingFoodItem) {
        finalFoodItemId = matchingFoodItem.id;
        finalCustomName = matchingFoodItem.name;
        finalUnit = data.unit || matchingFoodItem.unit || undefined;
      }
    }
    // If still no match, finalFoodItemId remains null -> it's a raw custom inventory item.


    return await prisma.inventoryItem.create({
      data: {
        inventoryId,
        foodItemId: finalFoodItemId,
        customName: finalCustomName,
        quantity: data.quantity,
        unit: finalUnit,
        expiryDate: data.expiryDate,
        notes: data.notes,
        addedById: user.id,
      },
      include: {
        foodItem: {
          select: {
            id: true,
            name: true,
            category: true,
            unit: true,
            typicalExpirationDays: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Update an inventory item
   */
  async updateInventoryItem(
    userId: string,
    inventoryId: string,
    itemId: string,
    data: UpdateInventoryItemRequest,
  ) {
    // First, find the application user by their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found in database');
    }

    // Verify that the inventory belongs to the user and the item belongs to that inventory
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        inventoryId: inventoryId,
        inventory: {
          createdById: user.id,
        },
        isDeleted: false,
      },
    });

    if (!inventoryItem) {
      throw new Error('Inventory item not found or does not belong to user');
    }

    return await prisma.inventoryItem.update({
      where: {
        id: itemId,
      },
      data: {
        quantity: data.quantity,
        unit: data.unit,
        expiryDate: data.expiryDate,
        notes: data.notes,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Remove an item from an inventory (soft delete)
   */
  async removeInventoryItem(
    userId: string,
    inventoryId: string,
    itemId: string,
  ) {
    // First, find the application user by their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found in database');
    }

    // Verify that the inventory belongs to the user and the item belongs to that inventory
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        inventoryId: inventoryId,
        inventory: {
          createdById: user.id,
        },
        isDeleted: false,
      },
    });

    if (!inventoryItem) {
      throw new Error('Inventory item not found or does not belong to user');
    }

    return await prisma.inventoryItem.update({
      where: {
        id: itemId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Get inventory items with optional filtering
   */
  async getInventoryItems(userId: string, filters: InventoryItemFilters) {
    console.log('🔍 [getInventoryItems] Fetching items for inventory:', filters.inventoryId);
    const user = await this.getDbUser(userId);
    await this.ensureInventoryAccess(filters.inventoryId, user.id);
    const whereClause: any = {
      inventoryId: filters.inventoryId,
      isDeleted: false,
      removed: false,
    };

    // Add category filter if specified
    if (filters.category) {
      whereClause.foodItem = {
        category: filters.category,
      };
    }

    // Add expiring soon filter if specified
    if (filters.expiringSoon) {
      const today = new Date();
      const next7Days = new Date();
      next7Days.setDate(today.getDate() + 7);

      whereClause.expiryDate = {
        gte: today,
        lte: next7Days,
      };
    }

    const items = await prisma.inventoryItem.findMany({
      where: whereClause,
      include: {
        foodItem: {
          select: {
            name: true,
            category: true,
            typicalExpirationDays: true,
            nutritionPerUnit: true,
            nutritionUnit: true,
            nutritionBasis: true,
            basePrice: true,
          },
        },
      },
      orderBy: {
        addedAt: 'desc',
      },
    });
    console.log(`✅ [getInventoryItems] Found ${items.length} items for ${filters.inventoryId}`);
    return items;
  }

  async shareInventory(
    userId: string,
    inventoryId: string,
    shareWith: string[],
  ) {
    const user = await this.getDbUser(userId);
    await this.ensureInventoryAccess(inventoryId, user.id, { requireOwner: true });

    const members = await this.addMembersToInventory(
      inventoryId,
      user.id,
      shareWith,
    );

    return members;
  }

  /**
   * Log a consumption event
   */
  async logConsumption(userId: string, data: ConsumptionLogRequest) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found in database');
    }

    // Verify inventory only if inventoryId is provided
    let inventoryItem: any = null;

    if (data.inventoryId) {
      const inventory = await prisma.inventory.findFirst({
        where: { id: data.inventoryId, isDeleted: false },
        include: { members: true }
      });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      // Check if user is owner OR a member of the inventory
      const isOwner = inventory.createdById === user.id;
      const isMember = inventory.members?.some(m => m.userId === user.id && !m.isDeleted);

      if (!isOwner && !isMember) {
        throw new Error('You do not have access to this inventory');
      }

      if (data.inventoryItemId && !data.inventoryItemId.startsWith('temp-')) {
        inventoryItem = await prisma.inventoryItem.findFirst({
          where: {
            id: data.inventoryItemId,
            inventoryId: data.inventoryId,
            isDeleted: false,
          },
          include: { foodItem: true },
        });

        if (!inventoryItem) throw new Error('Inventory item not found');
      }
    }

    // Handle Nutrition Logic
    // PRIORITY: Use client-provided nutrition values first (they represent what user saw in inventory)
    // Only recalculate if client didn't provide values
    const hasClientNutrition = data.calories !== undefined ||
      data.protein !== undefined ||
      data.carbohydrates !== undefined ||
      data.fat !== undefined;

    let logNutrients = {
      calories: data.calories,
      protein: data.protein,
      carbohydrates: data.carbohydrates,
      fat: data.fat,
      fiber: data.fiber,
      sugar: data.sugar,
      sodium: data.sodium,
    };


    let calculatedCost: number | null = null;

    // Resolve Food Item ID (prefer explicit, fallback to inventory item's link)
    let effectiveFoodItemId = data.foodItemId || inventoryItem?.foodItemId;

    // 0. Auto-resolve or Auto-create FoodItem for Direct Consumption (if missing)
    if (!effectiveFoodItemId && data.itemName) {
      try {
        // Try to find existing
        let foodItem = await prisma.foodItem.findFirst({
          where: {
            name: { equals: data.itemName.trim(), mode: 'insensitive' },
            isDeleted: false,
          },
        });

        // If not found, JIT create with USDA/AI estimation
        if (!foodItem) {
          console.log(
            `🤖 JIT Creating FoodItem for direct consumption: ${data.itemName}`,
          );

          // Try USDA first
          let nutritionData = null;
          try {
            console.log(`📡 Searching USDA Food API for JIT: ${data.itemName}`);
            const usdaFoods = await usdaFoodService.searchFood(data.itemName, 1);
            if (usdaFoods.length > 0) {
              nutritionData = usdaFoods[0];
              console.log(`✅ Found USDA data for JIT: ${nutritionData.description}`);
            }
          } catch (e) {
            console.warn('USDA search failed for JIT:', e);
          }

          const estimated = await aiAnalyticsService.estimateItemDetails(
            data.itemName,
          );

          if (estimated || nutritionData) {
            foodItem = await prisma.foodItem.create({
              data: {
                name: (nutritionData?.description) || estimated?.name || data.itemName,
                category: estimated?.category || 'other',
                unit: (nutritionData ? 'g' : (estimated?.nutritionUnit || data.unit || 'pcs')),
                basePrice: estimated?.basePrice,
                nutritionPerUnit: nutritionData?.nutrients || estimated?.nutritionPerUnit,
                nutritionBasis: nutritionData ? 100 : estimated?.nutritionBasis,
                nutritionUnit: nutritionData ? 'g' : estimated?.nutritionUnit,
                typicalExpirationDays: estimated?.typicalExpirationDays || 7,
              } as any,
            });
            console.log(`✅ JIT Created FoodItem (USDA/AI): ${foodItem.id}`);
          }
        }

        if (foodItem) {
          effectiveFoodItemId = foodItem.id;
        }
      } catch (e) {
        console.warn('Failed to auto-resolve/create FoodItem for consumption:', e);
      }
    }

    // Fetch FoodItem for cost calculation and nutrition fallback
    let foodItem: any = null;
    let foodItemAny: any = null;
    let storedBasis = 1;

    if (effectiveFoodItemId) {
      foodItem = await prisma.foodItem.findFirst({
        where: { id: effectiveFoodItemId, isDeleted: false },
      });

      if (!foodItem) {
        if (data.foodItemId) throw new Error('Food item not found');
        // If inferred from inventory but missing in DB, we skip cost calc logic
      } else {
        foodItemAny = foodItem as any;
        storedBasis = foodItemAny.nutritionBasis || 1;
      }
    }

    // Only recalculate nutrition if client didn't provide values
    if (!hasClientNutrition && foodItemAny && foodItemAny.nutritionPerUnit) {
      const base = foodItemAny.nutritionPerUnit;

      // Determine Unit Compatibility
      const storedUnit = foodItemAny.nutritionUnit || 'unit';
      const inputUnit = data.unit || 'piece';

      const massVolUnits = ['g', 'kg', 'mg', 'oz', 'lb', 'ml', 'l', 'cup', 'tsp', 'tbsp', 'gram', 'grams', 'milliliter', 'liter'];
      const isStoredMassVol = massVolUnits.some(u => storedUnit.toLowerCase().includes(u));
      const hasInputMassVolKeyword = massVolUnits.some(u => inputUnit.toLowerCase().includes(u));

      // Mismatch if one is mass/vol and other is NOT (implies count/piece)
      // Note: This is a heuristic. "cup" is volume, but often treated as unit.
      const isMismatch = (isStoredMassVol && !hasInputMassVolKeyword) || (!isStoredMassVol && hasInputMassVolKeyword);

      if (isMismatch) {
        console.log(`⚠️ Unit Mismatch for ${data.itemName}: Stored ${storedUnit} vs Input ${inputUnit}. Requesting AI Estimation...`);
        try {
          const estimated = await aiAnalyticsService.estimateNutrition(
            data.itemName || foodItemAny.name,
            data.quantity,
            inputUnit,
            {
              nutritionPerUnit: base,
              nutritionUnit: storedUnit,
              nutritionBasis: storedBasis
            }
          );

          if (estimated && estimated.calories !== undefined) {
            logNutrients = {
              calories: estimated.calories,
              protein: estimated.protein,
              carbohydrates: estimated.carbohydrates,
              fat: estimated.fat,
              fiber: estimated.fiber,
              sugar: estimated.sugar,
              sodium: estimated.sodium
            };
            console.log(`✅ AI Resolved Mismatch: ${estimated.calories} kcal`);
          } else {
            throw new Error("AI returned empty estimation");
          }
        } catch (e) {
          console.warn(`Failed to resolve unit mismatch with AI, falling back to ratio (may be inaccurate):`, e);
          // Fallback to ratio logic
          const unitMatch = data.unit ? data.unit.match(/^(\d+)(.*)$/) : null;
          const multiplier = unitMatch ? parseInt(unitMatch[1]) : 1;
          const effectiveQuantity = data.quantity * multiplier;
          const ratio = effectiveQuantity / storedBasis;

          logNutrients = {
            calories: (base.calories || 0) * ratio,
            protein: (base.protein || 0) * ratio,
            carbohydrates: (base.carbohydrates || 0) * ratio,
            fat: (base.fat || 0) * ratio,
            fiber: (base.fiber || 0) * ratio,
            sugar: (base.sugar || 0) * ratio,
            sodium: (base.sodium || 0) * ratio,
          };
        }
      } else {
        // Compatible Units - Use Ratio Logic
        const unitMatch = data.unit ? data.unit.match(/^(\d+)(.*)$/) : null;
        const multiplier = unitMatch ? parseInt(unitMatch[1]) : 1;
        const effectiveQuantity = data.quantity * multiplier; 

        // Ratio Calculation:
        // energy x effective_quantity / basis
        const ratio = effectiveQuantity / storedBasis;

        console.log(`📊 calculating nutrition for ${data.itemName}: Unit ${data.unit}, Quantity ${data.quantity}, Multiplier ${multiplier}, Effective ${effectiveQuantity}, Basis ${storedBasis}, Ratio ${ratio}`);

        logNutrients = {
          calories: (base.calories || 0) * ratio,
          protein: (base.protein || 0) * ratio,
          carbohydrates: (base.carbohydrates || 0) * ratio,
          fat: (base.fat || 0) * ratio,
          fiber: (base.fiber || 0) * ratio,
          sugar: (base.sugar || 0) * ratio,
          sodium: (base.sodium || 0) * ratio,
        };
      }
    } else if (hasClientNutrition) {
      console.log(`✅ Using client-provided nutrition values for ${data.itemName} (ensures consistency with inventory display)`);
    }

    // --- COST CALCULATION START ---
    // Calculate cost if we have FoodItem with basePrice
    if (foodItemAny && foodItemAny.basePrice) {
      const ratio = data.quantity / storedBasis;
      calculatedCost = foodItemAny.basePrice * ratio;
    }
    // If NO basePrice, try to predict it now (JIT Prediction) - OLD LOGIC RETAINED AS FALLBACK
    else if (foodItem && data.itemName) {
      try {
        console.log(`🤖 JIT Price Estimating for: ${data.itemName}`);
        const estimated = await aiAnalyticsService.estimateItemDetails(
          data.itemName,
        );
        if (estimated && estimated.basePrice && estimated.nutritionBasis) {
          const ratio = data.quantity / estimated.nutritionBasis;
          calculatedCost = estimated.basePrice * ratio;
          console.log(`✅ JIT Estimated Cost: ${calculatedCost}`);

          // Update FoodItem so we don't pay for this again
          await prisma.foodItem.update({
            where: { id: foodItem.id },
            data: {
              basePrice: estimated.basePrice,
              nutritionBasis: estimated.nutritionBasis, // Ensure basis matches price
              nutritionUnit: estimated.nutritionUnit,
              category: estimated.category || foodItem.category,
            } as any,
          });
        }
      } catch (e) {
        console.warn('Failed to JIT estimate price:', e);
      }
    }
    // --- COST CALCULATION END ---

    // 2. If FoodItem has NO base nutrition but we have incoming client nutrition data, CACHE IT
    // Only cache if client provided nutrition AND FoodItem doesn't have it yet
    // This helps populate FoodItem for future use, but doesn't override client-provided values in the log
    if (foodItem && !foodItemAny?.nutritionPerUnit && hasClientNutrition && data.calories !== undefined) {
      // Assume incoming data is for the consumed quantity.
      // We'll standardize to 100 units as a convention if unit is 'g'/'ml', or 1 unit otherwise.
      const isStandardizable = [
        'g',
        'ml',
        'gram',
        'grams',
        'milliliter',
        'milliliters',
      ].includes((data.unit || '').toLowerCase());
      const standardBasis = isStandardizable ? 100 : 1;

      const ratio = standardBasis / (data.quantity || 1);

      const baseNutrition = {
        calories: (data.calories || 0) * ratio,
        protein: (data.protein || 0) * ratio,
        carbohydrates: (data.carbohydrates || 0) * ratio,
        fat: (data.fat || 0) * ratio,
        fiber: (data.fiber || 0) * ratio,
        sugar: (data.sugar || 0) * ratio,
        sodium: (data.sodium || 0) * ratio,
      };

      // Update FoodItem (Source of Truth) for future use
      await prisma.foodItem.update({
        where: { id: foodItem.id },
        data: {
          nutritionPerUnit: baseNutrition,
          nutritionBasis: standardBasis,
          nutritionUnit: data.unit,
        } as any,
      });
    }

    // Create the consumption log
    const consumptionLogData = {
      inventoryId: data.inventoryId || null,
      inventoryItemId: data.inventoryItemId?.startsWith('temp-')
        ? null
        : data.inventoryItemId,
      foodItemId: effectiveFoodItemId, // Use resolved ID
      itemName: data.itemName,
      quantity: data.quantity,
      unit: data.unit,
      cost: calculatedCost, // Save calculated cost
      consumedAt: data.consumedAt || new Date(),
      notes: data.notes,
      ...logNutrients,
    };

    const consumptionLog = await prisma.consumptionLog.create({
      data: {
        ...consumptionLogData,
        userId: user.id,
      } as any,
    });

    // IMPORTANT: Invalidate recommendation cache immediately when consumption is logged
    // This ensures users get fresh recommendations based on their latest consumption
    try {
      const { recommendationService } = await import('../../services/recommendation-service');
      recommendationService.clearUserCache(user.id);
      console.log(`✅ Cleared recommendation cache for user ${user.id} after consumption log`);
    } catch (error) {
      console.error('Failed to clear recommendation cache:', error);
      // Don't fail the consumption log if cache clear fails
    }

    // Update inventory quantity
    if (inventoryItem && inventoryItem.quantity >= data.quantity) {
      const newQuantity = inventoryItem.quantity - data.quantity;
      if (newQuantity <= 0) {
        await prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: 0, removed: true, updatedAt: new Date() },
        });
      } else {
        await prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: newQuantity, updatedAt: new Date() },
        });
      }
    } else if (inventoryItem) {
      throw new Error('Insufficient quantity in inventory to consume');
    }

    return consumptionLog;
  }

  /**
   * Get consumption logs with optional filtering
   */
  async getConsumptionLogs(
    userId: string,
    filters: ConsumptionLogFilters = {},
  ) {
    console.log(
      '🔍 [getConsumptionLogs] === STARTING CONSUMPTION LOGS FETCH ===',
    );
    console.log('🔍 [getConsumptionLogs] User Clerk ID:', userId);
    console.log('🔍 [getConsumptionLogs] Filters received:', {
      startDate: filters?.startDate?.toISOString?.() || filters?.startDate,
      endDate: filters?.endDate?.toISOString?.() || filters?.endDate,
      inventoryId: filters?.inventoryId,
    });

    try {
      // First, find the application user by their Clerk ID
      console.log('🔍 [getConsumptionLogs] Looking up user by Clerk ID...');
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      console.log(
        '🔍 [getConsumptionLogs] Database user found:',
        user ? { id: user.id, clerkId: user.clerkId } : 'NULL',
      );

      if (!user) {
        console.error(
          '❌ [getConsumptionLogs] User not found in database for Clerk ID:',
          userId,
        );
        throw new Error('User not found in database');
      }

      // Check user's inventories
      console.log('🔍 [getConsumptionLogs] Fetching user inventories...');
      const userInventories = await prisma.inventory.findMany({
        where: {
          createdById: user.id,
          isDeleted: false,
        },
        select: { id: true, name: true },
      });

      console.log(
        '🔍 [getConsumptionLogs] User inventories found:',
        userInventories.length,
      );
      console.log('🔍 [getConsumptionLogs] User inventories:', userInventories);

      // Also fetch inventories where user is a member
      console.log('🔍 [getConsumptionLogs] Fetching inventories where user is a member...');
      const memberInventories = await prisma.inventoryMember.findMany({
        where: {
          userId: user.id,
          isDeleted: false,
        },
        select: { inventoryId: true },
      });

      const memberInventoryIds = memberInventories.map(m => m.inventoryId);
      console.log(
        '🔍 [getConsumptionLogs] Member inventories found:',
        memberInventoryIds.length,
      );

      // Initialize whereClause first - Include inventories created by user OR user is a member
      const whereClause: any = {
        OR: [
          {
            inventory: {
              createdById: user.id,
              isDeleted: false,
            },
          },
          {
            inventory: {
              id: {
                in: memberInventoryIds,
              },
              isDeleted: false,
            },
          },
          {
            userId: user.id,
          },
        ],
        isDeleted: false,
      };

      console.log('🔍 [getConsumptionLogs] Building where clause...');

      // Add inventory filter if specified
      if (filters.inventoryId) {
        console.log(
          '🔍 [getConsumptionLogs] Filtering by specific inventory ID:',
          filters.inventoryId,
        );
        const hasAccess = userInventories.some(
          inv => inv.id === filters.inventoryId,
        );
        console.log(
          '🔍 [getConsumptionLogs] User has access to this inventory:',
          hasAccess,
        );
        if (!hasAccess) {
          console.log(
            '⚠️ [getConsumptionLogs] User does not have access to inventory:',
            filters.inventoryId,
          );
          console.log(
            '⚠️ [getConsumptionLogs] Returning empty array instead of error',
          );
          return []; // Return empty array instead of throwing error
        }
        whereClause.inventoryId = filters.inventoryId;
      } else {
        console.log(
          '🔍 [getConsumptionLogs] No specific inventory filter - will fetch from all user inventories',
        );
      }

      // Add date range filters if specified
      if (filters.startDate) {
        console.log(
          '🔍 [getConsumptionLogs] Adding startDate filter:',
          filters.startDate,
        );
        whereClause.consumedAt = {
          ...whereClause.consumedAt,
          gte: filters.startDate,
        };
      }

      if (filters.endDate) {
        console.log(
          '🔍 [getConsumptionLogs] Adding endDate filter:',
          filters.endDate,
        );
        whereClause.consumedAt = {
          ...whereClause.consumedAt,
          lte: filters.endDate,
        };
      }

      // Add category filter if specified
      if (filters.category) {
        console.log(
          '🔍 [getConsumptionLogs] Adding category filter:',
          filters.category,
        );
        whereClause.foodItem = {
          category: filters.category,
        };
      }

      // Add search filter if specified
      if (filters.search) {
        console.log(
          '🔍 [getConsumptionLogs] Adding search filter:',
          filters.search,
        );
        whereClause.itemName = {
          contains: filters.search,
          mode: 'insensitive',
        };
      }

      console.log(
        '🔍 [getConsumptionLogs] Final where clause:',
        JSON.stringify(whereClause, null, 2),
      );

      console.log('🔍 [getConsumptionLogs] Executing database query...');
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      const [consumptionLogs, totalCount, totalCaloriesResult] = await Promise.all([
        prisma.consumptionLog.findMany({
          where: whereClause,
          include: {
            foodItem: {
              select: {
                name: true,
                category: true,
              },
            },
            inventoryItem: {
              select: {
                customName: true,
              },
            },
            inventory: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            consumedAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.consumptionLog.count({ where: whereClause }),
        prisma.consumptionLog.aggregate({
          where: whereClause,
          _sum: {
            calories: true,
          },
        }),
      ]);

      const totalCalories = totalCaloriesResult._sum.calories || 0;

      console.log(
        '🔍 [getConsumptionLogs] Found consumption logs count:',
        consumptionLogs.length,
        'Total count:',
        totalCount,
        'Total Calories:',
        totalCalories
      );
      console.log('🔍 [getConsumptionLogs] === END CONSUMPTION LOGS DEBUG ===');

      return {
        consumptionLogs,
        totalCount,
        totalCalories,
        page,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      console.error(
        '❌ [getConsumptionLogs] Error in getConsumptionLogs:',
        error,
      );
      if (error instanceof Error) {
        console.error('❌ [getConsumptionLogs] Error stack:', error.stack);
        console.error('❌ [getConsumptionLogs] Error message:', error.message);
      }
      throw error;
    }
  }

  /**
   * Get inventory trends for analytics
   */
  async getInventoryTrends(
    userId: string,
    startDate: Date,
    endDate: Date,
    inventoryId?: string,
  ) {
    // First, find the application user by their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found in database');
    }

    const whereClause: any = {
      inventory: {
        createdById: user.id,
      },
      addedAt: {
        gte: startDate,
        lte: endDate,
      },
      isDeleted: false,
    };

    if (inventoryId) {
      whereClause.inventoryId = inventoryId;
    }

    // Get inventory items added during the period
    const itemsAdded = await prisma.inventoryItem.findMany({
      where: whereClause,
      select: {
        addedAt: true,
        expiryDate: true,
      },
    });

    // Count items by date
    const itemsByDate: Record<
      string,
      {
        date: Date;
        totalItems: number;
        expiringItems: number;
        newlyAdded: number;
      }
    > = {};

    for (const item of itemsAdded) {
      const dateKey = item.addedAt.toISOString().split('T')[0];
      if (!itemsByDate[dateKey]) {
        itemsByDate[dateKey] = {
          date: item.addedAt,
          totalItems: 0,
          expiringItems: 0,
          newlyAdded: 0,
        };
      }
      itemsByDate[dateKey].newlyAdded += 1;

      // Check if item is expiring soon
      if (item.expiryDate && item.expiryDate <= new Date()) {
        itemsByDate[dateKey].expiringItems += 1;
      }
    }

    // Calculate total items in inventory at each date
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        inventory: {
          createdById: user.id,
        },
        addedAt: {
          lte: endDate,
        },
        isDeleted: false,
        removed: false,
      },
      select: {
        addedAt: true,
        expiryDate: true,
        removed: true,
      },
    });

    // Group by date and calculate totals
    const allDates = new Set([...Object.keys(itemsByDate)]);
    const dateArray = Array.from(allDates).sort();

    const trends = await Promise.all(
      dateArray.map(async date => {
        const dateObj = new Date(date);
        const itemsInDateRange = inventoryItems.filter(
          item => item.addedAt <= dateObj,
        );

        const totalItems = itemsInDateRange.length;
        const expiringItems = itemsInDateRange.filter(
          item =>
            item.expiryDate && item.expiryDate <= new Date() && !item.removed,
        ).length;

        return {
          date: dateObj,
          totalItems,
          expiringItems,
          newlyAdded: itemsByDate[date]?.newlyAdded || 0,
          consumedItems: 0, // Placeholder - would need consumption logs
        };
      }),
    );

    return trends;
  }

  /**
   * Get consumption patterns for analytics
   */
  async getConsumptionPatterns(userId: string, startDate: Date, endDate: Date) {
    // First, find the application user by their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found in database');
    }

    const consumptionLogs = await prisma.consumptionLog.findMany({
      where: {
        OR: [
          { inventory: { createdById: user.id } },
          { userId: user.id },
        ],
        consumedAt: {
          gte: startDate,
          lte: endDate,
        },
        isDeleted: false,
      },
      include: {
        foodItem: {
          select: {
            category: true,
            basePrice: true,
            nutritionBasis: true
          },
        },
      },
    } as any);

    // Group by category
    const byCategory: Record<
      string,
      { category: string; consumptionCount: number; quantityConsumed: number }
    > = {};
    const byTime: Record<
      string,
      { timePeriod: string; consumptionCount: number }
    > = {};
    const dailyNutrition: Record<
      string,
      {
        date: string;
        calories: number;
        protein: number;
        carbohydrates: number;
        fat: number;
        fiber: number;
        sugar: number;
        sodium: number;
      }
    > = {};
    const dailyCost: Record<string, { date: string; cost: number }> = {};

    for (const log of consumptionLogs) {
      const l = log as any;
      const category = l.foodItem?.category || 'Uncategorized';
      const dateKey = l.consumedAt.toISOString().split('T')[0];

      // 1. Category Aggregation
      if (!byCategory[category]) {
        byCategory[category] = {
          category,
          consumptionCount: 0,
          quantityConsumed: 0,
        };
      }
      byCategory[category].consumptionCount += 1;
      byCategory[category].quantityConsumed += log.quantity;

      // 2. Time Aggregation (Count)
      if (!byTime[dateKey]) {
        byTime[dateKey] = {
          timePeriod: dateKey,
          consumptionCount: 0,
        };
      }
      byTime[dateKey].consumptionCount += 1;

      // 3. Daily Nutrition Aggregation
      if (!dailyNutrition[dateKey]) {
        dailyNutrition[dateKey] = {
          date: dateKey,
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        };
      }
      // Cast to any to access potentially missing types if generation hasn't run
      dailyNutrition[dateKey].calories += l.calories || 0;
      dailyNutrition[dateKey].protein += l.protein || 0;
      dailyNutrition[dateKey].carbohydrates += l.carbohydrates || 0;
      dailyNutrition[dateKey].fat += l.fat || 0;
      dailyNutrition[dateKey].fiber += l.fiber || 0;
      dailyNutrition[dateKey].sugar += l.sugar || 0;
      dailyNutrition[dateKey].sodium += l.sodium || 0;

      // 4. Daily Cost Aggregation
      if (!dailyCost[dateKey]) {
        dailyCost[dateKey] = { date: dateKey, cost: 0 };
      }

      // Use persisted cost if available, otherwise calculate on fly
      let cost = 0;
      if ((log as any).cost !== null && (log as any).cost !== undefined) {
        cost = (log as any).cost;
      } else {
        const pricePerUnit = l.foodItem && l.foodItem.basePrice ? l.foodItem.basePrice : 0;
        if (pricePerUnit > 0) {
          const basis = l.foodItem.nutritionBasis || 1;
          const ratio = l.quantity / basis;
          cost = pricePerUnit * ratio;
        }
      }


      dailyCost[dateKey].cost += cost;
    }

    return {
      byCategory: Object.values(byCategory),
      byTime: Object.values(byTime),
      dailyNutrition: Object.values(dailyNutrition).sort((a, b) => a.date.localeCompare(b.date)),
      dailyCost: Object.values(dailyCost).sort((a, b) => a.date.localeCompare(b.date)),
      wasteReduction: {
        wastePrevented: consumptionLogs.length * 0.5,
        wasteReductionPercentage: 15,
      },
    };
  }

  /**
   * Search for food items using USDA API
   */
  async searchUSDAFood(query: string) {
    return usdaFoodService.searchFood(query);
  }
}

export const inventoryService = new InventoryService();

