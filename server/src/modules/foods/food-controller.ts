import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all food items with optional filtering
export const getFoodItems = async (req: Request, res: Response) => {
  try {
    const { category, minExpiration, maxExpiration } = req.query;

    const whereClause: any = {
      isDeleted: false,
    };

    // Add category filter if provided
    if (category) {
      whereClause.category = { contains: category as string, mode: 'insensitive' };
    }

    // Add expiration filters if provided
    if (minExpiration) {
      whereClause.typicalExpirationDays = {
        ...(whereClause.typicalExpirationDays || {}),
        gte: parseInt(minExpiration as string),
      };
    }

    if (maxExpiration) {
      whereClause.typicalExpirationDays = {
        ...(whereClause.typicalExpirationDays || {}),
        lte: parseInt(maxExpiration as string),
      };
    }

    const foodItems = await prisma.foodItem.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      data: foodItems,
    });
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching food items',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get a specific food item by ID
export const getFoodItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const foodItem = await prisma.foodItem.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    res.json({
      success: true,
      data: foodItem,
    });
  } catch (error) {
    console.error('Error fetching food item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching food item',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create a new food item
export const createFoodItem = async (req: Request, res: Response) => {
  try {
    const { name, unit, category, typicalExpirationDays, sampleCostPerUnit, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    const newFoodItem = await prisma.foodItem.create({
      data: {
        name,
        unit,
        category,
        typicalExpirationDays: typicalExpirationDays ? parseInt(typicalExpirationDays) : null,
        sampleCostPerUnit: sampleCostPerUnit ? parseFloat(sampleCostPerUnit) : null,
        description,
      },
    });

    res.status(201).json({
      success: true,
      data: newFoodItem,
    });
  } catch (error) {
    console.error('Error creating food item:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating food item',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update a food item
export const updateFoodItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, unit, category, typicalExpirationDays, sampleCostPerUnit, description } = req.body;

    const existingItem = await prisma.foodItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    const updatedFoodItem = await prisma.foodItem.update({
      where: { id },
      data: {
        name,
        unit,
        category,
        typicalExpirationDays: typicalExpirationDays !== undefined ? parseInt(typicalExpirationDays) : undefined,
        sampleCostPerUnit: sampleCostPerUnit !== undefined ? parseFloat(sampleCostPerUnit) : undefined,
        description,
      },
    });

    res.json({
      success: true,
      data: updatedFoodItem,
    });
  } catch (error) {
    console.error('Error updating food item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating food item',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete a food item (soft delete)
export const deleteFoodItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingItem = await prisma.foodItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    await prisma.foodItem.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting food item',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};