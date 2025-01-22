import { Request, Response } from 'express';
import { WorkoutService } from '../services/workout.service';

export class WorkoutController {
  private workoutService: WorkoutService;

  constructor() {
    this.workoutService = new WorkoutService();
  }

  createWorkoutSession = async (req: Request, res: Response) => {
    try {
      const { exerciseIds } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!exerciseIds || !Array.isArray(exerciseIds) || exerciseIds.length === 0) {
        return res.status(400).json({ message: 'Exercise IDs are required' });
      }

      const workoutSession = await this.workoutService.createWorkoutSession(userId, exerciseIds);
      return res.status(201).json(workoutSession);
    } catch (error) {
      console.error('Error creating workout session:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  addExercisesToWorkoutSession = async (req: Request, res: Response) => {
    try {
      const { exerciseIds } = req.body;
      const { workoutSessionId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!exerciseIds || !Array.isArray(exerciseIds) || exerciseIds.length === 0) {
        return res.status(400).json({ message: 'Exercise IDs are required' });
      }

      const workoutSession = await this.workoutService.addExercisesToWorkoutSession(
        userId,
        workoutSessionId,
        exerciseIds
      );

      return res.status(200).json(workoutSession);
    } catch (error) {
      console.error('Error adding exercises to workout session:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  getLatestWorkoutSession = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const workoutSession = await this.workoutService.getLatestWorkoutSession(userId);
      return res.status(200).json(workoutSession);
    } catch (error) {
      console.error('Error fetching latest workout session:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
} 