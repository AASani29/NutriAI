import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node';
import { userService } from '../modules/users/users-service';
import fs from 'fs';


// Extend Express Request to include auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
      };
      isFirstSync?: boolean;
    }
  }
}

// Create the middleware instance by calling the function
const clerkAuth = ClerkExpressRequireAuth();

// Export it as requireAuth and assert the middleware type
const _requireAuth = clerkAuth as unknown as RequestHandler;
export const requireAuth: RequestHandler = (req, res, next) => {
  
  return _requireAuth(req, res, next);
};

// Custom middleware to ensure user exists in database
export const ensureUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
   
    if (req.auth) {
      console.log('🛡️ [ensureUserExists] UserId:', req.auth.userId);
    }

    if (!req.auth?.userId) {
      console.log('❌ [ensureUserExists] Blocking unauthorized request - req.auth missing');
      return res.status(401).json({ error: 'User check failed' });
    }

    // Get user's Clerk ID from the request
    const clerkId = req.auth.userId;

    // 1. Check if user already exists in local database
    const existingUser = await userService.getUserByClerkId(clerkId);
    
    if (existingUser) {
      return next();
    }

    // Get the user's data from Clerk's API
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ');

    if (!email) {
      return res.status(401).json({ error: 'User email not found' });
    }

    // 3. Sync user with database
    await userService.syncUserFromClerk(clerkId, email, fullName);
    req.isFirstSync = true;

    next();
  } catch (error) {
    console.error('User verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
