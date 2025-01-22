import { Request, Response } from 'express';
import { WorkoutService } from '../services/workout.service';

export class WorkoutController {
  private workoutService: WorkoutService;

  constructor() {
    this.workoutService = new WorkoutService();
  }

  createWorkoutSession = async (req: Request, res: Response) => {
    console.log('1-------');
    try {
      const { exerciseIds } = req.body;
      const userId = req.user?.userId;

      console.log('2-------');
      console.log(userId);
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      console.log('3-------');
      console.log(exerciseIds);
      if (!exerciseIds || !Array.isArray(exerciseIds) || exerciseIds.length === 0) {
        return res.status(400).json({ message: 'Exercise IDs are required' });
      }

      console.log('4-------');
      const workoutSession = await this.workoutService.createWorkoutSession(userId, exerciseIds);
      console.log('5-------');
      console.log(workoutSession);
      return res.status(201).json(workoutSession);
    } catch (error) {
      console.error('Error creating workout session:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
} 