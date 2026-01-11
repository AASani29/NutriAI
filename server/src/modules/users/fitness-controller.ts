import { Request, Response } from 'express';
import prisma from '../../config/database';

export const getDailyFitness = async (req: Request, res: Response) => {
    try {
        const { userId: clerkId } = req.params;
        const { date } = req.query;

        const targetDate = date ? new Date(date as string) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        // Resolve Clerk ID to DB ID
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const log = await prisma.fitnessLog.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: targetDate,
                },
            },
        });

        res.json(log || { weight: null, steps: 0, caloriesBurned: 0 });
    } catch (error) {
        console.error('Error fetching fitness log:', error);
        res.status(500).json({ error: 'Failed to fetch fitness log' });
    }
};

export const updateFitnessLog = async (req: Request, res: Response) => {
    try {
        const { userId: clerkId } = req.params;
        const { date, weight, steps, caloriesBurned } = req.body;

        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        // Resolve Clerk ID to DB ID
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const log = await prisma.$transaction(async (tx) => {
            const fitnessLog = await tx.fitnessLog.upsert({
                where: {
                    userId_date: {
                        userId: user.id,
                        date: targetDate,
                    },
                },
                create: {
                    userId: user.id,
                    date: targetDate,
                    weight: weight || null,
                    steps: steps || 0,
                    caloriesBurned: caloriesBurned || 0,
                },
                update: {
                    weight: weight !== undefined ? weight : undefined,
                    steps: steps !== undefined ? steps : undefined,
                    caloriesBurned: caloriesBurned !== undefined ? caloriesBurned : undefined,
                },
            });

            // Sync weight to UserProfile if provided
            if (weight !== undefined && weight !== null) {
                await tx.userProfile.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        weight: weight,
                    },
                    update: {
                        weight: weight,
                    },
                });
            }

            return fitnessLog;
        });

        res.json(log);
    } catch (error) {
        console.error('Error updating fitness log:', error);
        res.status(500).json({ error: 'Failed to update fitness log' });
    }
};
