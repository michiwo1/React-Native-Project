import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/appError';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new AppError('User not found', 404));
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    console.log('updateProfile', req.body);
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new AppError('User not found', 404));
      }

      const updatedUser = await this.userService.updateProfile(userId, req.body);
      
      res.status(200).json({
        status: 'success',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  };

  public getLatestWeight = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const weightData = await this.userService.getLatestWeight(userId);
      if (!weightData) {
        return res.status(404).json({ message: 'Weight data not found' });
      }

      return res.status(200).json(weightData);
    } catch (error) {
      console.error('Error fetching weight data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  public getUserProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userProfile = await this.userService.getUserProfile(userId);
      return res.status(200).json(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  public getSelectedExerciseRecord = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const record = await this.userService.getSelectedExerciseRecord(userId);
      return res.status(200).json(record);
    } catch (error) {
      console.error('Error fetching selected exercise record:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
} 