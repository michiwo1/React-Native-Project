import { Request, Response } from 'express';
import { PlanService } from '../services/plan.service';
import { WorkoutService } from '../services/workout.service';

export class PlanController {
  private planService: PlanService;
  private workoutService: WorkoutService;

  constructor() {
    this.planService = new PlanService();
    this.workoutService = new WorkoutService();
  }

  createPlan = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, exerciseIds } = req.body;
      if (!name || !exerciseIds || !Array.isArray(exerciseIds)) {
        return res.status(400).json({ message: 'Invalid input' });
      }

      const plan = await this.planService.createPlan(userId, {
        name,
        exerciseIds,
      });

      return res.status(201).json(plan);
    } catch (error) {
      console.error('Error creating plan:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  getUserPlans = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const plans = await this.planService.getUserPlans(userId);
      return res.status(200).json(plans);
    } catch (error) {
      console.error('Error fetching user plans:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  startWorkoutFromPlan = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { planId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check for ongoing workout session
      const ongoingSession = await this.workoutService.getOngoingWorkoutSession(userId);

      if (ongoingSession) {
        return res.status(400).json({ 
          message: 'You have an ongoing workout session',
          ongoingSession: {
            id: ongoingSession.id,
            startedAt: ongoingSession.started_at,
            exercises: ongoingSession.exercises.map(e => ({
              name: e.exercise.name,
              sets: e.sets
            }))
          }
        });
      }


      const plan = await this.planService.getPlanById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      if (plan.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Get exercise IDs from plan
      const exerciseIds = plan.exercises.map(pe => pe.exercise_id);

      // Create workout session with exercises from plan
      const workoutSession = await this.workoutService.createWorkoutSession(userId, exerciseIds);

      return res.status(201).json(workoutSession);
    } catch (error) {
      console.error('Error starting workout from plan:', error);
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
} 