import { Request, Response } from 'express';
import prisma from '../../config/database';

export const getDailyHydration = async (req: Request, res: Response) => {
    try {
        const { userId: clerkId } = req.params;
        const dateQuery = req.query.date as string;

        // Normalize date to start of day
        const date = dateQuery ? new Date(dateQuery) : new Date();
        date.setHours(0, 0, 0, 0);

        // Resolve Clerk ID to DB ID
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const log = await prisma.hydrationLog.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date,
                },
            },
        });

        res.json({
            amount: log?.amount || 0,
            goal: log?.goal || 2.5
        });
    } catch (error) {
        console.error('Error fetching hydration:', error);
        res.status(500).json({ error: 'Failed to fetch hydration log' });
    }
};

export const updateDailyHydration = async (req: Request, res: Response) => {
    try {
        const { userId: clerkId } = req.params;
        const { amount, date } = req.body; // absolute new amount

        const logDate = date ? new Date(date) : new Date();
        logDate.setHours(0, 0, 0, 0);

        // Resolve Clerk ID to DB ID
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const log = await prisma.hydrationLog.upsert({
            where: {
                userId_date: {
                    userId: user.id,
                    date: logDate,
                },
            },
            update: {
                amount: parseFloat(amount),
            },
            create: {
                userId: user.id,
                date: logDate,
                amount: parseFloat(amount),
                goal: 2.5,
            },
        });

        res.json(log);
    } catch (error) {
        console.error('Error updating hydration:', error);
        res.status(500).json({ error: 'Failed to update hydration log' });
    }
};

export const getHydrationHistory = async (req: Request, res: Response) => {
    try {
        const { userId: clerkId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            res.status(400).json({ error: 'startDate and endDate are required' });
            return;
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        // Ensure full day coverage
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Resolve Clerk ID to DB ID
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const logs = await prisma.hydrationLog.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching hydration history:', error);
        res.status(500).json({ error: 'Failed to fetch hydration history' });
    }
};
