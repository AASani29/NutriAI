/**
 * Food Category Configurations
 * Defines food categories with spoilage sensitivity factors
 */

export interface FoodCategoryConfig {
    name: string;
    description: string;
    temperatureSensitivity: number; // Multiplier for temperature impact (0-1)
    humiditySensitivity: number; // Multiplier for humidity impact (0-1)
    baseShelfLifeDays: number; // Default shelf life in optimal conditions
    storageRecommendations: string[];
}

// Food category definitions
export const FOOD_CATEGORIES: Record<string, FoodCategoryConfig> = {
    DAIRY: {
        name: 'Dairy',
        description: 'Milk, yogurt, cheese, butter',
        temperatureSensitivity: 0.9, // Very high temperature sensitivity
        humiditySensitivity: 0.3,
        baseShelfLifeDays: 7,
        storageRecommendations: [
            'Keep refrigerated at all times',
            'Store in coldest part of refrigerator',
            'Seal tightly after opening',
        ],
    },
    LEAFY_GREENS: {
        name: 'Leafy Greens',
        description: 'Spinach, lettuce, kochu shak, lal shak',
        temperatureSensitivity: 0.8,
        humiditySensitivity: 0.8, // High humidity sensitivity
        baseShelfLifeDays: 3,
        storageRecommendations: [
            'Refrigerate immediately',
            'Keep in crisper drawer',
            'Wrap in damp cloth or paper towel',
            'Cook within 1-2 days in hot weather',
        ],
    },
    VEGETABLES: {
        name: 'Vegetables',
        description: 'Tomatoes, potatoes, onions, carrots',
        temperatureSensitivity: 0.6,
        humiditySensitivity: 0.5,
        baseShelfLifeDays: 7,
        storageRecommendations: [
            'Store in cool, dry place',
            'Keep away from direct sunlight',
            'Separate ethylene-producing vegetables',
        ],
    },
    MEAT_FISH: {
        name: 'Meat & Fish',
        description: 'Chicken, beef, fish, prawns',
        temperatureSensitivity: 0.95, // Extremely high temperature sensitivity
        humiditySensitivity: 0.4,
        baseShelfLifeDays: 2,
        storageRecommendations: [
            'Refrigerate immediately after purchase',
            'Cook within 24 hours in hot weather',
            'Freeze if not using within 1-2 days',
            'Never leave at room temperature',
        ],
    },
    FRUITS: {
        name: 'Fruits',
        description: 'Apples, bananas, mangoes, oranges',
        temperatureSensitivity: 0.5,
        humiditySensitivity: 0.6,
        baseShelfLifeDays: 5,
        storageRecommendations: [
            'Store ripe fruits in refrigerator',
            'Keep unripe fruits at room temperature',
            'Separate ethylene-sensitive fruits',
        ],
    },
    GRAINS_DRY: {
        name: 'Grains & Dry Goods',
        description: 'Rice, lentils, flour, dal',
        temperatureSensitivity: 0.2, // Low temperature sensitivity
        humiditySensitivity: 0.7, // Moderate-high humidity sensitivity (mold risk)
        baseShelfLifeDays: 180,
        storageRecommendations: [
            'Store in airtight containers',
            'Keep in cool, dry place',
            'Protect from moisture and pests',
        ],
    },
    BREAD_BAKERY: {
        name: 'Bread & Bakery',
        description: 'Bread, roti, biscuits',
        temperatureSensitivity: 0.5,
        humiditySensitivity: 0.7, // High humidity causes mold
        baseShelfLifeDays: 3,
        storageRecommendations: [
            'Store in airtight container',
            'Keep in cool, dry place',
            'Refrigerate in very humid weather',
            'Freeze for longer storage',
        ],
    },
    EGGS: {
        name: 'Eggs',
        description: 'Chicken eggs',
        temperatureSensitivity: 0.7,
        humiditySensitivity: 0.3,
        baseShelfLifeDays: 21,
        storageRecommendations: [
            'Refrigerate for longer shelf life',
            'Store in original carton',
            'Keep away from strong-smelling foods',
        ],
    },
    COOKED_FOOD: {
        name: 'Cooked Food',
        description: 'Leftover rice, curry, cooked vegetables',
        temperatureSensitivity: 0.9,
        humiditySensitivity: 0.5,
        baseShelfLifeDays: 1,
        storageRecommendations: [
            'Refrigerate within 2 hours of cooking',
            'Store in airtight containers',
            'Consume within 24 hours in hot weather',
            'Reheat thoroughly before eating',
        ],
    },
    CONDIMENTS: {
        name: 'Condiments & Sauces',
        description: 'Ketchup, pickles, soy sauce',
        temperatureSensitivity: 0.3,
        humiditySensitivity: 0.4,
        baseShelfLifeDays: 90,
        storageRecommendations: [
            'Refrigerate after opening',
            'Keep tightly sealed',
            'Check for mold or off-smell',
        ],
    },
};

// Mapping of common food items to categories
export const FOOD_ITEM_CATEGORY_MAP: Record<string, string> = {
    // Dairy
    milk: 'DAIRY',
    yogurt: 'DAIRY',
    cheese: 'DAIRY',
    butter: 'DAIRY',
    cream: 'DAIRY',
    paneer: 'DAIRY',

    // Leafy Greens
    spinach: 'LEAFY_GREENS',
    'kochu shak': 'LEAFY_GREENS',
    'lal shak': 'LEAFY_GREENS',
    lettuce: 'LEAFY_GREENS',
    'pui shak': 'LEAFY_GREENS',
    coriander: 'LEAFY_GREENS',

    // Vegetables
    tomato: 'VEGETABLES',
    tomatoes: 'VEGETABLES',
    potato: 'VEGETABLES',
    potatoes: 'VEGETABLES',
    onion: 'VEGETABLES',
    onions: 'VEGETABLES',
    carrot: 'VEGETABLES',
    carrots: 'VEGETABLES',
    eggplant: 'VEGETABLES',
    cucumber: 'VEGETABLES',
    'bell pepper': 'VEGETABLES',
    cauliflower: 'VEGETABLES',
    cabbage: 'VEGETABLES',

    // Meat & Fish
    chicken: 'MEAT_FISH',
    'broiler chicken': 'MEAT_FISH',
    beef: 'MEAT_FISH',
    mutton: 'MEAT_FISH',
    fish: 'MEAT_FISH',
    'pangas fish': 'MEAT_FISH',
    'rui fish': 'MEAT_FISH',
    prawn: 'MEAT_FISH',
    prawns: 'MEAT_FISH',
    shrimp: 'MEAT_FISH',

    // Fruits
    apple: 'FRUITS',
    banana: 'FRUITS',
    mango: 'FRUITS',
    orange: 'FRUITS',
    papaya: 'FRUITS',
    watermelon: 'FRUITS',
    guava: 'FRUITS',
    lemon: 'FRUITS',

    // Grains & Dry
    rice: 'GRAINS_DRY',
    dal: 'GRAINS_DRY',
    lentils: 'GRAINS_DRY',
    flour: 'GRAINS_DRY',
    atta: 'GRAINS_DRY',
    'red lentils': 'GRAINS_DRY',
    chickpeas: 'GRAINS_DRY',

    // Bread & Bakery
    bread: 'BREAD_BAKERY',
    roti: 'BREAD_BAKERY',
    paratha: 'BREAD_BAKERY',
    biscuits: 'BREAD_BAKERY',

    // Eggs
    egg: 'EGGS',
    eggs: 'EGGS',

    // Cooked Food
    'cooked rice': 'COOKED_FOOD',
    'leftover rice': 'COOKED_FOOD',
    'panta bhat': 'COOKED_FOOD',
    curry: 'COOKED_FOOD',
    'fried rice': 'COOKED_FOOD',

    // Condiments
    ketchup: 'CONDIMENTS',
    'soy sauce': 'CONDIMENTS',
    pickle: 'CONDIMENTS',
    'mustard oil': 'CONDIMENTS',
    'vegetable oil': 'CONDIMENTS',
};

/**
 * Get food category for a food item
 * Returns default VEGETABLES category if not found
 */
export function getFoodCategory(foodName: string): FoodCategoryConfig {
    const normalizedName = foodName.toLowerCase().trim();
    const categoryKey = FOOD_ITEM_CATEGORY_MAP[normalizedName] || 'VEGETABLES';
    return FOOD_CATEGORIES[categoryKey];
}

/**
 * Get all category names
 */
export function getAllCategoryNames(): string[] {
    return Object.keys(FOOD_CATEGORIES);
}
