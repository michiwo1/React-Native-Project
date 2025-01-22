import { Router } from 'express';
import { ExerciseController } from '../controllers/exercise.controller';

const router = Router();
const exerciseController = new ExerciseController();

// Public routes for exercises
router.get('/categories', exerciseController.getAllCategories.bind(exerciseController));
router.get('/', exerciseController.getAllExercises.bind(exerciseController));
router.get('/category/:categoryId', exerciseController.getExercisesByCategory.bind(exerciseController));

export default router; 