import { Router } from 'express';
import { 
  getFoodItems, 
  getFoodItemById, 
  createFoodItem, 
  updateFoodItem, 
  deleteFoodItem 
} from './food-controller';

const router = Router();

// Routes for food items
router.get('/', getFoodItems);           // Get all food items with optional filtering
router.get('/:id', getFoodItemById);     // Get a specific food item
router.post('/', createFoodItem);        // Create a new food item
router.put('/:id', updateFoodItem);      // Update a food item
router.delete('/:id', deleteFoodItem);   // Delete a food item

export { router as foodRouter };