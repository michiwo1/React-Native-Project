import { AuthService } from '../../services/auth.service';
import { prisma } from '../setup';
import { AppError } from '../../utils/appError';
import * as authUtils from '../../utils/auth';
import * as jwtUtils from '../../utils/jwt';

jest.mock('../../utils/auth');
jest.mock('../../utils/jwt');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('signUp', () => {
    const mockUser = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User'
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      (authUtils.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('mock-token');
      
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: mockUser.email,
        display_name: mockUser.displayName,
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      });

      const result = await authService.signUp(mockUser);

      expect(result).toHaveProperty('token', 'mock-token');
      expect(result.user).toHaveProperty('id', 'user-1');
      expect(result.user.email).toBe(mockUser.email);
      expect(authUtils.hashPassword).toHaveBeenCalledWith(mockUser.password);
    });

    it('should throw an error if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: mockUser.email,
        display_name: mockUser.displayName,
        password_hash: 'hashedPassword123',
        created_at: new Date(),
        updated_at: new Date()
      });

      await expect(authService.signUp(mockUser))
        .rejects
        .toThrow('Email already exists');
    });
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: 'user-1',
      email: mockCredentials.email,
      password_hash: 'hashedPassword123',
      display_name: 'Test User',
      created_at: new Date(),
      updated_at: new Date()
    };

    it('should login user successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (authUtils.comparePasswords as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.login(mockCredentials.email, mockCredentials.password);

      expect(result).toHaveProperty('token', 'mock-token');
      expect(result.user).toHaveProperty('id', 'user-1');
      expect(result.user.email).toBe(mockCredentials.email);
    });

    it('should throw an error if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(mockCredentials.email, mockCredentials.password))
        .rejects
        .toThrow('Invalid credentials');
    });

    it('should throw an error if password is incorrect', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (authUtils.comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(mockCredentials.email, mockCredentials.password))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const result = await authService.logout('user-1');
      expect(result).toEqual({ success: true });
    });
  });

  describe('resetPassword', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      password_hash: 'oldHashedPassword',
      display_name: 'Test User',
      created_at: new Date(),
      updated_at: new Date()
    };

    it('should reset password successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (authUtils.comparePasswords as jest.Mock).mockResolvedValue(true);
      (authUtils.hashPassword as jest.Mock).mockResolvedValue('newHashedPassword');
      prisma.user.update.mockResolvedValue({ ...mockUser, password_hash: 'newHashedPassword' });

      const result = await authService.resetPassword('user-1', 'oldPassword', 'newPassword');

      expect(result).toEqual({ message: 'Password updated successfully' });
      expect(authUtils.hashPassword).toHaveBeenCalledWith('newPassword');
    });

    it('should throw an error if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.resetPassword('user-1', 'oldPassword', 'newPassword'))
        .rejects
        .toThrow('User not found');
    });

    it('should throw an error if old password is incorrect', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (authUtils.comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(authService.resetPassword('user-1', 'wrongPassword', 'newPassword'))
        .rejects
        .toThrow('Current password is incorrect');
    });
  });
}); 
