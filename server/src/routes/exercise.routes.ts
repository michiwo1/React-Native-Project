import { Router } from 'express';
import { ExerciseController } from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const exerciseController = new ExerciseController();

// Public routes for exercises
router.get('/categories', exerciseController.getAllCategories.bind(exerciseController));
router.get('/', exerciseController.getAllExercises.bind(exerciseController));
router.get('/category/:categoryId', exerciseController.getExercisesByCategory.bind(exerciseController));

// Protected routes for exercises
router.post('/', authenticate, exerciseController.createExercise.bind(exerciseController));

export default router; 