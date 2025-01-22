import { PrismaClient } from '@prisma/client';

export class WorkoutService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createWorkoutSession(userId: string, exerciseIds: string[]) {
    return await this.prisma.$transaction(async (tx) => {
      // Create workout session
      const workoutSession = await tx.workoutSession.create({
        data: {
          user_id: userId,
          started_at: new Date(),
        },
      });

      // Create workout session exercises
      const workoutSessionExercises = await Promise.all(
        exerciseIds.map((exerciseId) =>
          tx.workoutSessionExercise.create({
            data: {
              workout_session_id: workoutSession.id,
              exercise_id: exerciseId,
            },
          })
        )
      );

      return {
        ...workoutSession,
        exercises: workoutSessionExercises,
      };
    });
  }

  async getLatestWorkoutSession(userId: string) {
    const latestSession = await this.prisma.workoutSession.findFirst({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        exercises: {
          include: {
            exercise: {
              include: {
                category: true,
              },
            },
            sets: true,
          },
        },
      },
    });

    return latestSession;
  }
} 