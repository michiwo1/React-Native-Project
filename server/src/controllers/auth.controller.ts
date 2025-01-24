import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/appError';

// Express Requestの型を拡張
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new AppError('User not found', 404));
      }

      await this.authService.logout(userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Successfully logged out'
      });
    } catch (error) {
      next(error);
    }
  };

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await this.authService.signUp(req.body);
      
      res.status(201).json({
        status: 'success',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.authService.login(email, password);
      
      res.status(200).json({
        status: 'success',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new AppError('User not found', 404));
      }

      const { oldPassword, newPassword } = req.body;
      const result = await this.authService.resetPassword(userId, oldPassword, newPassword);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new AppError('User not found', 404));
      }

      const { height, weight, age } = req.body;
      const profile = await this.authService.updateProfile(userId, { height, weight, age });
      
      res.status(200).json({
        status: 'success',
        data: { profile }
      });
    } catch (error) {
      next(error);
    }
  };
} 