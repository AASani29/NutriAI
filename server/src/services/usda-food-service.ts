import axios from 'axios';

export interface USDANutrients {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
}

export interface USDAFoodItem {
    fdcId: number;
    description: string;
    dataType: string;
    nutrients: USDANutrients;
    unitName: string;
}

export class USDAFoodService {
    private apiKey: string;
    private baseUrl = 'https://api.nal.usda.gov/fdc/v1';

    constructor() {
        this.apiKey = process.env.USDA_FOOD_API_KEY || 'DEMO_KEY';
    }

    /**
     * Search for food items by name
     */
    async searchFood(query: string, limit: number = 5): Promise<USDAFoodItem[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/foods/search`, {
                params: {
                    api_key: this.apiKey,
                    query,
                    pageSize: limit,
                },
            });

            if (!response.data.foods || response.data.foods.length === 0) {
                return [];
            }

            return response.data.foods.map((food: any) => this.mapFoodItem(food));
        } catch (error) {
            console.error('Error searching USDA food:', error);
            return [];
        }
    }

    /**
     * Get food details by FDC ID
     */
    async getFoodDetails(fdcId: number): Promise<USDAFoodItem | null> {
        try {
            const response = await axios.get(`${this.baseUrl}/foods`, {
                params: {
                    api_key: this.apiKey,
                    fdcIds: fdcId,
                },
            });

            if (!response.data || response.data.length === 0) {
                return null;
            }

            return this.mapFoodItem(response.data[0]);
        } catch (error) {
            console.error('Error getting USDA food details:', error);
            return null;
        }
    }

    /**
     * Map USDA food item to our internal schema
     */
    private mapFoodItem(food: any): USDAFoodItem {
        const nutrients: USDANutrients = {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
        };

        // Nutrients can be in 'foodNutrients' array
        const nutrientList = food.foodNutrients || [];

        nutrientList.forEach((n: any) => {
            // Different formats depending on search vs detail endpoint
            const nutrientId = n.nutrientId || n.nutrient?.id;
            const value = n.value || n.amount || 0;

            switch (nutrientId) {
                case 1008: // Energy (Calories)
                    nutrients.calories = value;
                    break;
                case 1003: // Protein
                    nutrients.protein = value;
                    break;
                case 1005: // Carbohydrate, by difference
                    nutrients.carbohydrates = value;
                    break;
                case 1004: // Total lipid (fat)
                    nutrients.fat = value;
                    break;
                case 1079: // Fiber, total dietary
                    nutrients.fiber = value;
                    break;
                case 2000: // Sugars, total including NLEA
                    nutrients.sugar = value;
                    break;
                case 1093: // Sodium, Na
                    nutrients.sodium = value;
                    break;
            }
        });

        return {
            fdcId: food.fdcId,
            description: food.description,
            dataType: food.dataType,
            nutrients,
            unitName: '100g', // USDA data is usually per 100g or 100ml
        };
    }
}

export const usdaFoodService = new USDAFoodService();
