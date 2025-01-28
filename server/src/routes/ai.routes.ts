import express from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const aiController = new AIController();

// Protected routes
router.use(authenticate);

// AI nutrition advice endpoint
router.post('/nutrition-advice', aiController.getNutritionAdvice);

// AI workout advice endpoint
router.post('/workout-advice', aiController.getWorkoutAdvice);

export default router; 