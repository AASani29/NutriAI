import { clerkClient } from '@clerk/clerk-sdk-node';
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { adminController } from './admin-controller';

const router = Router();

// Middleware to check admin role
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 1. Try to check role from JWT claims (fast, no network call)
    // Note: This requires Clerk to be configured to include publicMetadata in the JWT
    const claims = req.auth?.sessionClaims;
    const roleFromJWT = (claims?.metadata as any)?.role || (claims as any)?.role;
    
    if (roleFromJWT === 'admin') {
      return next();
    }

    // 2. Fallback to Clerk API if not in JWT (slow, but necessary if not configured)
    const user = await clerkClient.users.getUser(userId);

    // Check if user has admin role in public metadata
    if (user.publicMetadata?.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin role required.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Apply auth middleware to all admin routes
router.use(requireAuth);
router.use(requireAdmin);

// Admin routes
router.post('/foods', adminController.addFoodItem);
router.post('/resources', adminController.addResource);
router.get('/stats', adminController.getStats);

export default router;
