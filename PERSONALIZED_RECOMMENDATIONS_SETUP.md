# Personalized Resource Recommendations - Setup Guide

## Overview

This feature provides personalized article and YouTube video recommendations based on user data including budget, waste reduction percentage, consumption patterns, dietary preferences, and inventory composition.

## Prerequisites

You need to obtain two free API keys:

### 1. News API
- Visit: https://newsapi.org/
- Sign up for a free account
- Copy your API key
- Free tier: 100 requests/day

### 2. YouTube Data API v3
- Visit: https://console.cloud.google.com/
- Create a new project (or use existing)
- Enable "YouTube Data API v3"
- Create credentials → API Key
- Copy your API key
- Free tier: 10,000 quota units/day (~100 searches)

## Installation

### 1. Install Dependencies

The `axios` package has already been installed. If you need to reinstall:

```bash
cd server
npm install axios
```

### 2. Configure Environment Variables

Add the following to your `server/.env` file:

```bash
# External APIs for Personalized Recommendations
NEWS_API_KEY=your_actual_news_api_key_here
YOUTUBE_API_KEY=your_actual_youtube_api_key_here
RECOMMENDATION_CACHE_TTL=21600
```

Replace `your_actual_news_api_key_here` and `your_actual_youtube_api_key_here` with your actual API keys.

### 3. Restart the Server

```bash
cd server
npm run dev
```

## Usage

### For Users

1. Sign in to the application
2. Navigate to the Resources page
3. Click on the "Recommended For You" tab
4. View personalized articles and videos based on your profile

### Personalization Factors

The system considers:
- **Budget**: Your monthly budget range and actual spending
- **Waste Reduction**: Percentage of food consumed vs expired
- **Dietary Preferences**: Vegetarian, vegan, etc.
- **Inventory**: Top food categories in your inventory
- **Health Conditions**: Diabetes, hypertension, etc.
- **Allergies**: Food allergies and intolerances

### Recommendation Badges

Content is tagged with colored badges:
- 💵 **Blue** - Budget-Friendly
- 🌿 **Green** - Waste Reduction
- ❤️ **Pink** - Nutrition
- 🍴 **Purple** - Meal Planning
- ✨ **Yellow** - General Food & Sustainability

## Features

### Caching

- Recommendations are cached for 6 hours
- Reduces API calls and improves performance
- Cache is user-specific

### Error Handling

- Graceful fallback to Resource Library if APIs fail
- Rate limit detection and logging
- User-friendly error messages

### Responsive Design

- Mobile-first design
- Grid layouts adapt to screen size
- Embedded YouTube player for videos

## API Rate Limits

### News API (Free Tier)
- 100 requests/day
- With 6-hour caching: supports ~16 active users/day

### YouTube API (Free Tier)
- 10,000 quota units/day
- Each search costs ~100 units
- With caching: supports ~16 active users/day

## Troubleshooting

### "Unable to load recommendations"

**Possible causes:**
1. API keys not set in `.env`
2. API rate limit exceeded
3. Network connectivity issues

**Solutions:**
- Check `.env` file has correct API keys
- Wait 24 hours if rate limit exceeded
- Check server logs for detailed error messages

### No personalized content shown

**Possible causes:**
1. New user with minimal data
2. API returned no results

**Solutions:**
- Add more data (consumption logs, inventory items)
- Use the Resource Library tab for general content

### Videos not playing

**Possible causes:**
1. Browser blocking embedded content
2. YouTube video removed or restricted

**Solutions:**
- Click "Watch on YouTube" to open in new tab
- Allow embedded content in browser settings

## Development

### File Structure

```
server/src/
├── services/
│   ├── user-analytics-service.ts      # Analyzes user data
│   ├── news-api-service.ts            # News API integration
│   ├── youtube-api-service.ts         # YouTube API integration
│   └── recommendation-service.ts      # Core recommendation engine
└── modules/resources/
    ├── resources-controller.ts        # API endpoints
    ├── resources-service.ts           # Business logic
    └── resources-router.ts            # Route definitions

client/src/
├── types/
│   └── resource-types.ts              # TypeScript interfaces
├── components/resources/
│   ├── ArticleCard.tsx                # News article component
│   ├── VideoCard.tsx                  # YouTube video component
│   └── RecommendationBadge.tsx        # Badge component
├── services/
│   └── resources-service.ts           # API client
└── pages/
    └── ResourcesPage.tsx              # Main page with tabs
```

### Testing

To test with different user profiles:

1. Create test users with varying:
   - Budget ranges (low, medium, high)
   - Waste reduction rates (low, medium, high)
   - Dietary preferences (vegetarian, vegan, etc.)
   - Inventory compositions

2. Check that recommendations match user profile
3. Verify badges are appropriate
4. Test caching behavior

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify API keys are valid and not expired
3. Check API rate limits haven't been exceeded
4. Review the walkthrough.md for implementation details
