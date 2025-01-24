import { UserService } from './user.service';
import { comparePasswords, hashPassword } from '../utils/auth';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/appError';

export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async logout(userId: string): Promise<{ success: boolean }> {
    // セッション情報をクリアする処理を実装
    // 今回はJWTを使用しているため、クライアント側でトークンを削除する
    return { success: true };
  }

  public async signUp(userData: { email: string; password: string; displayName?: string }) {
    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already exists', 409);
    }

    const hashedPassword = await hashPassword(userData.password);
    const user = await this.userService.create({
      ...userData,
      password: hashedPassword
    });

    const token = generateToken(user.id);
    return { user, token };
  }

  public async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await comparePasswords(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user.id);
    return { user, token };
  }

  public async resetPassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await comparePasswords(oldPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.userService.update(user.id, {
      password_hash: hashedPassword
    });

    return { message: 'Password updated successfully' };
  }

  public async updateProfile(userId: string, profileData: { height?: number; weight?: number; age?: number }) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const profile = await this.userService.updateProfile(userId, profileData);
    return profile;
  }
} 