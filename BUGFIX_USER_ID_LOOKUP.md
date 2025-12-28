# Bug Fix: User ID Lookup Issue

## Problem

The personalized recommendations endpoint was failing with the error:
```
Error: User not found
    at UserAnalyticsService.getUserAnalytics
```

## Root Cause

The `getPersonalizedRecommendations` controller was passing the **Clerk user ID** (e.g., `user_37OF3C25Jhv4A4QGRb4FIFPtbo3`) directly to the recommendation service, but the service expected the **database user ID** (UUID format, e.g., `174e97a0-fbb9-4032-aaaa-83cb155c044a`).

## Solution

Updated [resources-controller.ts](file:///d:/LocaNutri-Smart/server/src/modules/resources/resources-controller.ts) to:

1. **Added Prisma import** to enable database queries
2. **Added database lookup** to convert Clerk ID to database ID before calling the service

### Code Changes

```typescript
// Before
const userId = req.auth?.userId;
const recommendations = await resourcesService.getPersonalizedRecommendations(userId);

// After
const clerkUserId = req.auth?.userId;

// Convert Clerk ID to database ID
const user = await prisma.user.findUnique({
  where: { clerkId: clerkUserId },
  select: { id: true },
});

if (!user) {
  return res.status(404).json({
    message: 'User not found in database',
  });
}

const recommendations = await resourcesService.getPersonalizedRecommendations(user.id);
```

## Impact

- ✅ Personalized recommendations now work correctly
- ✅ Proper error handling for users not found in database
- ✅ No breaking changes to other parts of the system

## Testing

The fix resolves the error shown in the logs where:
- Clerk userId: `user_37OF3C25Jhv4A4QGRb4FIFPtbo3`
- DB user ID: `174e97a0-fbb9-4032-aaaa-83cb155c044a`

The system now correctly:
1. Receives Clerk user ID from authentication
2. Looks up database user ID
3. Passes database ID to recommendation service
4. Returns personalized content based on user's profile

## Note

The API key warnings in the logs are expected:
```
News API key not configured, returning empty results
YouTube API key not configured, returning empty results
```

These will be resolved once you add the API keys to your `.env` file as documented in `PERSONALIZED_RECOMMENDATIONS_SETUP.md`.
