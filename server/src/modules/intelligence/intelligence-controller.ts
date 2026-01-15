import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { aiAnalyticsService } from '../../services/aiAnalyticsService';
import { aiQueue, aiQueueEvents, imageQueue, imageQueueEvents } from '../../config/queue';
import prisma from '../../config/database';
import { inventoryService } from '../inventories/inventory-service';
import { imageService } from '../images/image-service';
import { usdaFoodService } from '../../services/usda-food-service';

export class IntelligentDashboardController {
  // Save a meal plan
  async saveMealPlan(req: Request, res: Response) {
    try {
      const clerkId = req.auth?.userId;
      if (!clerkId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({ where: { clerkId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { plan } = req.body;
      if (!plan) {
        return res.status(400).json({ error: 'Meal plan data is required' });
      }

      const savedPlan = await prisma.mealPlan.create({
        data: {
          userId: user.id,
          weekStartDate: new Date(),
          budget: plan.totalEstimatedCost || 0,
          meals: plan.meals,
          shoppingList: {},
          totalCost: plan.totalEstimatedCost || 0,
          nutritionSummary: {},
          status: 'active',
        },
      });

      res.json({
        success: true,
        data: savedPlan,
        message: 'Meal plan saved successfully',
      });
    } catch (error: any) {
      console.error('Save meal plan error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to save meal plan',
      });
    }
  }

  // Get saved meal plans
  async getSavedMealPlans(req: Request, res: Response) {
    try {
      const clerkId = req.auth?.userId;
      if (!clerkId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({ where: { clerkId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const savedPlans = await prisma.mealPlan.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: savedPlans,
      });
    } catch (error: any) {
      console.error('Get saved plans error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch saved plans',
      });
    }
  }

  // Consume a meal from a plan
  async consumeMeal(req: Request, res: Response) {
    try {
      const clerkId = req.auth?.userId;
      if (!clerkId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { mealName, items, isMarketPurchase } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items list is required' });
      }

      const userInventories = await inventoryService.getUserInventories(clerkId);
      const inventoryId = userInventories[0]?.id;

      if (!inventoryId) {
        return res.status(400).json({ error: 'No inventory found to consume from' });
      }

      const results = [];
      
      // If this is a market purchase (option2), add items to inventory first
      if (isMarketPurchase) {
        for (const itemName of items) {
          try {
            // Search USDA for the item to get nutritional info
            const foodData = await usdaFoodService.searchFood(itemName, 1);
            
            // Add to inventory
            await inventoryService.addInventoryItem(clerkId, inventoryId, {
              customName: itemName,
              quantity: 1,
              unit: 'pcs',
              nutritionPerUnit: foodData[0]?.nutrients || {},
            });
            
            results.push({ item: itemName, status: 'added_to_inventory' });
          } catch (error) {
            console.error(`Failed to add ${itemName} to inventory:`, error);
            results.push({ item: itemName, status: 'failed_to_add', error: (error as Error).message });
          }
        }
      }
      
      // Now consume from inventory
      for (const itemName of items) {
        const inventoryItems = await prisma.inventoryItem.findMany({
          where: {
            inventoryId,
            OR: [
              { customName: { contains: itemName, mode: 'insensitive' } },
              { foodItem: { name: { contains: itemName, mode: 'insensitive' } } }
            ],
            removed: false,
          }
        });

        if (inventoryItems.length > 0) {
          const item = inventoryItems[0];
          await inventoryService.logConsumption(clerkId, {
            inventoryId,
            inventoryItemId: item.id,
            itemName: item.customName || itemName,
            quantity: 1,
            unit: item.unit || 'pcs'
          });
          results.push({ item: itemName, status: 'consumed_from_inventory', inventoryItemId: item.id });
        } else {
          // Fallback: Log consumption even if not in inventory
          await inventoryService.logConsumption(clerkId, {
            inventoryId,
            itemName: itemName,
            quantity: 1,
            unit: 'pcs'
          });
          results.push({ item: itemName, status: 'consumed_external' });
        }
      }

      res.json({
        success: true,
        data: results,
        message: `Processed consumption for ${mealName}. ${isMarketPurchase ? 'Items added to inventory and consumed.' : 'Consumed from existing inventory.'}`,
      });
    } catch (error: any) {
      console.error('Consume meal error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to consume meal',
      });
    }
  }

  // Get recipe for a specific dish and ingredients
  async getRecipe(req: Request, res: Response) {
    try {
      const { dishName, ingredients } = req.body;
      if (!dishName) {
        return res.status(400).json({ error: 'Dish name is required' });
      }

      const recipe = await aiAnalyticsService.generateRecipe(dishName, ingredients);

      res.json({
        success: true,
        data: recipe,
      });
    } catch (error: any) {
      console.error('Get recipe error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate recipe',
      });
    }
  }

  // Get AI-powered dashboard insights
  async getDashboardInsights(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const insights = await aiAnalyticsService.getDashboardInsights(userId);

      res.json({
        success: true,
        data: insights,
        message: 'Dashboard insights generated successfully',
      });
    } catch (error: any) {
      console.error('Dashboard insights error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate dashboard insights',
      });
    }
  }

  // Chat with AI for personalized insights
  async chatWithAI(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          error: 'Query is required and must be a string',
        });
      }

      const response = await aiAnalyticsService.generateIntelligentInsights(
        userId,
        query,
      );

      res.json({
        success: true,
        data: response,
        message: 'AI response generated successfully',
      });
    } catch (error: any) {
      console.error('AI chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate AI response',
      });
    }
  }

  // Get consumption pattern analysis
  async getConsumptionAnalysis(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { timeframe = '30days' } = req.query;

      const analysis = await aiAnalyticsService.getConsumptionAnalysis(
        userId,
        timeframe as string,
      );

      res.json({
        success: true,
        data: analysis,
        timeframe,
        message: 'Consumption analysis completed',
      });
    } catch (error: any) {
      console.error('Consumption analysis error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to analyze consumption patterns',
      });
    }
  }

  // Get waste prediction and prevention suggestions
  async getWastePrediction(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const query = `Predict potential food waste in my current inventory. 
                     Show me items at risk and suggest prevention strategies.`;

      // Offload to BullMQ
      const job = await aiQueue.add('ANALYZE_WASTE', {
        userId,
        action: 'ANALYZE_WASTE',
        data: { query }
      });

      console.log(`🧠 [Controller] Queued Waste Analysis job: ${job.id}`);

      // Wait for result (timeout 30s)
      const prediction = await job.waitUntilFinished(aiQueueEvents, 30000);

      res.json({
        success: true,
        data: prediction,
        message: 'Waste prediction completed',
      });
    } catch (error: any) {
      console.error('Waste prediction error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to predict waste',
      });
    }
  }

  // Get optimized meal plan
  async getOptimizedMealPlan(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { budget, timePeriod, preferences, notes, userStats } = req.body;

      let query = `Generate a price-smart meal plan for the period: ${timePeriod || 'one_day'}. `;
      if (budget) query += `The total budget for this entire period is ${budget} BDT. `;
      
      // Add comprehensive nutrition gap analysis to guide AI suggestions
      if (userStats) {
        query += `\n\n🔴 CRITICAL: NUTRIENT-TARGETED MEAL PLANNING 🔴\n`;
        query += `\nYour Nutritional Status TODAY:\n`;
        query += `✓ Calories consumed: ${Math.round(userStats.consumed?.calories || 0)}/${userStats.energyGoal} kcal (${Math.round((userStats.consumed?.calories || 0) / userStats.energyGoal * 100)}% - ${Math.round(userStats.remaining?.calories || 0)} kcal REMAINING)\n`;
        query += `✓ Protein consumed: ${Math.round(userStats.consumed?.protein || 0)}/${userStats.proteinGoal}g (${Math.round((userStats.consumed?.protein || 0) / userStats.proteinGoal * 100)}% - ${Math.round(userStats.remaining?.protein || 0)}g REMAINING)\n`;
        query += `✓ Carbs consumed: ${Math.round(userStats.consumed?.carbs || 0)}/${userStats.carbsGoal}g (${Math.round((userStats.consumed?.carbs || 0) / userStats.carbsGoal * 100)}% - ${Math.round(userStats.remaining?.carbs || 0)}g REMAINING)\n`;
        query += `✓ Fats consumed: ${Math.round(userStats.consumed?.fat || 0)}/${userStats.fatsGoal}g (${Math.round((userStats.consumed?.fat || 0) / userStats.fatsGoal * 100)}% - ${Math.round(userStats.remaining?.fats || 0)}g REMAINING)\n`;
        
        // Calculate completion percentages - target the LOWEST percentage (biggest deficiency)
        const proteinPercent = Math.round((userStats.consumed?.protein || 0) / userStats.proteinGoal * 100);
        const carbsPercent = Math.round((userStats.consumed?.carbs || 0) / userStats.carbsGoal * 100);
        const fatsPercent = Math.round((userStats.consumed?.fat || 0) / userStats.fatsGoal * 100);
        
        const gaps = [
          { name: 'PROTEIN', consumed: Math.round(userStats.consumed?.protein || 0), goal: userStats.proteinGoal, percent: proteinPercent, remaining: Math.round(userStats.remaining?.protein || 0), foods: 'Eggs, Chicken, Fish, Lentils, Paneer, Yogurt, Tofu' },
          { name: 'CARBS', consumed: Math.round(userStats.consumed?.carbs || 0), goal: userStats.carbsGoal, percent: carbsPercent, remaining: Math.round(userStats.remaining?.carbs || 0), foods: 'Rice, Bread, Oats, Potatoes, Sweet Potatoes, Fruits' },
          { name: 'FATS', consumed: Math.round(userStats.consumed?.fat || 0), goal: userStats.fatsGoal, percent: fatsPercent, remaining: Math.round(userStats.remaining?.fats || 0), foods: 'Nuts, Seeds, Avocado, Olive Oil, Ghee, Cheese, Coconut Oil' }
        ].sort((a, b) => a.percent - b.percent); // Sort by LOWEST percentage first (biggest deficiency)
        
        query += `\n🎯 NUTRIENT DEFICIENCY RANKING (sorted by completion %):\n`;
        gaps.forEach((gap, i) => {
          query += `${i + 1}. ${gap.name}: ${gap.percent}% complete (${gap.consumed}/${gap.goal}g - need ${gap.remaining}g more)\n`;
        });
        
        query += `\n🔴 MANDATORY NUTRIENT TARGETING (YOU MUST FOLLOW THIS):\n`;
        query += `1️⃣ PRIMARY FOCUS - MOST DEFICIENT (${gaps[0].percent}% complete): AGGRESSIVELY target ${gaps[0].name}\n`;
        query += `   - This is your BIGGEST deficiency. Every meal MUST be rich in ${gaps[0].name}.\n`;
        query += `   - MUST include these ingredients: ${gaps[0].foods}\n`;
        query += `   - Do NOT create meals without strong ${gaps[0].name} content.\n`;
        query += `   - Examples of ${gaps[0].name}-focused meals: `;
        
        if (gaps[0].name === 'PROTEIN') {
          query += `Grilled Chicken + Rice, Egg Bhurji + Roti, Fish Curry, Paneer Tikka + Naan, Lentil Dal + Rice, Yogurt Bowl with Granola, Tofu Stir-fry\n`;
        } else if (gaps[0].name === 'CARBS') {
          query += `Vegetable Khichuri, Brown Rice + Dal, Oatmeal + Fruit, Sweet Potato + Lentils, Bread + Avocado, Rice Pudding, Potato Curry with Rice\n`;
        } else if (gaps[0].name === 'FATS') {
          query += `Nut Butter Toast, Avocado Salad, Cheese Omelette + Olive Oil, Seeds + Granola, Ghee-roasted Vegetables, Coconut Rice, Walnut Khichuri\n`;
        }
        
        query += `2️⃣ SECONDARY FOCUS (${gaps[1].percent}% complete): Include ${gaps[1].name}-rich components alongside primary focus\n`;
        query += `3️⃣ THIRD PRIORITY (${gaps[2].percent}% complete): Minimal focus. Only add as side component if needed.\n`;
        
        query += `\n⚡ STRICT RULES:\n`;
        query += `⚡ Every meal MUST target the lowest percentage nutrient (${gaps[0].name} at ${gaps[0].percent}%).\n`;
        query += `⚡ Do NOT create balanced meals - focus heavily on the deficiency.\n`;
        query += `⚡ Ensure nutrition values in JSON accurately represent the meal.\n`;
        query += `⚡ Prioritize ${gaps[0].name}-rich foods FIRST, then build the rest of the meal around it.\n`;
      }
      
      if (preferences)
        query += `Dietary preferences: ${JSON.stringify(preferences)}. `;
      if (notes)
        query += `IMPORTANT USER CONSIDERATION/NOTE: "${notes}". Adapt the meal choices according to this note. `;
      query += `\n\nCRITICAL INVENTORY RULE: For option1 (inventory option), ONLY include items that ACTUALLY exist in my inventory. Check my inventory items carefully. If an ingredient is NOT in my inventory, do NOT include it in option1.items array. If you cannot find enough inventory items to make a complete meal, leave option1 as null or with empty items array. Do NOT hallucinate inventory items.\n`;
      query += `Return the result in the requested JSON format.`;

      const mealPlan = await aiAnalyticsService.generateIntelligentInsights(
        userId,
        query,
      );

      if (!mealPlan.success) {
        throw new Error(mealPlan.error || 'Failed to generate meal plan');
      }

      res.json({
        success: true,
        data: mealPlan,
        message: 'Meal plan optimized successfully',
      });
    } catch (error: any) {
      console.error('Meal plan optimization error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to optimize meal plan',
      });
    }
  }

  // Get nutrition gap analysis
  async getNutritionAnalysis(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const query = `Analyze my recent nutrition intake and identify any nutrient gaps. 
                     Provide specific recommendations to improve my diet balance.`;

      const nutritionAnalysis =
        await aiAnalyticsService.generateIntelligentInsights(userId, query);

      res.json({
        success: true,
        data: nutritionAnalysis,
        message: 'Nutrition analysis completed',
      });
    } catch (error: any) {
      console.error('Nutrition analysis error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to analyze nutrition',
      });
    }
  }

  // Get environmental and financial impact
  async getImpactAnalytics(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const query = `Generate my personalized impact analytics. 
                     Show environmental benefits, cost savings, and health improvements 
                     from using this app. Include achievements and future projections.`;

      const impact = await aiAnalyticsService.generateIntelligentInsights(
        userId,
        query,
      );

      res.json({
        success: true,
        data: impact,
        message: 'Impact analytics generated successfully',
      });
    } catch (error: any) {
      console.error('Impact analytics error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate impact analytics',
      });
    }
  }

  // Get local food sharing opportunities
  async getSharingOpportunities(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { location } = req.query;

      let query = `Find local food sharing opportunities near me. `;
      if (location) query += `My location is: ${location}. `;
      query += `Show me ways to donate excess food and connect with my community.`;

      const opportunities =
        await aiAnalyticsService.generateIntelligentInsights(userId, query);

      res.json({
        success: true,
        data: opportunities,
        message: 'Sharing opportunities found successfully',
      });
    } catch (error: any) {
      console.error('Sharing opportunities error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to find sharing opportunities',
      });
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const query = `Based on my complete food management history, provide personalized 
                     recommendations for reducing waste, improving nutrition, saving money, 
                     and helping the environment. Make them specific and actionable.`;

      const recommendations =
        await aiAnalyticsService.generateIntelligentInsights(userId, query);

      res.json({
        success: true,
        data: recommendations,
        message: 'Personalized recommendations generated',
      });
    } catch (error: any) {
      console.error('Recommendations error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate recommendations',
      });
    }
  }

  // Get smart alerts
  async getSmartAlerts(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const query = `Generate smart alerts for me based on my current inventory and patterns. 
                     Alert me about items expiring soon, optimal shopping times, meal prep 
                     reminders, and achievement unlocks.`;

      const alerts = await aiAnalyticsService.generateIntelligentInsights(
        userId,
        query,
      );

      res.json({
        success: true,
        data: alerts,
        message: 'Smart alerts generated successfully',
      });
    } catch (error: any) {
      console.error('Smart alerts error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate smart alerts',
      });
    }
  }

  // Get goal tracking and progress
  async getGoalProgress(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { goals } = req.body;

      let query = `Track my progress toward food waste reduction and health goals. `;
      if (goals) query += `My specific goals are: ${JSON.stringify(goals)}. `;
      query += `Show current progress, achievements, and next steps.`;

      const progress = await aiAnalyticsService.generateIntelligentInsights(
        userId,
        query,
      );

      res.json({
        success: true,
        data: progress,
        message: 'Goal progress tracked successfully',
      });
    } catch (error: any) {
      console.error('Goal progress error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to track goal progress',
      });
    }
  }

  // Get seasonal insights and tips
  async getSeasonalInsights(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const currentMonth = new Date().toLocaleString('default', {
        month: 'long',
      });

      const query = `Provide seasonal insights and tips for ${currentMonth}. 
                     Include seasonal foods to focus on, preservation techniques, 
                     and relevant sustainability practices for this time of year.`;

      const seasonalInsights =
        await aiAnalyticsService.generateIntelligentInsights(userId, query);

      res.json({
        success: true,
        data: seasonalInsights,
        season: currentMonth,
        message: 'Seasonal insights generated successfully',
      });
    } catch (error: any) {
      console.error('Seasonal insights error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate seasonal insights',
      });
    }
  }
  // Estimate nutrition
  async estimateNutrition(req: Request, res: Response) {
    try {
      const {
        foodName,
        quantity,
        unit,
        nutritionPerUnit,
        nutritionUnit,
        nutritionBasis,
      } = req.body;
      if (!foodName || !quantity || !unit) {
        return res.status(400).json({
          error: 'foodName, quantity, and unit are required',
        });
      }

      const baseData =
        nutritionPerUnit && nutritionBasis
          ? { nutritionPerUnit, nutritionUnit, nutritionBasis }
          : undefined;

      const nutrition = await aiAnalyticsService.estimateNutrition(
        foodName,
        Number(quantity),
        unit,
        baseData,
      );

      res.json({
        success: true,
        data: nutrition,
        message: 'Nutrition estimated successfully',
      });
    } catch (error: any) {
      console.error('Nutrition estimation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to estimate nutrition',
      });
    }
  }

  // Estimate price
  async estimatePrice(req: Request, res: Response) {
    try {
      const {
        foodName,
        quantity,
        unit,
        basePrice,
        nutritionUnit,
        nutritionBasis,
        coordinates,
        region // Add region
      } = req.body;
      if (!foodName || !quantity || !unit) {
        return res.status(400).json({
          error: 'foodName, quantity, and unit are required',
        });
      }

      const baseData =
        basePrice && nutritionBasis
          ? { basePrice, nutritionUnit, nutritionBasis }
          : undefined;

      const price = await aiAnalyticsService.estimatePrice(
        foodName,
        Number(quantity),
        unit,
        baseData,
        coordinates,
        region // Pass region
      );

      res.json({
        success: true,
        data: price,
        message: 'Price estimated successfully',
      });
    } catch (error: any) {
      console.error('Price estimation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to estimate price',
      });
    }
  }
  // Estimate item details
  async estimateItemDetails(req: Request, res: Response) {
    try {
      const { foodName, region } = req.body;
      if (!foodName) {
        return res.status(400).json({
          error: 'foodName is required',
        });
      }

      const details = await aiAnalyticsService.estimateItemDetails(
        foodName,
        region,
      );

      res.json({
        success: true,
        data: details,
        message: 'Item details estimated successfully',
      });
    } catch (error: any) {
      console.error('Item details estimation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to estimate item details',
      });
    }
  }

  // Analyze image for direct consumption (OCR) - Synchronous-ish
  async analyzeImage(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!req.files || !req.files.image) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const imageFile = req.files.image as UploadedFile;

      // 1. Upload to Cloudinary (Stores as File record but unlinked to inventory)
      console.log('🖼️ [Intelligence] Uploading image for analysis...');
      const savedFile = await imageService.uploadImage(imageFile, userId, {});

      console.log('✅ [Intelligence] Image uploaded:', savedFile.url);

      // 2. Queue OCR job
      const job = await imageQueue.add('process-ocr', {
        userId,
        file: { ...savedFile },
        metadata: {
          imageUrl: savedFile.url,
          extractItems: true,
        },
        type: 'process-ocr',
      });

      console.log(`🧠 [Intelligence] Queued OCR job: ${job.id}`);

      // 3. Wait for result (timeout 30s)
      // Note: We need imageQueueEvents to wait for this specific queue
      const result = await job.waitUntilFinished(imageQueueEvents, 30000);

      res.json({
        success: true,
        data: {
          items: result.data || [],
          imageId: savedFile.id,
          imageUrl: savedFile.url,
        },
        message: 'Image analyzed successfully',
      });
    } catch (error: any) {
      console.error('Image analysis error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to analyze image',
      });
    }
  }


  // Analyze voice for direct consumption (Transcription)
  async analyzeVoice(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!req.files || !req.files.audio) {
        return res.status(400).json({ error: 'No audio file provided' });
      }

      const audioFile = req.files.audio as UploadedFile;
      const tempFilePath = `/tmp/upload_${Date.now()}_${audioFile.name}`;
      await audioFile.mv(tempFilePath);
      console.log('🎤 [Intelligence] Audio uploaded to temp:', tempFilePath);

      // Dynamically import VoiceService to avoid circular deps if any
      const { voiceService } = await import('../../services/voice-service');
      const result = await voiceService.transcribeAudio(tempFilePath);

      // Cleanup
      try {
        const fs = await import('fs');
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.warn('Failed to cleanup temp audio file:', e);
      }

      res.json({
        success: true,
        data: {
          text: result.text,
          language: result.language,
        },
        message: 'Voice transcribed successfully',
      });
    } catch (error: any) {
      console.error('Voice analysis error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to analyze voice',
      });
    }
  }
}

export const intelligentDashboardController =
  new IntelligentDashboardController();
