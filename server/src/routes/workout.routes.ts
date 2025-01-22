import { Router } from 'express';
import { WorkoutController } from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const workoutController = new WorkoutController();

// Create workout session
router.post('/sessions', authenticate, workoutController.createWorkoutSession);

export default router; 