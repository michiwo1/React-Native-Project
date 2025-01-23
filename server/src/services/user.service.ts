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
} 