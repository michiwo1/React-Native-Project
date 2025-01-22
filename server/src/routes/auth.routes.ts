import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateSignUp } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const authController = new AuthController();

router.post('/signup', validateSignUp, authController.signUp);
router.post('/login', authController.login);
router.post('/reset-password', authenticate, authController.resetPassword);

export default router; 