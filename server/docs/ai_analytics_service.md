# AI Analytics Service Overview

The `AIAnalyticsService` is the core intelligence engine for NutriAI. It acts as an orchestration layer between the user's data (Inventory, Consumption, Health) and Large Language Models (LLMs).

## Core Technologies
- **LLM Provider**: Groq
- **Model**: `llama-3.3-70b-versatile` (chosen for speed and reasoning capabilities)
- **Database**: Prisma (PostgreSQL)
- **Caching**: Redis (via `config/queue` connection)
- **External Data**: Tavily (Search), USDA API (Nutrition)

## Key Functionalities

### 1. Intelligent Chat (`generateIntelligentInsights`)
This is the main entry point for user interaction. It implements an **Agentic Loop**:
1.  Receives user query + User Context (ID).
2.  Passes query to Groq LLM with a System Prompt defining its persona (NutriAI Assistant).
3.  **Tool Use**: The LLM can decide to call specific tools to fetch data or perform actions.
4.  **Execution**: The service executes the requested tools and feeds the result back to the LLM.
5.  **Final Response**: The LLM synthesizes the tool outputs into a natural language response.

### 2. Dashboard Insights (`getDashboardInsights`)
Generates the "At a Glance" summary for the user.
- **Caching**: Results are cached in Redis for **10 minutes** to reduce latency and API costs.
- **Parallel Execution**: Fetches Consumption Patterns, Impact Analytics, and Waste Predictions concurrently.

### 3. Consumption Analysis (`analyzeConsumptionPatterns`)
Analyzes what the user has been eating.
- **Timeframes**: 7 days, 30 days, 90 days.
- **Metrics**: 
    - Consistency Score (How regularly they log).
    - Category Breakdown.
    - Time-of-day patterns.
    - **Tools Used**: Connects to `InventoryService` for raw data.

### 4. Waste Prediction (`predictWaste`)
Identifies items at risk of spoiling.
- **Logic**: Calculates `daysUntilExpiry`.
- **Risk Levels**: 
    - High (< 2 days)
    - Medium (< 5 days)
    - Low (> 5 days)
- **Impact**: Estimates financial loss and CO2 impact of potential waste.
- **Suggestions**: Generates specific actions (e.g., "Freeze now", "Cook tonight").

### 5. Impact Analytics (`generateImpactAnalytics`)
Gamification of sustainability metrics.
- **Calculations**:
    - Waste Prevented -> CO2 Saved.
    - Waste Prevented -> Water Saved.
    - Money Saved.
- **Achievements**: Awards titles like "Eco Warrior" or "Consistency Champion" based on thresholds.

### 6. specialized Tools (Function Calling)
The service exposes these specific functions to the Groq LLM:
- `analyze_consumption_patterns`: Get trends.
- `predict_waste`: Check expiry dates.
- `generate_impact_analytics`: Get eco-stats.
- `generate_price_smart_meal_plan`: Create meal plans respecting budget & inventory.
- `search_food_nutrients`: Look up USDA data.

## Integration Points
- **Inventory Service**: Tightly coupled to fetch user stock.
- **USDA Service**: For ground-truth nutrition data.
- **Redis**: For performance caching.
