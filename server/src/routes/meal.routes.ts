import { Router } from 'express';
import { MealController } from '../controllers/meal.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const mealController = new MealController();

// Protected routes
router.use(authenticate);

// Create meal record
router.post('/', mealController.createMeal.bind(mealController));
router.post('/manual', mealController.createManualMeal.bind(mealController));

// Get meal records
router.get('/', mealController.getMeals.bind(mealController));

// Get food categories
router.get('/categories', mealController.getFoodCategories.bind(mealController));

// Get food items
router.get('/food-items', mealController.getFoodItems.bind(mealController));

// Get meal types
router.get('/types', mealController.getMealTypes.bind(mealController));

export default router; 
