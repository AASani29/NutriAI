import prisma from '../../config/database';
import axios from 'axios';
import { tavilyService } from '../../services/tavily-service';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface RecipeResult {
    id?: string;
    name: string;
    description?: string;
    cuisine?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    ingredients: any[];
    instructions: any[];
    nutrition?: any;
    source: string; // "Local DB", "TheMealDB", "AI Scout"
    sourceUrl?: string;
}

export class RecipeScoutService {

    /**
     * Main entry point: Search for a recipe using the waterfall method.
     */
    async findRecipe(query: string): Promise<RecipeResult[]> {
        console.log(`[RecipeScout] Searching for: "${query}"`);

        // 1. Stage 1: Check Local Database
        const localRecipes = await this.searchLocalDB(query);
        if (localRecipes.length > 0) {
            console.log(`[RecipeScout] Found ${localRecipes.length} local recipes.`);
            return localRecipes;
        }

        // 2. Stage 2: Check TheMealDB (Free API)
        const mealDbRecipes = await this.searchTheMealDB(query);
        if (mealDbRecipes.length > 0) {
            console.log(`[RecipeScout] Found ${mealDbRecipes.length} recipes from TheMealDB.`);
            // Save them to DB for future speed
            await this.saveRecipesToDB(mealDbRecipes, "API");
            return mealDbRecipes;
        }

        // 3. Stage 3: AI Scout (Tavily + Groq)
        console.log(`[RecipeScout] Engaging AI Scout for "${query}"...`);
        const scoutedRecipes = await this.scoutWeb(query);
        if (scoutedRecipes.length > 0) {
            await this.saveRecipesToDB(scoutedRecipes, "AI_SCOUT");
            return scoutedRecipes;
        }

        return [];
    }

    private async searchLocalDB(query: string): Promise<RecipeResult[]> {
        const results = await (prisma as any).recipe.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' }
            },
            take: 5
        });

        return results.map((r: any) => ({
            id: r.id,
            name: r.name,
            description: r.description || undefined,
            cuisine: r.cuisine || undefined,
            prepTime: r.prepTime || undefined,
            cookTime: r.cookTime || undefined,
            servings: r.servings || undefined,
            ingredients: r.ingredients as any[],
            instructions: r.instructions as any[],
            nutrition: r.nutrition as any,
            source: "Local DB",
            sourceUrl: r.sourceUrl || undefined
        }));
    }

    private async searchTheMealDB(query: string): Promise<RecipeResult[]> {
        try {
            const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
            const meals = response.data.meals;

            if (!meals) return [];

            return meals.map((meal: any) => this.mapMealDBToRecipe(meal));
        } catch (error) {
            console.error("[RecipeScout] TheMealDB error:", error);
            return [];
        }
    }

    private mapMealDBToRecipe(meal: any): RecipeResult {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== "") {
                ingredients.push({
                    name: ingredient,
                    quantity: measure, // TheMealDB mixes qty and unit in string
                    unit: null
                });
            }
        }

        // Split instructions by newlines roughly
        const instructions = meal.strInstructions
            .split(/\r\n|\n|\./)
            .filter((s: string) => s.trim().length > 5)
            .map((s: string, idx: number) => ({ step: idx + 1, text: s.trim() }));

        return {
            name: meal.strMeal,
            description: `A classic ${meal.strArea} dish.`,
            cuisine: meal.strArea,
            ingredients: ingredients,
            instructions: instructions,
            source: "TheMealDB",
            sourceUrl: meal.strSource || meal.strYoutube,
            // TheMealDB doesn't provide timings or nutrition
        };
    }

    private async scoutWeb(query: string): Promise<RecipeResult[]> {
        try {
            // 1. Search Web
            const searchContext = await tavilyService.searchPrices(`authentic ${query} recipe ingredients instructions`);

            // 2. Parse with LLM
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a Master Chef and Data Engineer. 
                        Target: Extract ONE authentic recipe for "${query}" from the provided search text.
                        
                        Context:
                        ${searchContext}

                        Output Format (JSON Only):
                        {
                            "name": "Exact Name",
                            "description": "Short appetizing description",
                            "cuisine": "Origin cuisine",
                            "prepTime": number (minutes),
                            "cookTime": number (minutes),
                            "servings": number,
                            "ingredients": [
                                { "name": "Item", "quantity": number, "unit": "g/kg/tbsp/pcs" }
                            ],
                            "instructions": [
                                { "step": 1, "text": "..." }
                            ],
                            "nutrition": {
                                "calories": number,
                                "protein": number,
                                "carbohydrates": number,
                                "fat": number
                            },
                             "sourceUrl": "URL of the best source found"
                        }
                        If multiple recipes found, pick the most authentic regional one. 
                        Return ONLY the JSON.`
                    }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                temperature: 0.2
            });

            const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");

            if (!parsed.name) return [];

            return [{
                ...parsed,
                source: "AI Scout"
            }];

        } catch (error) {
            console.error("[RecipeScout] AI Scout failed:", error);
            return [];
        }
    }

    private async saveRecipesToDB(recipes: RecipeResult[], sourceType: string) {
        for (const r of recipes) {
            try {
                // Check dupes by name to avoid spamming DB
                const existing = await (prisma as any).recipe.findFirst({
                    where: { name: r.name }
                });

                if (!existing) {
                    await (prisma as any).recipe.create({
                        data: {
                            name: r.name,
                            description: r.description,
                            cuisine: r.cuisine,
                            prepTime: r.prepTime,
                            cookTime: r.cookTime,
                            servings: r.servings,
                            ingredients: r.ingredients,
                            instructions: r.instructions,
                            nutrition: r.nutrition || {},
                            sourceUrl: r.sourceUrl,
                            sourceType: sourceType
                        }
                    });
                    console.log(`[RecipeScout] Saved "${r.name}" to DB.`);
                }
            } catch (err) {
                console.error(`[RecipeScout] Failed to save recipe: ${r.name}`, err);
            }
        }
    }
}

export const recipeScoutService = new RecipeScoutService();
