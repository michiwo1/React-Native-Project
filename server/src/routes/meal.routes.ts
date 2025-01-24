import express from 'express';
import { MealController } from '../controllers/meal.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const mealController = new MealController();

// 食事記録の作成
router.post('/', authenticate, mealController.createMeal.bind(mealController));

// 食事記録の取得
router.get('/', authenticate, mealController.getMeals.bind(mealController));

// 食品カテゴリーの取得
router.get('/food-categories', authenticate, mealController.getFoodCategories.bind(mealController));

// 食品の取得
router.get('/food-items', authenticate, mealController.getFoodItems.bind(mealController));

// 食事タイプの取得
router.get('/meal-types', authenticate, mealController.getMealTypes.bind(mealController));

export default router; 
