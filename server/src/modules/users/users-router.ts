import express from 'express';
import { userController } from './users-controller';
import { requireAuth } from '../../middleware/auth';

const router = express.Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/me', userController.getCurrentUser.bind(userController));
router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', userController.updateProfile.bind(userController));

export { router as usersRouter };