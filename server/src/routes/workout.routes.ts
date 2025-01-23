import { Router } from 'express';
import { WorkoutController } from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const workoutController = new WorkoutController();

// Create workout session
router.post('/sessions', authenticate, workoutController.createWorkoutSession);
router.post('/session', authenticate, workoutController.createWorkoutSession);
router.get('/latest', authenticate, workoutController.getLatestWorkoutSession);
router.get('/history', authenticate, workoutController.getWorkoutHistory);

// Add exercises to workout session
router.post('/:workoutSessionId/exercises', authenticate, workoutController.addExercisesToWorkoutSession);

// Save exercise sets
router.post('/:workoutSessionExerciseId/sets', authenticate, workoutController.saveExerciseSet);

// Finish workout session and get summary
router.post('/sessions/:workoutSessionId/finish', authenticate, workoutController.finishWorkoutSession);
router.get('/sessions/:workoutSessionId/summary', authenticate, workoutController.getWorkoutSummary);

export default router; 