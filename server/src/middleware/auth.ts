import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node';
import { userService } from '../modules/users/users-service';

// Extend Express Request to include auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
      };
    }
  }
}

// Create the middleware instance by calling the function
const clerkAuth = ClerkExpressRequireAuth();

// Export it as requireAuth and assert the middleware type
export const requireAuth: RequestHandler = clerkAuth as unknown as RequestHandler;

// Custom middleware to ensure user exists in database
export const ensureUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's Clerk ID from the request
    const clerkId = req.auth.userId;

    // 1. Check if user already exists in local database
    const existingUser = await userService.getUserByClerkId(clerkId);
    
    if (existingUser) {
      return next();
    }

    // 2. If not found, only then call the slow Clerk API
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return res.status(401).json({ error: 'User email not found' });
    }

    // 3. Sync user with database
    await userService.syncUserFromClerk(clerkId, email);

    next();
  } catch (error) {
    console.error('User verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
