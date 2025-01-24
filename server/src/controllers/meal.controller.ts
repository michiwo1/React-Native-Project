import { Request, Response } from 'express';
import { MealService } from '../services/meal.service';

const mealService = new MealService();

export class MealController {
  async createMeal(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const meal = await mealService.createMeal(userId, req.body);
      res.status(201).json(meal);
    } catch (error) {
      console.error('Error creating meal:', error);
      res.status(500).json({ message: 'Error creating meal' });
    }
  }

  async getMeals(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { startDate, endDate } = req.query;
      const meals = await mealService.getMealsByUserId(
        userId,
        startDate as string,
        endDate as string
      );
      res.json(meals);
    } catch (error) {
      console.error('Error getting meals:', error);
      res.status(500).json({ message: 'Error getting meals' });
    }
  }

  async getFoodCategories(req: Request, res: Response) {
    try {
      const categories = await mealService.getFoodCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error getting food categories:', error);
      res.status(500).json({ message: 'Error getting food categories' });
    }
  }

  async getFoodItems(req: Request, res: Response) {
    try {
      const { categoryId } = req.query;
      const foodItems = await mealService.getFoodItems(categoryId as string);
      res.json(foodItems);
    } catch (error) {
      console.error('Error getting food items:', error);
      res.status(500).json({ message: 'Error getting food items' });
    }
  }

  async getMealTypes(req: Request, res: Response) {
    try {
      const mealTypes = await mealService.getMealTypes();
      res.json(mealTypes);
    } catch (error) {
      console.error('Error getting meal types:', error);
      res.status(500).json({ message: 'Error getting meal types' });
    }
  }
} 