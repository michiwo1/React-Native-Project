import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { UserService } from '../services/user.service';

export class AIController {
  private aiService: AIService;
  private userService: UserService;

  constructor() {
    this.aiService = new AIService();
    this.userService = new UserService();
  }

  public getNutritionAdvice = async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log('Received nutrition advice request');
      
      const userId = req.user?.userId;
      if (!userId) {
        console.error('Unauthorized request: No userId found');
        return res.status(401).json({ message: '認証が必要です' });
      }

      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        console.error('Invalid request: Missing or invalid query', { query });
        return res.status(400).json({ message: '質問が必要です' });
      }

      console.log('Processing request for userId:', userId);

      // ユーザープロフィールを取得
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
      
      console.log('Successfully generated advice');
      return res.status(200).json({ advice });
    } catch (error) {
      console.error('Detailed error in getNutritionAdvice:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof Error) {
        return res.status(500).json({ 
          message: 'サーバーエラーが発生しました',
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  public getWorkoutAdvice = async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log('Received workout advice request');
      
      const userId = req.user?.userId;
      if (!userId) {
        console.error('Unauthorized request: No userId found');
        return res.status(401).json({ message: '認証が必要です' });
      }

      const { question, workoutSessionId } = req.body;
      if (!question || typeof question !== 'string') {
        console.error('Invalid request: Missing or invalid question', { question });
        return res.status(400).json({ message: '質問が必要です' });
      }

      console.log('Processing workout advice request for userId:', userId);

      // ユーザープロフィールを取得
      const userProfile = await this.userService.getUserProfile(userId);
      
      const response = await this.aiService.generateWorkoutAdvice(question, {
        workoutSessionId,
        weight: userProfile.weight,
        height: userProfile.height || undefined,
        age: userProfile.age || undefined,
        goal: userProfile.goal_type,
        activityLevel: 'moderate'
      });
      
      console.log('Successfully generated workout advice');
      return res.status(200).json({ response });
    } catch (error) {
      console.error('Detailed error in getWorkoutAdvice:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof Error) {
        return res.status(500).json({ 
          message: 'サーバーエラーが発生しました',
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };
} 