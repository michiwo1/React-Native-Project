import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { UserService } from '../services/user.service';
import { WorkoutService } from '../services/workout.service';
import { ExerciseService } from '../services/exercise.service';

export class AIController {
  private aiService: AIService;
  private userService: UserService;
  private workoutService: WorkoutService;
  private exerciseService: ExerciseService;

  constructor() {
    this.aiService = new AIService();
    this.userService = new UserService();
    this.workoutService = new WorkoutService();
    this.exerciseService = new ExerciseService();
  }

  public getNutritionAdvice = async (req: Request, res: Response): Promise<Response> => {
    try {
      
      const userId = req.user?.userId;
      if (!userId) {
        console.error('Unauthorized request: No userId found');
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        console.error('Invalid request: Missing or invalid query', { query });
        return res.status(400).json({ message: 'Query is required' });
      }

      // Get user profile
      const userProfile = await this.userService.getUserProfile(userId);
      
      const advice = await this.aiService.generateNutritionAdvice(query, {
        weight: userProfile.weight,
        height: userProfile.height || undefined,
        age: userProfile.age || undefined,
        goal: userProfile.goal_type,
        activityLevel: 'moderate',
        calorieTarget: userProfile.calorie_target,
        proteinTarget: userProfile.protein_target,
        carbTarget: userProfile.carb_target,
        fatTarget: userProfile.fat_target
      });
      
      return res.status(200).json({ advice });
    } catch (error) {

      if (error instanceof Error) {
        return res.status(500).json({ 
          message: 'Server error occurred',
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      return res.status(500).json({ message: 'Server error occurred' });
    }
  };

  public getWorkoutAdvice = async (req: Request, res: Response): Promise<Response> => {
    try {
      
      const userId = req.user?.userId;
      if (!userId) {
        console.error('Unauthorized request: No userId found');
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { question, workoutSessionId } = req.body;
      if (!question || typeof question !== 'string') {
        console.error('Invalid request: Missing or invalid question', { question });
        return res.status(400).json({ message: 'Question is required' });
      }

      // Get user profile
      const userProfile = await this.userService.getUserProfile(userId);

      // Get ongoing workout session
      const ongoingSession = await this.workoutService.getOngoingWorkoutSession(userId);
      
      // Get exercise personal records
      const exercisesWithRecords = await this.exerciseService.getExercisesWithRecords(userId);

      // Map personal records related to current session exercises
      const currentExercises = ongoingSession?.exercises.map(exercise => {
        const exerciseWithRecord = exercisesWithRecords.find(e => e.id === exercise.exercise_id);
        return {
          name: exercise.exercise.name,
          sets: exercise.sets,
          personalRecord: exerciseWithRecord?.personal_records[0] || null
        };
      }) || [];
      
      const response = await this.aiService.generateWorkoutAdvice(question, {
        workoutSessionId,
        goal: userProfile.goal_type,
        currentExercises
      });
      
      return res.status(200).json({ response });
    } catch (error) {

      if (error instanceof Error) {
        return res.status(500).json({ 
          message: 'Server error occurred',
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      return res.status(500).json({ message: 'Server error occurred' });
    }
  };

  analyzeMealImage = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const imageBuffer = req.file.buffer;
      const result = await this.aiService.analyzeMealImage(imageBuffer);

      if (!result) {
        return res.status(400).json({ message: 'Failed to analyze image' });
      }

      return res.status(200).json(result);
    } catch (error) {

      if (error instanceof Error) {
        return res.status(500).json({ 
          message: 'Error occurred while analyzing image',
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      return res.status(500).json({ message: 'Server error occurred' });
    }
  };
} 