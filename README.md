# LocaNutri Smart

## Product Overview

**Domain:** HealthTech (Nutrition & Diet Recommender)  
**Mission:** Democratizing personalized nutrition by bridging the gap between medical needs, local market prices, and household reality.

LocaNutri Smart is an innovative mobile/web application designed specifically for the Bangladeshi context, where affordability, local market fluctuations, and environmental factors play crucial roles in daily nutrition decisions. Unlike generic diet apps, LocaNutri Smart integrates real-time local pricing, weather conditions, and household inventory to provide practical, affordable, and safe nutritional guidance.

## Key Features

### 🛒 Feature 1: The "Smart Pantry" Context Engine
A digital inventory of what the user currently owns (Rice, Oil, Lentils, Vegetables) stored in the app.

**Why it matters:** Most diet apps suggest meals requiring new ingredients. LocaNutri Smart prioritizes food you already have. This is the single biggest factor in making a diet affordable for low-to-middle-income families.

**Key Capabilities:**
- **Scan-to-Add:** Users can snap a photo of their grocery receipt or product barcodes to instantly add items to their pantry list.
- **"Use-First" Alerts:** The app flags items that are sitting in the pantry too long, prompting the user to cook them before they spoil.

### 📉 Feature 2: Hyper-Local Price Optimization
A real-time diet generator that adapts to the fluctuating prices of Bangladesh's wet markets (Bazaars).

**Why it matters:** Nutritional advice is useless if it's too expensive. If the price of Broiler Chicken spikes, the app automatically suggests Pangas Fish or Eggs as a cheaper protein alternative for that week.

**Key Capabilities:**
- **Market Sync:** Connects to local price databases (e.g., Dept. of Agricultural Marketing) to know the daily cost of vegetables and proteins.
- **Budget Dial:** Users set a daily budget (e.g., "150 Taka/day"), and the app strictly recommends nutritious meals that fit within that limit.

### 🌤️ Feature 3: Weather-Adaptive Freshness Guard
An intelligent expiration tracker that adjusts food shelf-life based on real-time local weather.

**Why it matters:** In Bangladesh, high heat and humidity cause food to rot faster than the package date suggests. A static "Best Before" date is risky in a non-air-conditioned kitchen.

**Key Capabilities:**
- **Live Weather Sync:** The app checks the local humidity and temperature. If it's a hot, humid week (35°C+), it drastically reduces the "safe days" for leafy greens and milk.
- **Spoilage Alerts:** "High Humidity Warning: Your Spinach will spoil by tonight. Cook it now!"

### 🩺 Feature 4: Clinical & Allergen Safety Shield
A medical filtering layer that customizes recipes based on health conditions and doctor's advice.

**Why it matters:** High blood pressure and diabetes are rising epidemics in Bangladesh. Generic recipes can be dangerous if they contain too much salt or sugar.

**Key Capabilities:**
- **Disease Profiles:** Modes for Diabetic (Low Glycemic Index), Hypertensive (Low Salt), and Anemic (High Iron).
- **Allergen Lock:** Automatically hides recipes containing user-specific allergens (e.g., Shrimp/Prawns, Eggplant, Beef) to prevent allergic reactions.

### 🥘 Feature 5: Leftover "Upcycling" & Safety
A recipe suggestion engine specifically designed to transform cooked leftovers into safe, nutritious new meals.

**Why it matters:** Preventing waste saves money. However, saving cooked food (like Rice) carries health risks if done poorly.

**Key Capabilities:**
- **Safe Re-use:** Suggests recipes for leftovers (e.g., turning leftover rice into Fried Rice with veggies) but only if the food is deemed safe based on storage time and weather.
- **Safety Prompts:** "You are using 12-hour old rice. Please ensure it was refrigerated, otherwise, discard to avoid food poisoning."

## User Stories & Case Studies

### Case Study A: The Cost-Conscious Rickshaw Puller
**Profile:** Rahim, 35. Extremely high energy needs (3000+ calories/day), very low daily budget.

**The Problem:** Traditional diet apps suggest "Grilled Chicken and Quinoa" which is impossible for him. He needs energy but meat prices just doubled this week.

**LocaNutri Solution (Feature 2):** The Price Optimization Engine detects the price hike in meat. It generates a high-calorie meal plan using Lentils (Dal), Potato (Aloo), and Eggs, ensuring he gets his required protein and energy for 40% less cost than the meat-based option.

### Case Study B: The Diabetic Homemaker in Summer
**Profile:** Sumaiya, 45. Type-2 Diabetic. Manages a household kitchen without 24/7 air conditioning.

**The Problem:** She bought spinach and milk in the morning. It is an extremely hot and humid day (38°C). A standard app assumes these foods are good for 3 days.

**LocaNutri Solution (Feature 3 & 4):** The Weather-Adaptive Guard detects the heatwave. It sends her an alert at 4 PM: "High Heat Alert! Your spinach will lose nutrition and spoil by tomorrow. Please cook it for dinner tonight." The Clinical Shield ensures the suggested recipe uses minimal oil and no added sugar, keeping her blood sugar stable.

### Case Study C: The Garment Worker with Anemia
**Profile:** Fatema, 22. Works long shifts. Diagnosed with Anemia (Iron deficiency). Often skips meals to save money.

**The Problem:** She buys expensive imported apples because she thinks they are "healthy," wasting money. She ignores cheap local greens because she doesn't know their value.

**LocaNutri Solution (Feature 2 & 5):** The app suggests Local Superfoods. It recommends Kochu Shak (Taro Leaves) and Lal Shak (Red Amaranth)—which are incredibly cheap and rich in iron. It also prompts her to add a slice of Lemon (Vitamin C) to her meal to help her body absorb the iron, a zero-cost medical intervention.

### Case Study D: The "Leftover" Dilemma
**Profile:** A middle-class family with leftover Panta Bhat (soaked rice) from the previous night.

**The Problem:** They want to eat it to avoid waste, but the weather has been warm, and bacterial growth is a risk.

**LocaNutri Solution (Feature 5):** The user inputs "Leftover Soaked Rice." The app checks the local temperature history. It calculates that the risk of bacterial contamination is high because the kitchen was above 30°C overnight. It advises: "Risk of bacterial growth detected. Do not consume raw. Thoroughly fry with onions and chilies to ensure safety, or discard."

## Technology Stack

### Frontend (Client)
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM 7
- **State Management:** React Context + TanStack React Query
- **Authentication:** Clerk React
- **Icons:** Lucide React
- **Date Handling:** date-fns + React Datepicker
- **HTTP Client:** Fetch API with custom authentication wrapper

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** PostgreSQL with Prisma ORM 6
- **Authentication:** Clerk SDK for Node.js
- **Security:** Helmet, CORS, Compression
- **Testing:** Jest with Supertest
- **Development:** Nodemon, ts-node

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users & Profiles:** User authentication and profile management
- **Food Items:** Catalog of food items with categories, expiration info, and costs
- **Inventories:** User-created inventories for tracking household food
- **Inventory Items:** Specific food items in inventories with quantities and expiration dates
- **Consumption Logs:** Tracking of food consumption for waste reduction
- **Resources:** Educational content (articles/videos) with tagging system
- **Files:** File upload support for food photos and receipts

### Architecture
- **Full-Stack:** Separate client and server directories
- **API Design:** RESTful API with `/api` prefix
- **Authentication:** Clerk-based auth with protected routes
- **Database:** Prisma-managed migrations and client generation
- **File Structure:** Modular backend with feature-based organization

## Project Structure

```
LocaNutri-Smart/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Layout.tsx           # Main app layout with sidebar
│   │   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   │   ├── food/                # Food-related components
│   │   │   │   ├── AddFoodModal.tsx # Modal for adding food items
│   │   │   │   ├── FoodFilter.tsx   # Food filtering component
│   │   │   │   └── FoodList.tsx     # Food items list display
│   │   │   ├── home/                # Landing page components
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   ├── CTASection.tsx
│   │   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── resources/           # Resource display components
│   │   │   │   └── ResourceCard.tsx
│   │   │   └── ... (Footer, Navbar, ImpactSection)
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── Dashboard.tsx        # User dashboard
│   │   │   ├── InventoryPage.tsx    # Inventory management
│   │   │   ├── InventoryDetailPage.tsx # Individual inventory details
│   │   │   ├── DailyLogPage.tsx     # Daily consumption logging
│   │   │   ├── ProfilePage.tsx      # User profile
│   │   │   ├── EditProfilePage.tsx  # Profile editing
│   │   │   ├── ResourcesPage.tsx    # Educational resources
│   │   │   ├── NeighbourhoodPage.tsx # Community features
│   │   │   ├── SignInPage.tsx       # Authentication
│   │   │   ├── SignUpPage.tsx
│   │   │   └── OnboardingPage.tsx   # User onboarding
│   │   ├── services/                # API service functions
│   │   │   ├── authService.ts       # Authentication helpers
│   │   │   ├── inventoryService.ts  # Inventory API calls
│   │   │   ├── resources-service.ts # Resources API calls
│   │   │   └── utils.ts             # Utility functions
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useApi.ts            # API call hooks
│   │   │   └── useInventory.ts      # Inventory-specific hooks
│   │   ├── context/                 # React context providers
│   │   │   └── ProfileContext.tsx   # User profile context
│   │   ├── types/                   # TypeScript type definitions
│   │   │   └── inventory.ts         # Inventory-related types
│   │   └── assets/                  # Static assets
│   ├── public/                      # Public static files
│   └── package.json                 # Frontend dependencies
├── server/                          # Node.js backend application
│   ├── src/
│   │   ├── modules/                 # Feature modules
│   │   │   ├── foods/               # Food items management
│   │   │   │   ├── food-controller.ts
│   │   │   │   └── food-router.ts
│   │   │   ├── inventories/         # Inventory system
│   │   │   │   ├── inventory-controller.ts
│   │   │   │   ├── inventory-router.ts
│   │   │   │   ├── inventory-service.ts
│   │   │   │   └── inventory-types.ts
│   │   │   ├── resources/           # Educational resources
│   │   │   │   ├── resources-controller.ts
│   │   │   │   ├── resources-repository.ts
│   │   │   │   └── resources-router.ts
│   │   │   └── users/               # User management
│   │   │       ├── users-controller.ts
│   │   │       ├── users-router.ts
│   │   │       ├── users-service.ts
│   │   │       └── users-types.ts
│   │   ├── config/                  # Configuration files
│   │   │   ├── app.ts               # App configuration
│   │   │   ├── clerk.ts             # Clerk auth config
│   │   │   └── database.ts          # Database connection
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.ts              # Authentication middleware
│   │   │   └── index.ts             # Middleware setup
│   │   └── *.ts                     # Main app files (index, server, router)
│   ├── prisma/                      # Database schema and migrations
│   │   ├── schema.prisma            # Database schema
│   │   ├── seed.ts                  # Database seeding
│   │   └── migrations/              # Prisma migrations
│   ├── docs/                        # API documentation
│   │   └── api-docs.md              # API reference
│   └── package.json                 # Backend dependencies
├── test-connection.ts               # Database connection test script
└── README.md                        # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Clerk account for authentication (get API keys from [Clerk Dashboard](https://dashboard.clerk.com/))

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure the following variables:
     ```env
     DATABASE_URL="postgresql://username:password@localhost:5432/locanutri_db"
     CLERK_SECRET_KEY="your_clerk_secret_key"
     PORT=3000
     NODE_ENV=development
     ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. (Optional) Seed the database with sample data:
   ```bash
   npx prisma db seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3000`

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file with:
     ```env
     VITE_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
     VITE_API_URL="http://localhost:3000/api"
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The client will run on `http://localhost:5173`

### Testing Database Connection
To test the database connection, run:
```bash
npx ts-node test-connection.ts
```

### Running Tests
- Backend tests: `cd server && npm test`
- Frontend tests: `cd client && npm test` (if configured)

## Usage

1. **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000/api`

2. **Authentication:**
   - Sign up/login using Clerk authentication
   - Complete the onboarding process to set up your profile

3. **Core Features:**
   - **Dashboard:** Overview of your food inventory and recent activity
   - **Inventory Management:** Create and manage multiple inventories (e.g., kitchen, pantry)
   - **Add Food Items:** Scan receipts, add items manually, or select from the food catalog
   - **Track Expiration:** Monitor food freshness with smart alerts
   - **Log Consumption:** Record what you eat to reduce waste
   - **Daily Log:** Keep track of your daily food intake
   - **Resources:** Access educational content about nutrition and food management
   - **Profile:** Manage your dietary preferences and health information

4. **API Health Check:** Visit `http://localhost:3000/api/health` to verify the backend is running

## API Documentation

The backend provides a RESTful API with the following main endpoints:

- **Public Routes:**
  - `GET /api/foods` - Food catalog with filtering
  - `GET /api/resources` - Educational resources
  - `GET /api/health` - Health check

- **Protected Routes (require authentication):**
  - `GET/POST/PUT/DELETE /api/inventories` - Inventory management
  - `GET/POST/PUT/DELETE /api/inventories/:id/items` - Inventory items
  - `POST /api/inventories/consumption` - Log food consumption
  - `GET /api/users/profile` - User profile management

Detailed API documentation is available in [server/docs/api-docs.md](server/docs/api-docs.md).

## Current Implementation Status

The application is currently in development with the following features implemented:

### ✅ Completed Features
- User authentication and profile management with Clerk
- Food catalog with categories and expiration tracking
- Inventory creation and management
- Adding/removing food items from inventories
- Consumption logging for waste tracking
- Educational resources system with tagging
- Responsive UI with modern design
- Database schema with comprehensive relationships

### 🚧 In Development / Planned Features
- **Smart Pantry Engine:** Advanced inventory prioritization
- **Price Optimization:** Integration with local market data
- **Weather-Adaptive Alerts:** Real-time weather API integration
- **Clinical Safety Shield:** Health condition-based filtering
- **Leftover Upcycling:** Recipe suggestions for leftovers
- **Barcode Scanning:** Receipt and product scanning
- **Analytics Dashboard:** Consumption patterns and trends
- **Community Features:** Neighbourhood sharing and collaboration

### 🧪 Testing
- Backend: Jest setup with basic test structure
- Database: Connection testing script included
- Frontend: Testing framework configured but tests pending

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.