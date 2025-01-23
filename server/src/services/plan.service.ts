import { PrismaClient } from '@prisma/client';

export class PlanService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createPlan(userId: string, data: { name: string; exerciseIds: string[] }) {
    return await this.prisma.$transaction(async (tx) => {
      // Create plan
      const plan = await tx.plan.create({
        data: {
          user_id: userId,
          name: data.name,
        },
      });

      // Create plan exercises with display order
      const planExercises = await Promise.all(
        data.exerciseIds.map((exerciseId, index) =>
          tx.planExercise.create({
            data: {
              plan_id: plan.id,
              exercise_id: exerciseId,
              display_order: index,
            },
          })
        )
      );

      return {
        ...plan,
        exercises: planExercises,
      };
    });
  }

  async getUserPlans(userId: string) {
    return await this.prisma.plan.findMany({
      where: {
        user_id: userId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            display_order: 'asc',
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getPlanById(planId: string) {
    return await this.prisma.plan.findUnique({
      where: {
        id: planId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            display_order: 'asc',
          },
        },
      },
    });
  }
} 