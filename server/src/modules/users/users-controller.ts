import { Request, Response } from 'express';
import { userService } from './users-service';

export class UserController {
  async getCurrentUser(req: Request, res: Response) {
    try {
      const clerkId = req.auth?.userId;

      if (!clerkId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userService.getUserByClerkId(clerkId);

      if (!user) {
        return res.status(404).json({ error: 'User not found after sync' });
      }

      res.json({
        success: true,
        data: {
          ...user,
          isNewUser: (req as any).isFirstSync || false,
        },
      });
    } catch (error: any) {
      console.error('Error getting current user:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user',
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const clerkId = req.auth?.userId;

      if (!clerkId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        fullName,
        dietaryPreference,
        location,
        budgetRange,
        height,
        weight,
        weightPreference,
        allergies,
        healthConditions,
        latitude,
        longitude,
      } = req.body;

      if (budgetRange !== undefined && (budgetRange < 0 || isNaN(budgetRange))) {
        return res.status(400).json({
          success: false,
          error: 'Budget range must be a positive number',
        });
      }

      const updatedUser = await userService.updateUserProfile(clerkId, {
        fullName,
        dietaryPreference,
        location,
        budgetRange: budgetRange ? parseFloat(budgetRange) : undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        weightPreference,
        allergies,
        healthConditions,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update profile',
      });
    }
  }

  async searchUsers(req: Request, res: Response) {
    try {
      const { q, limit } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
      }

      const users = await userService.searchUsers(q, limit ? parseInt(limit as string, 10) : 10);

      // Get Clerk user data for profile images
      const clerkUsers = await Promise.all(
        users.map(async (user) => {
          try {
            const clerkUser = await (req as any).clerkClient?.users?.getUser(user.clerkId);
            return {
              ...user,
              imageUrl: clerkUser?.imageUrl || clerkUser?.profileImageUrl || null,
            };
          } catch (err) {
            return { ...user, imageUrl: null };
          }
        })
      );

      res.json({ success: true, users: clerkUsers });
    } catch (error: any) {
      console.error('Error searching users:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to search users' });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const clerkId = req.auth?.userId;

      if (!clerkId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userService.getUserByClerkId(clerkId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user.profile,
      });
    } catch (error: any) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get profile',
      });
    }
  }
}

export const userController = new UserController();