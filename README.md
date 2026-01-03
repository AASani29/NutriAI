# NutriAI

## Product Overview

**Domain:** HealthTech (Nutrition & Diet Recommender)  
**Mission:** Democratizing personalized nutrition by bridging the gap between medical needs, local market prices, and household reality.

NutriAI is an innovative mobile/web application designed specifically for the Bangladeshi context, where affordability, local market fluctuations, and environmental factors play crucial roles in daily nutrition decisions. Unlike generic diet apps, NutriAI integrates real-time local pricing, weather conditions, USDA nutritional data, and household inventory to provide practical, affordable, and safe nutritional guidance.

## Key Features

### 🛒 Feature 1: The "Smart Pantry" Context Engine
A digital inventory of what the user currently owns (Rice, Oil, Lentils, Vegetables) stored in the app.

**Why it matters:** Most diet apps suggest meals requiring new ingredients. NutriAI prioritizes food you already have. This is the single biggest factor in making a diet affordable for low-to-middle-income families.

**Key Capabilities:**
- **Scan-to-Add:** Users can snap a photo of their grocery receipt or product barcodes to instantly add items to their pantry list.
- **"Use-First" Alerts:** The app flags items that are sitting in the pantry too long, prompting the user to cook them before they spoil.
- **USDA Validation:** Automatically validates food items and fetches nutritional data using the **USDA FoodData Central API**.

### 📉 Feature 2: Hyper-Local Price & Regional Optimization
A real-time diet generator that adapts to the fluctuating prices of Bangladesh's wet markets (Bazaars).

**Why it matters:** Nutritional advice is useless if it's too expensive. If the price of Broiler Chicken spikes, the app automatically suggests Pangas Fish or Eggs as a cheaper protein alternative for that week.

**Key Capabilities:**
- **Regional Market Sync:** Connects to local price databases to know the daily cost of vegetables and proteins based on the user's specific location in Bangladesh.
- **Budget Dial:** Users set a daily budget (e.g., "150 Taka/day"), and the app strictly recommends nutritious meals that fit within that limit.
- **Integrated MapPicker:** Users can precisely set their location on a map to receive hyper-local price predictions and weather alerts.

### 🌤️ Feature 3: Weather-Adaptive Freshness Guard (Completed)
An intelligent expiration tracker that adjusts food shelf-life based on real-time local weather.

**Why it matters:** In Bangladesh, high heat and humidity cause food to rot faster than the package date suggests. A static "Best Before" date is risky in a non-air-conditioned kitchen.

**Key Capabilities:**
- **Live Weather Sync:** Integrated with OpenWeather/Weatherstack APIs to check local humidity and temperature.
- **Dynamic Shelf-Life:** Calculates spoilage risk in real-time. If it's a hot, humid week (35°C+), it drastically reduces the "safe days" for leafy greens and milk.
- **Spoilage Alerts:** "High Humidity Warning: Your Spinach will spoil by tonight. Cook it now!"

### 🩺 Feature 4: Clinical & Allergen Safety Shield
A medical filtering layer that customizes recipes based on health conditions and doctor's advice.

**Why it matters:** High blood pressure and diabetes are rising epidemics in Bangladesh. Generic recipes can be dangerous if they contain too much salt or sugar.

**Key Capabilities:**
- **Disease Profiles:** Modes for Diabetic (Low Glycemic Index), Hypertensive (Low Salt), and Anemic (High Iron).
- **Allergen Lock:** Automatically hides recipes containing user-specific allergens (e.g., Shrimp/Prawns, Eggplant, Beef).

### 🥘 Feature 5: Health & Fitness tracking (New)
A comprehensive logging system for physical activity and hydration.

**Why it matters:** Nutrition is only half of the health equation. Tracking energy expenditure and hydration is crucial for a balanced lifestyle.

**Key Capabilities:**
- **Activity Logs:** Track daily steps, calories burned, and weight updates.
- **Hydration Tracking:** Log daily water intake to ensure proper hydration, especially during heatwaves.
- **Progress Analytics:** Visual representations of fitness trends over time using Recharts.

### 🤖 Feature 6: AI-Powered Intelligent Dashboard
An intelligent analytics system that provides personalized insights and interactive assistance.

**Key Capabilities:**
- **ChatBot Popup:** A global, interactive AI assistant (refactored from a static tab) available throughout the app for instant nutrition advice.
- **SDG Scoring:** Sustainability tracking with scores for waste reduction, nutrition, and budget management.
- **Predictive Analytics:** Expiration risk assessment and waste prevention alerts driven by AI.

### 🏘️ Feature 7: Neighbourhood Food Sharing
A community platform for sharing surplus food with neighbors to reduce waste.

**Key Capabilities:**
- **Food Listings:** Share excess inventory items with pickup locations and availability times.
- **Community Browse:** Discover and claim food shared by neighbors.

### 📚 Feature 8: Personalized Resource Recommendations (New)
An intelligent content delivery system tailored to user behavior and health goals.

**Key Capabilities:**
- **Personalized Articles:** Fetches relevant health and sustainability news via **News API** based on user dietary preferences.
- **YouTube Integration:** Suggests cooking and nutrition videos via **YouTube Data API** matched to the user's inventory and health status.
- **Dynamic Badges:** Labels content with categorization badges (Budget-Friendly, Waste Reduction, etc.).

## Current Implementation Status

### ✅ Completed Features
- **Smart Pantry Engine:** Complete inventory management with USDA API nutritional data integration.
- **Weather-Adaptive Freshness Guard:** Live weather API integration and dynamic spoilage models.
- **AI-Powered Dashboard:** Intelligent analytics with consumption patterns, SDG scoring, and global ChatBot popup.
- **Health & Fitness Tracking:** Full logging system for steps, weight, and hydration.
- **Personalized Recommendations:** Profile-based article and video suggestions using News/YouTube APIs.
- **Integrated Map Location:** Precise location tracking using MapPicker/Leaflet for regional pricing and weather.
- **Neighbourhood Sharing:** Full food sharing system with listings and community features.
- **OCR & Image Processing:** Receipt scanning and AI-powered food extraction.
- **Smart Kitchen Re-theme:** Modernized Home Page and UI/UX redesign.
- **Admin Panel:** Administrative tools for food catalog and resource management.

### 🚧 In Development / Planned Features
- **Mobile App:** Native mobile applications for iOS and Android.
- **Multi-language Support:** Localization for Bangladeshi regional languages.
- **Offline Mode:** Limited functionality without internet connection.

## Technology Stack

### Frontend (Client)
- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4 + Framer Motion (Animations)
- **Charts:** Recharts
- **Maps:** React Leaflet
- **Authentication:** Clerk React
- **HTTP Client:** Fetch API + Axios (for external APIs)

### Backend (Server)
- **Runtime:** Node.js + Express.js 5
- **Database:** PostgreSQL with Prisma ORM 6
- **AI Integration:** Google Generative AI (Gemini), Groq AI (OCR)
- **APIs:** USDA FoodData Central, Weather APIs, News API, YouTube Data API
- **Background Tasks:** BullMQ + ioredis
- **File Storage:** Cloudinary
- **OCR:** Tesseract.js

## Project Structure

```
NutriAI/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/              # UI components (home, weather, chat, fitness)
│   │   ├── pages/                   # Main page layouts
│   │   ├── services/                # API service functions (USDA, News, YouTube)
│   │   └── hooks/                   # Custom React hooks (useInventory, useWeather)
├── server/                                # Node.js backend application
│   ├── src/
│   │   ├── modules/                       # Feature modules (weather, chat, fitness, sharing)
│   │   ├── services/                       # Business logic (usda-food-service, alert-service)
│   │   └── workers/                        # Background workers (image-worker)
│   ├── prisma/                             # Database schema and migrations
│   └── package.json                        # Backend dependencies
```

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- API Keys: Clerk, Cloudinary, Groq/Gemini, USDA, News API, YouTube Data API, Weather API

### Quick Start
1. **Clone & Install:** `npm install` in both `client` and `server`.
2. **Environment Variables:** Set up `.env` files in both directories (see `.env.example`).
3. **Database:** `npx prisma migrate dev` in the server folder.
4. **Run Dev:** `npm run dev` in both folders.

## License
MIT License
