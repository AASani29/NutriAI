import express, { Request, Response } from 'express';
import { requireAuth, ensureUserExists } from '../../middleware/auth';
import { nutritionController } from './nutrition-controller';

export const nutritionRouter = express.Router();

// Apply authentication and user existence middleware to all routes
nutritionRouter.use(requireAuth);
nutritionRouter.use(ensureUserExists);

// Get nutrition stats for a specific period
nutritionRouter.get('/stats', (req: Request, res: Response) =>
  nutritionController.getNutritionStats(req, res)
);

// Get nutrition history
nutritionRouter.get('/history', (req: Request, res: Response) =>
  nutritionController.getNutritionHistory(req, res)
);
