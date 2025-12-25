import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// For Clerk SDK v4, export the middleware factory
export const clerkMiddleware = ClerkExpressRequireAuth;

export { ClerkExpressRequireAuth };