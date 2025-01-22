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

      const updatedUser = await this.userService.update(userId, req.body);
      
      res.status(200).json({
        status: 'success',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  };
} 