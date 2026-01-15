# API Endpoint Overview

This document provides a summarized overview of the available API endpoints in the NutriAI server.

## Base URL
`/api` (Prefix for all routes)

## Authentication
Most routes require authentication via Clerk.
- **Headers**: `Authorization: Bearer <token>`

---

## 🧠 AI Intelligence (`/intelligence`)
Advanced AI features for analysis, prediction, and interaction.

- **GET** `/intelligence/dashboard`: Get high-level dashboard insights (cached).
- **POST** `/intelligence/chat`: Interactive chat with the AI assistant.
- **GET** `/intelligence/consumption-analysis`: Analyze user food consumption patterns.
- **GET** `/intelligence/waste-prediction`: Predict potential food waste based on inventory expiry.
- **POST** `/intelligence/meal-plan`: Generate optimized meal plans based on inventory and preferences.
- **POST** `/intelligence/meal-plans/save`: Save a generated meal plan.
- **GET** `/intelligence/meal-plans/saved`: Retrieve saved meal plans.
- **POST** `/intelligence/meal-plans/consume`: Mark a meal plan meal as consumed.
- **POST** `/intelligence/recipe`: Get a specific recipe or cooking instructions.
- **GET** `/intelligence/nutrition-analysis`: Detailed nutritional breakdown.
- **GET** `/intelligence/impact-analytics`: Environmental and financial impact stats.
- **GET** `/intelligence/sharing-opportunities`: AI suggestions for items to share.
- **GET** `/intelligence/recommendations`: Personalized behavioral recommendations.
- **GET** `/intelligence/alerts`: Smart alerts for expiry and opportunities.
- **POST** `/intelligence/goal-progress`: Track progress against user goals.
- **GET** `/intelligence/seasonal-insights`: Insights based on current season/weather.
- **POST** `/intelligence/estimate-nutrition`: Estimate nutrition for non-standard items.
- **POST** `/intelligence/estimate-price`: Estimate market price for items.
- **POST** `/intelligence/estimate-details`: Estimate full item details.
- **POST** `/intelligence/analyze-voice`: Voice-to-text food logging.
- **POST** `/intelligence/analyze-image`: **OCR** - Direct image analysis for food logging.

## 📦 Inventory Management (`/inventories`)
Manage user food inventories (Fridge, Pantry, etc.).

- **GET** `/inventories`: List all inventories.
- **POST** `/inventories`: Create a new inventory.
- **GET** `/inventories/:id`: Get details of a specific inventory.
- **PUT** `/inventories/:id`: Update inventory details.
- **DELETE** `/inventories/:id`: Delete an inventory.
- **PATCH** `/inventories/:id/archive`: Archive an inventory.
- **PATCH** `/inventories/:id/unarchive`: Unarchive an inventory.
- **POST** `/inventories/:id/share`: Share inventory with other users.
- **GET** `/inventories/:id/items`: List items in an inventory.
- **POST** `/inventories/:id/items`: Add a manual item.
- **POST** `/inventories/:id/items/from-image`: **OCR** - Add items by scanning a receipt or image (Background Job).
- **PUT** `/inventories/:id/items/:itemId`: Update an item.
- **DELETE** `/inventories/:id/items/:itemId`: Remove an item.
- **POST** `/inventories/consumption`: Log consumption of an item.
- **GET** `/inventories/consumption`: Get consumption history.
- **GET** `/inventories/search-usda`: Search the USDA food database.
- **GET** `/inventories/analytics/inventory-trends`: Inventory value/volume trends.
- **GET** `/inventories/analytics/consumption-patterns`: Consumption frequency stats.

## 🍎 Foods (`/foods`)
General food database management.

- **GET** `/foods`: List known food items.
- **GET** `/foods/:id`: Get details of a food item.
- **POST** `/foods`: Create a custom food item.
- **PUT** `/foods/:id`: Update a food item.
- **DELETE** `/foods/:id`: Delete a food item.

## 🖼️ Images (`/images`)
Image handling for the application.

- **POST** `/images`: Upload an image (generic).
- **GET** `/images`: Get user's uploaded images.
- **DELETE** `/images/:fileId`: Delete an image.
- **GET** `/images/job/:jobId`: Check status of a background image processing job.

## 👥 Users (`/users`)
User profile and health data.

- **GET** `/users/me`: Get current user info.
- **GET** `/users/profile`: Get detailed profile.
- **PUT** `/users/profile`: Update profile.
- **GET** `/users/search`: Search for other users.
- **GET** `/users/:id/hydration`: Get daily hydration logs.
- **POST** `/users/:id/hydration`: Update hydration log.
- **GET** `/users/:id/fitness`: Get fitness logs.
- **POST** `/users/:id/fitness`: Update fitness log.

## 🤝 Sharing (`/sharing`)
Community food sharing platform.

- **GET** `/sharing`: List available food shares.
- **POST** `/sharing`: Create a new listing.
- **GET** `/sharing/my-listings`: Get user's active listings.
- **GET** `/sharing/:id`: Get listing details.
- **PUT** `/sharing/:id`: Update a listing.
- **DELETE** `/sharing/:id`: Delete a listing.
- **POST** `/sharing/:id/claim`: Claim a listing.
- **POST** `/sharing/:id/complete`: Mark transaction as complete.
- **GET** `/sharing/analytics/stats`: Community impact stats.

## 🌤️ Weather (`/weather`)
Weather data for food preservation advice.

- **GET** `/weather/current`: Current local weather.
- **GET** `/weather/locations`: Saved locations.
- **GET** `/weather/alerts`: Weather alerts affecting food storage.

## 🥗 Nutrition (`/nutrition`)
Aggregated nutrition statistics.

- **GET** `/nutrition/stats`: Nutrition summary (macros, calories) for a period.
- **GET** `/nutrition/history`: Historical nutrition data.

## 👩‍⚕️ Health Advisor (`/health-advisor`)
- **POST** `/health-advisor/advice`: Get personalized advice based on health data.

## 👨‍🍳 Recipes (`/recipes`)
- **GET** `/recipes/search`: Search for recipes.

## 🛡️ Admin (`/admin`)
Requires `admin` role.

- **POST** `/admin/foods`: Add global food items.
- **POST** `/admin/resources`: Add educational resources.
- **GET** `/admin/stats`: System-wide statistics.

## 📚 Resources (`/resources`)
Educational content.

- **GET** `/resources`: List articles/videos.
- **GET** `/resources/personalized`: Get recommendations.
- **GET** `/resources/search/articles`: Search external articles.
- **GET** `/resources/search/videos`: Search external videos.
