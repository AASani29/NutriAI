import prisma from '../config/database';

interface UserAnalytics {
    wasteReductionPercentage: number;
    averageDailySpending: number;
    averageWeeklySpending: number;
    budgetRange: number | null;
    dietaryPreference: string | null;
    allergies: string | null;
    healthConditions: string | null;
    topFoodCategories: string[];
    inventoryItemCount: number;
    consumptionFrequency: number; // items consumed per week
    spendingTier: 'budget-conscious' | 'moderate' | 'flexible';
    primaryConcerns: string[]; // e.g., ['budget', 'waste-reduction', 'nutrition']
}

interface RecommendationKeywords {
    primary: string[];
    secondary: string[];
    dietary: string[];
    categorySpecific: string[];
}

export class UserAnalyticsService {
    /**
     * Calculate comprehensive user analytics for personalized recommendations
     */
    async getUserAnalytics(userId: string): Promise<UserAnalytics> {
        // Fetch user profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Calculate waste reduction percentage
        const wasteReductionPercentage = await this.calculateWasteReduction(userId);

        // Calculate spending patterns
        const { averageDailySpending, averageWeeklySpending } = await this.calculateSpendingPatterns(userId);

        // Get inventory composition
        const { topCategories, itemCount } = await this.analyzeInventoryComposition(userId);

        // Calculate consumption frequency
        const consumptionFrequency = await this.calculateConsumptionFrequency(userId);

        // Determine spending tier
        const spendingTier = this.determineSpendingTier(
            user.profile?.budgetRange || null,
            averageWeeklySpending
        );

        // Identify primary concerns
        const primaryConcerns = this.identifyPrimaryConcerns(
            wasteReductionPercentage,
            spendingTier,
            user.profile?.budgetRange || null
        );

        return {
            wasteReductionPercentage,
            averageDailySpending,
            averageWeeklySpending,
            budgetRange: user.profile?.budgetRange || null,
            dietaryPreference: user.profile?.dietaryPreference || null,
            allergies: user.profile?.allergies || null,
            healthConditions: user.profile?.healthConditions || null,
            topFoodCategories: topCategories,
            inventoryItemCount: itemCount,
            consumptionFrequency,
            spendingTier,
            primaryConcerns,
        };
    }

    /**
     * Calculate waste reduction percentage based on consumption logs
     * Formula: (consumed items / (consumed + expired items)) * 100
     */
    private async calculateWasteReduction(userId: string): Promise<number> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get user's inventories
        const userInventories = await prisma.inventory.findMany({
            where: {
                OR: [
                    { createdById: userId },
                    { members: { some: { userId } } },
                ],
            },
            select: { id: true },
        });

        const inventoryIds = userInventories.map(inv => inv.id);

        if (inventoryIds.length === 0) {
            return 100; // Default to 100% if no data
        }

        // Count consumed items
        const consumedCount = await prisma.consumptionLog.count({
            where: {
                inventoryId: { in: inventoryIds },
                consumedAt: { gte: thirtyDaysAgo },
            },
        });

        // Count expired/wasted items (items that expired without being consumed)
        const expiredItems = await prisma.inventoryItem.count({
            where: {
                inventoryId: { in: inventoryIds },
                expiryDate: {
                    gte: thirtyDaysAgo,
                    lte: new Date(),
                },
                removed: false,
                consumptionLogs: {
                    none: {},
                },
            },
        });

        const totalItems = consumedCount + expiredItems;
        if (totalItems === 0) {
            return 100;
        }

        return Math.round((consumedCount / totalItems) * 100);
    }

    /**
     * Calculate average daily and weekly spending from consumption logs
     */
    private async calculateSpendingPatterns(userId: string): Promise<{
        averageDailySpending: number;
        averageWeeklySpending: number;
    }> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get user's inventories
        const userInventories = await prisma.inventory.findMany({
            where: {
                OR: [
                    { createdById: userId },
                    { members: { some: { userId } } },
                ],
            },
            select: { id: true },
        });

        const inventoryIds = userInventories.map(inv => inv.id);

        if (inventoryIds.length === 0) {
            return { averageDailySpending: 0, averageWeeklySpending: 0 };
        }

        // Sum total costs from consumption logs
        const consumptionLogs = await prisma.consumptionLog.findMany({
            where: {
                inventoryId: { in: inventoryIds },
                consumedAt: { gte: thirtyDaysAgo },
                cost: { not: null },
            },
            select: {
                cost: true,
            },
        });

        const totalSpending = consumptionLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
        const averageDailySpending = totalSpending / 30;
        const averageWeeklySpending = (totalSpending / 30) * 7;

        return {
            averageDailySpending: Math.round(averageDailySpending * 100) / 100,
            averageWeeklySpending: Math.round(averageWeeklySpending * 100) / 100,
        };
    }

    /**
     * Analyze inventory composition to identify top food categories
     */
    private async analyzeInventoryComposition(userId: string): Promise<{
        topCategories: string[];
        itemCount: number;
    }> {
        // Get user's inventories
        const userInventories = await prisma.inventory.findMany({
            where: {
                OR: [
                    { createdById: userId },
                    { members: { some: { userId } } },
                ],
            },
            select: { id: true },
        });

        const inventoryIds = userInventories.map(inv => inv.id);

        if (inventoryIds.length === 0) {
            return { topCategories: [], itemCount: 0 };
        }

        // Get current inventory items with their food item categories
        const inventoryItems = await prisma.inventoryItem.findMany({
            where: {
                inventoryId: { in: inventoryIds },
                removed: false,
                isDeleted: false,
            },
            include: {
                foodItem: {
                    select: {
                        category: true,
                    },
                },
            },
        });

        const itemCount = inventoryItems.length;

        // Count categories
        const categoryCount: Record<string, number> = {};
        inventoryItems.forEach(item => {
            const category = item.foodItem?.category;
            if (category) {
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            }
        });

        // Sort by count and get top 3
        const topCategories = Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);

        return { topCategories, itemCount };
    }

    /**
     * Calculate how many items user consumes per week on average
     */
    private async calculateConsumptionFrequency(userId: string): Promise<number> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get user's inventories
        const userInventories = await prisma.inventory.findMany({
            where: {
                OR: [
                    { createdById: userId },
                    { members: { some: { userId } } },
                ],
            },
            select: { id: true },
        });

        const inventoryIds = userInventories.map(inv => inv.id);

        if (inventoryIds.length === 0) {
            return 0;
        }

        const consumptionCount = await prisma.consumptionLog.count({
            where: {
                inventoryId: { in: inventoryIds },
                consumedAt: { gte: thirtyDaysAgo },
            },
        });

        // Convert to weekly average
        return Math.round((consumptionCount / 30) * 7 * 10) / 10;
    }

    /**
     * Determine user's spending tier based on budget and actual spending
     */
    private determineSpendingTier(
        budgetRange: number | null,
        averageWeeklySpending: number
    ): 'budget-conscious' | 'moderate' | 'flexible' {
        // If budget is set and spending is close to or exceeds it, user is budget-conscious
        if (budgetRange !== null) {
            const monthlyBudget = budgetRange;
            const weeklyBudget = monthlyBudget / 4;

            if (averageWeeklySpending >= weeklyBudget * 0.8) {
                return 'budget-conscious';
            }
            if (averageWeeklySpending >= weeklyBudget * 0.5) {
                return 'moderate';
            }
            return 'flexible';
        }

        // If no budget set, categorize by spending amount (in BDT)
        if (averageWeeklySpending < 1500) {
            return 'budget-conscious';
        }
        if (averageWeeklySpending < 3000) {
            return 'moderate';
        }
        return 'flexible';
    }

    /**
     * Identify user's primary concerns for targeted recommendations
     */
    private identifyPrimaryConcerns(
        wasteReductionPercentage: number,
        spendingTier: string,
        budgetRange: number | null
    ): string[] {
        const concerns: string[] = [];

        // Budget is a concern if user has set a budget or is budget-conscious
        if (budgetRange !== null || spendingTier === 'budget-conscious') {
            concerns.push('budget');
        }

        // Waste reduction is a concern if percentage is below 80%
        if (wasteReductionPercentage < 80) {
            concerns.push('waste-reduction');
        }

        // Nutrition is always a secondary concern
        concerns.push('nutrition');

        return concerns;
    }

    /**
     * Generate search keywords based on user analytics
     */
    async generateRecommendationKeywords(userId: string): Promise<RecommendationKeywords> {
        const analytics = await this.getUserAnalytics(userId);

        const primary: string[] = [];
        const secondary: string[] = [];
        const dietary: string[] = [];
        const categorySpecific: string[] = [];

        // Primary keywords based on main concerns
        if (analytics.primaryConcerns.includes('budget')) {
            primary.push('budget meal planning', 'cheap healthy recipes', 'affordable nutrition');
            primary.push('budget-friendly cooking', 'save money on groceries');
        }

        if (analytics.primaryConcerns.includes('waste-reduction')) {
            primary.push('food waste reduction', 'zero waste cooking', 'leftover recipes');
            primary.push('reduce food waste', 'food storage tips');
        }

        // Dietary-specific keywords
        if (analytics.dietaryPreference) {
            const pref = analytics.dietaryPreference.toLowerCase();
            dietary.push(`${pref} recipes`, `${pref} meal prep`, `${pref} nutrition`);
        }

        // Category-specific keywords
        analytics.topFoodCategories.forEach(category => {
            categorySpecific.push(`${category} storage tips`, `${category} recipes`);
            categorySpecific.push(`how to use ${category}`);
        });

        // Secondary general keywords
        secondary.push('meal planning', 'healthy eating', 'nutrition tips');
        secondary.push('food sustainability', 'grocery shopping tips');

        // Add health condition specific keywords
        if (analytics.healthConditions) {
            const conditions = analytics.healthConditions.toLowerCase();
            secondary.push(`${conditions} diet`, `${conditions} nutrition`);
        }

        return {
            primary,
            secondary,
            dietary,
            categorySpecific,
        };
    }
}

export const userAnalyticsService = new UserAnalyticsService();
