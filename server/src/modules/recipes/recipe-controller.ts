import { Request, Response } from 'express';
import { recipeScoutService } from './recipe-scout-service';

export class RecipeController {

    /**
     * Search for recipes using the Recipe Scout (DB -> API -> AI)
     */
    async searchRecipes(req: Request, res: Response) {
        try {
            const { q } = req.query;

            if (!q || typeof q !== 'string') {
                res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
                return;
            }

            const recipes = await recipeScoutService.findRecipe(q);

            res.json({
                success: true,
                count: recipes.length,
                data: recipes
            });

        } catch (error: any) {
            console.error('Search recipes error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search recipes',
                error: error.message
            });
        }
    }
}

export const recipeController = new RecipeController();
