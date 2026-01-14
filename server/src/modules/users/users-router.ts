import express from 'express';
import { userController } from './users-controller';
import { ensureUserExists, requireAuth } from '../../middleware/auth';

const router = express.Router();

// All user routes require authentication and existence check
router.use(requireAuth);
router.use(ensureUserExists);

router.get('/search', userController.searchUsers.bind(userController));
router.get('/me', userController.getCurrentUser.bind(userController));
router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', userController.updateProfile.bind(userController));

// Hydration Routes
import * as hydration from './hydration-controller';
router.get('/:userId/hydration/history', hydration.getHydrationHistory);
router.get('/:userId/hydration', hydration.getDailyHydration);
router.post('/:userId/hydration', hydration.updateDailyHydration);

// Fitness Routes
import * as fitness from './fitness-controller';
router.get('/:userId/fitness', fitness.getDailyFitness);
router.post('/:userId/fitness', fitness.updateFitnessLog);

export { router as usersRouter };