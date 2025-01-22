import { Request, Response } from 'express';
import { ExerciseService } from '../services/exercise.service';

const exerciseService = new ExerciseService();

export class ExerciseController {
  async getAllExercises(req: Request, res: Response) {
    try {
      const exercises = await exerciseService.getAllExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching exercises', error });
    }
  }

  async getExercisesByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const exercises = await exerciseService.getExercisesByCategory(categoryId);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching exercises by category', error });
    }
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await exerciseService.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching exercise categories', error });
    }
  }
} 