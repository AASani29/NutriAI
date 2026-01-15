import { Router } from 'express';
import { recipeController } from './recipe-controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// GET /api/recipes/search?q=...
router.get('/search', requireAuth, recipeController.searchRecipes.bind(recipeController));

export default router;
