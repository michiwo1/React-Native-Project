import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const userController = new UserController();

// Protected routes
router.use(authenticate);

router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateProfile);
router.get('/weight', userController.getLatestWeight);

export default router; 