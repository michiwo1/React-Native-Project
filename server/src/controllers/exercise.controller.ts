import { Request, Response } from 'express';
import { ExerciseService } from '../services/exercise.service';

const exerciseService = new ExerciseService();

export class ExerciseController {
  async getAllExercises(req: Request, res: Response) {
    try {
      const exercises = await exerciseService.getAllExercises();
      return res.status(200).json(exercises);
    } catch (error) {
      console.error('Error getting exercises:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getExercisesWithRecords(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const exercises = await exerciseService.getExercisesWithRecords(userId);
      return res.status(200).json(exercises);
    } catch (error) {
      console.error('Error getting exercises with records:', error);
      return res.status(500).json({ message: 'Internal server error' });
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

  async createExercise(req: Request, res: Response) {
    try {
      const { name, category_id } = req.body;
      
      if (!name || !category_id) {
        return res.status(400).json({ message: '種目名とカテゴリーIDは必須です' });
      }

      const exercise = await exerciseService.createExercise({ name, category_id });
      res.status(201).json(exercise);
    } catch (error) {
      res.status(500).json({ message: '種目の作成に失敗しました', error });
    }
  }

  async setLastSelectedExercise(req: Request, res: Response) {
    try {
      const { exerciseId } = req.params;
      
      if (!exerciseId) {
        return res.status(400).json({ message: '種目IDは必須です' });
      }

      const exercise = await exerciseService.setLastSelectedExercise(exerciseId);
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: '種目の選択状態の更新に失敗しました', error });
    }
  }

  async getLastSelectedExercise(req: Request, res: Response) {
    try {
      const exercise = await exerciseService.getLastSelectedExercise();
      if (!exercise) {
        return res.status(404).json({ message: '選択された種目が見つかりません' });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: '最後に選択された種目の取得に失敗しました', error });
    }
  }
} 