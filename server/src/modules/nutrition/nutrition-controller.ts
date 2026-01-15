import { Request, Response } from 'express';
import prisma from '../../config/database';
import { userService } from '../users/users-service';
import { NutritionCalculator } from '../../utils/nutrition-calculator';

export const nutritionController = {
  // Get nutrition stats for a specific period
  getNutritionStats: async (req: Request, res: Response) => {
    try {
      const clerkId = req.auth?.userId;
      if (!clerkId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get the database user ID from Clerk ID
      const user = await userService.getUserByClerkId(clerkId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const userId = user.id;

      const { period = 'daily', date } = req.query;
      const queryDate = date ? new Date(date as string) : new Date();

      let startDate: Date;
      let endDate: Date;

      // Helper functions to replace date-fns
      const startOfDay = (d: Date) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date;
      };

      const endOfDay = (d: Date) => {
        const date = new Date(d);
        date.setHours(23, 59, 59, 999);
        return date;
      };

      const startOfMonth = (d: Date) => {
        return new Date(d.getFullYear(), d.getMonth(), 1);
      };

      const endOfMonth = (d: Date) => {
        return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      };

      if (period === 'monthly') {
        startDate = startOfMonth(queryDate);
        endDate = endOfMonth(queryDate);
      } else {
        // daily
        startDate = startOfDay(queryDate);
        endDate = endOfDay(queryDate);
      }

      console.log('🔍 [Nutrition Stats] Fetching for Clerk user:', clerkId);
      console.log('🔍 [Nutrition Stats] Database user ID:', userId);
      console.log('🔍 [Nutrition Stats] Period:', period);
      console.log('🔍 [Nutrition Stats] Date range:', startDate, 'to', endDate);

      // Fetch consumption logs for the period
      const consumptionLogs = await prisma.consumptionLog.findMany({
        where: {
          userId,
          consumedAt: {
            gte: startDate,
            lte: endDate,
          },
          isDeleted: false,
        },
        select: {
          id: true,
          protein: true,
          carbohydrates: true,
          fat: true,
          consumedAt: true,
          itemName: true,
        },
      });

      console.log('🔍 [Nutrition Stats] Found logs:', consumptionLogs.length);
      if (consumptionLogs.length > 0) {
        console.log('🔍 [Nutrition Stats] Sample log:', consumptionLogs[0]);
      }

      // Calculate totals
      const totals = consumptionLogs.reduce(
        (acc: { protein: number; carbohydrates: number; fat: number }, log: any) => ({
          protein: acc.protein + (log.protein || 0),
          carbohydrates: acc.carbohydrates + (log.carbohydrates || 0),
          fat: acc.fat + (log.fat || 0),
        }),
        { protein: 0, carbohydrates: 0, fat: 0 }
      );

      console.log('🔍 [Nutrition Stats] Totals:', totals);

      // Get user profile with goals
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
      });

      // Use user's custom goals if set, otherwise calculate recommendations
      let dailyRecommended = {
        protein: 60,
        carbohydrates: 250,
        fat: 70,
      };

      if (userProfile?.proteinGoal || userProfile?.carbGoal || userProfile?.fatGoal) {
        // User has custom goals
        dailyRecommended = {
          protein: userProfile.proteinGoal || 60,
          carbohydrates: userProfile.carbGoal || 250,
          fat: userProfile.fatGoal || 70,
        };
        console.log('🔍 [Nutrition Stats] Using custom user goals:', dailyRecommended);
      } else if (userProfile?.height && userProfile?.weight) {
        // Calculate based on user metrics
        const recommendations = NutritionCalculator.calculateRecommendations({
          height: userProfile.height,
          weight: userProfile.weight,
          weightPreference: userProfile.weightPreference || undefined,
        });
        dailyRecommended = {
          protein: recommendations.protein,
          carbohydrates: recommendations.carbohydrates,
          fat: recommendations.fat,
        };
        console.log('🔍 [Nutrition Stats] Using AI-calculated goals:', dailyRecommended);
      } else {
        console.log('🔍 [Nutrition Stats] Using default goals:', dailyRecommended);
      }

      // Calculate recommended values based on period
      let recommended = dailyRecommended;
      if (period === 'monthly') {
        const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        recommended = {
          protein: dailyRecommended.protein * daysInPeriod,
          carbohydrates: dailyRecommended.carbohydrates * daysInPeriod,
          fat: dailyRecommended.fat * daysInPeriod,
        };
      }

      // Format response
      const stats = {
        period,
        date: queryDate.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totals: {
          protein: Math.round(totals.protein * 100) / 100,
          carbohydrates: Math.round(totals.carbohydrates * 100) / 100,
          fat: Math.round(totals.fat * 100) / 100,
        },
        recommended: {
          protein: recommended.protein,
          carbohydrates: recommended.carbohydrates,
          fat: recommended.fat,
        },
        percentage: {
          protein: Math.round((totals.protein / recommended.protein) * 100),
          carbohydrates: Math.round((totals.carbohydrates / recommended.carbohydrates) * 100),
          fat: Math.round((totals.fat / recommended.fat) * 100),
        },
      };

      console.log('✅ [Nutrition Stats] Returning stats:', stats);
      return res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching nutrition stats:', error);
      return res.status(500).json({ error: 'Failed to fetch nutrition stats' });
    }
  },

  // Get nutrition history (last 7 days daily or last 12 months)
  getNutritionHistory: async (req: Request, res: Response) => {
    try {
      const clerkId = req.auth?.userId;
      if (!clerkId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get the database user ID from Clerk ID
      const user = await userService.getUserByClerkId(clerkId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const userId = user.id;

      const { type = 'daily' } = req.query;
      const today = new Date();

      let startDate: Date;
      let groupByDay = true;

      if (type === 'monthly') {
        // Last 12 months
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);
        groupByDay = false;
      } else {
        // Last 7 days
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      }

      // Fetch all consumption logs for the period
      const logs = await prisma.consumptionLog.findMany({
        where: {
          userId,
          consumedAt: {
            gte: startDate,
            lte: today,
          },
          isDeleted: false,
        },
        select: {
          protein: true,
          carbohydrates: true,
          fat: true,
          consumedAt: true,
        },
      });

      // Group by date or month
      const grouped: Record<string, any[]> = {};

      logs.forEach((log: any) => {
        const date = new Date(log.consumedAt);
        let key: string;

        if (groupByDay) {
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else {
          key = date.toISOString().substring(0, 7); // YYYY-MM
        }

        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(log);
      });

      // Calculate aggregates for each period
      const history = Object.entries(grouped).map(([period, items]) => {
        const totals = items.reduce(
          (acc: { protein: number; carbohydrates: number; fat: number }, item: any) => ({
            protein: acc.protein + (item.protein || 0),
            carbohydrates: acc.carbohydrates + (item.carbohydrates || 0),
            fat: acc.fat + (item.fat || 0),
          }),
          { protein: 0, carbohydrates: 0, fat: 0 }
        );

        return {
          period,
          ...totals,
        };
      });

      return res.status(200).json({
        type,
        history: history.sort((a, b) => a.period.localeCompare(b.period)),
      });
    } catch (error) {
      console.error('Error fetching nutrition history:', error);
      return res.status(500).json({ error: 'Failed to fetch nutrition history' });
    }
  },
};
