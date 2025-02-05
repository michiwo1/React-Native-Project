import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const validateSignUp = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Invalid email format', 400));
  }

  // Password length validation
  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }

  next();
};

export const validatePasswordReset = (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError('New password is required', 400));
  }

  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }

  next();
}; 