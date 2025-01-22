import { Router } from 'express';
import { WorkoutController } from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const workoutController = new WorkoutController();

// Create workout session
router.post('/sessions', authenticate, workoutController.createWorkoutSession);
router.post('/session', authenticate, workoutController.createWorkoutSession);
router.get('/latest', authenticate, workoutController.getLatestWorkoutSession);

// Add exercises to workout session
router.post('/:workoutSessionId/exercises', authenticate, workoutController.addExercisesToWorkoutSession);

// Save exercise sets and complete workout session
router.post('/:workoutSessionExerciseId/sets', authenticate, workoutController.saveExerciseSet);
router.put('/sessions/:sessionId/complete', authenticate, workoutController.completeWorkoutSession);

export default router; 