import { Router } from 'express';
import { ExerciseController } from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const exerciseController = new ExerciseController();

// Public routes
router.get('/categories', exerciseController.getAllCategories.bind(exerciseController));
router.get('/', exerciseController.getAllExercises.bind(exerciseController));
router.get('/category/:categoryId', exerciseController.getExercisesByCategory.bind(exerciseController));
router.get('/last-selected', exerciseController.getLastSelectedExercise.bind(exerciseController));

// Protected routes
router.use(authenticate);
router.get('/with-records', exerciseController.getExercisesWithRecords.bind(exerciseController));
router.get('/', exerciseController.getAllExercises.bind(exerciseController));
router.post('/', exerciseController.createExercise.bind(exerciseController));
router.put('/:exerciseId/select', exerciseController.setLastSelectedExercise.bind(exerciseController));

export default router; 