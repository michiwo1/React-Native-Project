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
  id: string;
  display_name: string;
  weight: number;
  height: number | null;
  age: number | null;
  goal_type: string;
  latest_weight?: {
    value: number;
    measured_at: string;
  };
  calorie_target: number;
  protein_target: number;
  carb_target: number;
  fat_target: number;
}

interface ExerciseRecordResponse {
  name: string;
  current: number;
  change: number | null;
  date: Date | null;
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

  public async updateProfile(userId: string, profileData: { height?: number; weight?: number; age?: number; goal_type?: string }) {
    try {
      let goalTypeId: string | undefined;
      
      if (profileData.goal_type) {
        // First, search for the corresponding goal type from the goal_types table
        const goalType = await this.prisma.goalType.findFirst({
          where: {
            name: profileData.goal_type
          }
        });

        if (goalType) {
          goalTypeId = goalType.id;
        }
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
    // Get the latest 2 weight measurements
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
      // If no measurement data exists, get weight from user profile
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
      // If there is only one measurement, compare with user profile weight
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { user_id: userId },
      });

      if (userProfile?.weight) {
        change = Number((measurements[0].value - userProfile.weight).toFixed(1));
      }
    } else {
      // If there are 2 or more measurements, compare the latest 2
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
      const [userProfile, user, latestWeight] = await Promise.all([
        this.prisma.userProfile.findUnique({
          where: {
            user_id: userId,
          },
          select: {
            weight: true,
            height: true,
            age: true,
            goal_type_id: true,
            goal_type: {
              select: {
                name: true,
              },
            },
          },
        }),
        this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            display_name: true,
          },
        }),
        this.prisma.measurement.findFirst({
          where: {
            user_id: userId,
            metric_type: {
              name: 'weight'
            }
          },
          orderBy: {
            measured_at: 'desc'
          },
          select: {
            value: true,
            measured_at: true
          }
        })
      ]);

      if (!userProfile || !user) {
        throw new Error('User profile not found');
      }

      // Calculate nutrition targets based on goal type
      const goalType = userProfile.goal_type?.name || 'maintain';
      const weight = latestWeight?.value || userProfile.weight || 70; // Use latest measurement, profile weight, or default value in order

      const response: UserProfileResponse = {
        id: user.id,
        display_name: user.display_name || '',
        weight: userProfile.weight || 0,
        height: userProfile.height,
        age: userProfile.age,
        goal_type: goalType,
        calorie_target: this.calculateCalorieTarget(weight, goalType),
        protein_target: this.calculateProteinTarget(weight, goalType),
        carb_target: this.calculateCarbTarget(weight, goalType),
        fat_target: this.calculateFatTarget(weight, goalType),
      };

      if (latestWeight) {
        response.latest_weight = {
          value: latestWeight.value,
          measured_at: latestWeight.measured_at.toISOString(),
        };
      }

      return response;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }

  private calculateCalorieTarget(weight: number, goalType: string): number {
    const baseCalories = weight * 30; // Estimate BMR as weight × 30
    switch (goalType) {
      case 'bulk':
        return Math.round(baseCalories * 1.2); // Increase by 20% for muscle gain
      case 'cut':
        return Math.round(baseCalories * 0.8); // Decrease by 20% for weight loss
      default:
        return Math.round(baseCalories); // Maintain
    }
  }

  private calculateProteinTarget(weight: number, goalType: string): number {
    switch (goalType) {
      case 'bulk':
        return Math.round(weight * 2.2); // 2.2g per kg bodyweight for muscle gain
      case 'cut':
        return Math.round(weight * 2.4); // 2.4g per kg bodyweight for weight loss
      default:
        return Math.round(weight * 2.0); // 2.0g per kg bodyweight for maintenance
    }
  }

  private calculateCarbTarget(weight: number, goalType: string): number {
    switch (goalType) {
      case 'bulk':
        return Math.round(weight * 6); // 6g per kg bodyweight for muscle gain
      case 'cut':
        return Math.round(weight * 3); // 3g per kg bodyweight for weight loss
      default:
        return Math.round(weight * 4); // 4g per kg bodyweight for maintenance
    }
  }

  private calculateFatTarget(weight: number, goalType: string): number {
    const baseCalories = this.calculateCalorieTarget(weight, goalType);
    return Math.round((baseCalories * 0.25) / 9); // 25% of total calories from fat (1g = 9kcal)
  }

  public async getSelectedExerciseRecord(userId: string): Promise<ExerciseRecordResponse | null> {
    // Get the last selected exercise
    const selectedExercise = await this.prisma.exercise.findFirst({
      where: {
        is_last_selected: true
      }
    });

    if (!selectedExercise) {
      return null;
    }

    // Get the latest 2 personal records for the selected exercise
    const records = await this.prisma.exercisePersonalRecord.findMany({
      where: {
        user_id: userId,
        exercise_id: selectedExercise.id
      },
      orderBy: {
        recorded_at: 'desc'
      },
      take: 2
    });

    if (records.length === 0) {
      return {
        name: selectedExercise.name,
        current: 0,
        change: null,
        date: null
      };
    }

    const current = records[0].weight;
    const change = records.length > 1 ? Number((records[0].weight - records[1].weight).toFixed(1)) : null;

    return {
      name: selectedExercise.name,
      current,
      change,
      date: records[0].recorded_at
    };
  }
} 