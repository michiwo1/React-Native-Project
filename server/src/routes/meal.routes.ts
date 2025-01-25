import { Router } from 'express';
import { MealController } from '../controllers/meal.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const mealController = new MealController();

// Protected routes
router.use(authenticate);

// 食事記録の作成
router.post('/', mealController.createMeal.bind(mealController));
router.post('/manual', mealController.createManualMeal.bind(mealController));

// 食事記録の取得
router.get('/', mealController.getMeals.bind(mealController));

// 食品カテゴリーの取得
router.get('/categories', mealController.getFoodCategories.bind(mealController));

// 食品の取得
router.get('/food-items', mealController.getFoodItems.bind(mealController));

// 食事タイプの取得
router.get('/types', mealController.getMealTypes.bind(mealController));

export default router; 
