import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/appError';

interface CreateUserData {
  email: string;
  password: string;
  displayName?: string;
}

interface UpdateUserData {
  displayName?: string;
  email?: string;
  password_hash?: string;
}

interface UserProfileResponse {
  weight: number;
  goal_type: string;
  calorie_target: number;
  protein_target: number;
  carb_target: number;
  fat_target: number;
}

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async create(userData: CreateUserData) {
    try {
      return await this.prisma.user.create({
        data: {
          email: userData.email,
          password_hash: userData.password,
          display_name: userData.displayName
        },
        select: {
          id: true,
          email: true,
          display_name: true,
          created_at: true
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Email already exists', 409);
      }
      throw error;
    }
  }

  public async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  public async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        display_name: true,
        created_at: true,
        password_hash: true
      }
    });
  }

  public async update(id: string, data: UpdateUserData) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          display_name: data.displayName,
          email: data.email,
          password_hash: data.password_hash
        },
        select: {
          id: true,
          email: true,
          display_name: true,
          created_at: true
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Email already exists', 409);
      }
      throw error;
    }
  }

  public async updateProfile(userId: string, profileData: { height?: number; weight?: number; age?: number; goal?: string }) {
    try {
      let goalTypeId: string | undefined;
      
      if (profileData.goal) {
        const goalMap: { [key: string]: string } = {
          '筋肥大': 'goal_muscle_gain',
          '減量': 'goal_weight_loss',
          '維持': 'goal_maintenance'
        };
        goalTypeId = goalMap[profileData.goal];
      }

      const profile = await this.prisma.userProfile.upsert({
        where: {
          user_id: userId
        },
        create: {
          user_id: userId,
          height: profileData.height,
          weight: profileData.weight,
          age: profileData.age,
          goal_type_id: goalTypeId
        },
        update: {
          height: profileData.height,
          weight: profileData.weight,
          age: profileData.age,
          goal_type_id: goalTypeId
        }
      });
      return profile;
    } catch (error) {
      throw error;
    }
  }

  public async getLatestWeight(userId: string) {
    // 最新の2件の体重測定を取得
    const measurements = await this.prisma.measurement.findMany({
      where: {
        user_id: userId,
        metric_type: {
          name: 'weight'
        }
      },
      orderBy: {
        measured_at: 'desc'
      },
      take: 2,
      include: {
        metric_type: true
      }
    });

    if (measurements.length === 0) {
      // 測定データがない場合はユーザープロファイルから体重を取得
      const userProfile = await this.prisma.userProfile.findUnique({
        where: {
          user_id: userId
        }
      });

      if (!userProfile?.weight) {
        return null;
      }

      return {
        weight: userProfile.weight,
        date: userProfile.updated_at,
        change: null
      };
    }

    let change: number | null = null;

    if (measurements.length === 1) {
      // 測定が1件の場合、ユーザープロファイルの体重と比較
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { user_id: userId },
      });

      if (userProfile?.weight) {
        change = Number((measurements[0].value - userProfile.weight).toFixed(1));
      }
    } else {
      // 測定が2件以上の場合、最新の2件を比較
      change = Number((measurements[0].value - measurements[1].value).toFixed(1));
    }

    return {
      weight: measurements[0].value,
      date: measurements[0].measured_at,
      change
    };
  }

  public async getUserProfile(userId: string): Promise<UserProfileResponse> {
    try {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: {
          user_id: userId,
        },
        select: {
          weight: true,
          goal_type_id: true,
          goal_type: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // 目標タイプに基づいて栄養目標を計算
      const goalType = userProfile.goal_type?.name || 'maintain';
      const weight = userProfile.weight || 70; // デフォルト値として70kgを設定

      return {
        weight,
        goal_type: goalType,
        calorie_target: this.calculateCalorieTarget(weight, goalType),
        protein_target: this.calculateProteinTarget(weight, goalType),
        carb_target: this.calculateCarbTarget(weight, goalType),
        fat_target: this.calculateFatTarget(weight, goalType),
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }

  private calculateCalorieTarget(weight: number, goalType: string): number {
    const baseCalories = weight * 30; // 基礎代謝を体重×30で概算
    switch (goalType) {
      case 'bulk':
        return Math.round(baseCalories * 1.2); // 筋肥大時は20%増
      case 'cut':
        return Math.round(baseCalories * 0.8); // 減量時は20%減
      default:
        return Math.round(baseCalories); // 維持
    }
  }

  private calculateProteinTarget(weight: number, goalType: string): number {
    switch (goalType) {
      case 'bulk':
        return Math.round(weight * 2.2); // 筋肥大時は体重×2.2g
      case 'cut':
        return Math.round(weight * 2.4); // 減量時は体重×2.4g
      default:
        return Math.round(weight * 2.0); // 維持時は体重×2.0g
    }
  }

  private calculateCarbTarget(weight: number, goalType: string): number {
    switch (goalType) {
      case 'bulk':
        return Math.round(weight * 6); // 筋肥大時は体重×6g
      case 'cut':
        return Math.round(weight * 3); // 減量時は体重×3g
      default:
        return Math.round(weight * 4); // 維持時は体重×4g
    }
  }

  private calculateFatTarget(weight: number, goalType: string): number {
    switch (goalType) {
      case 'bulk':
        return Math.round(weight * 1.5); // 筋肥大時は体重×1.5g
      case 'cut':
        return Math.round(weight * 1.0); // 減量時は体重×1.0g
      default:
        return Math.round(weight * 1.2); // 維持時は体重×1.2g
    }
  }
} 