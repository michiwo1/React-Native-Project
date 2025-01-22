import { PrismaClient } from '@prisma/client';

interface ExerciseSetData {
  setNumber: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

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

  async addExercisesToWorkoutSession(userId: string, workoutSessionId: string, exerciseIds: string[]) {
    return await this.prisma.$transaction(async (tx) => {
      // Verify the workout session belongs to the user
      const workoutSession = await tx.workoutSession.findFirst({
        where: {
          id: workoutSessionId,
          user_id: userId,
        },
      });

      if (!workoutSession) {
        throw new Error('Workout session not found or unauthorized');
      }

      // Create workout session exercises
      const workoutSessionExercises = await Promise.all(
        exerciseIds.map((exerciseId) =>
          tx.workoutSessionExercise.create({
            data: {
              workout_session_id: workoutSessionId,
              exercise_id: exerciseId,
            },
          })
        )
      );

      // Get the updated workout session with all exercises
      const updatedWorkoutSession = await tx.workoutSession.findUnique({
        where: {
          id: workoutSessionId,
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

      return updatedWorkoutSession;
    });
  }

  async saveExerciseSet(workoutSessionExerciseId: string, setData: ExerciseSetData) {
    // まず、このエクササイズセットが既に存在するか確認
    const existingSet = await this.prisma.exerciseSet.findFirst({
      where: {
        workout_session_exercise_id: workoutSessionExerciseId,
        set_number: setData.setNumber,
      },
    });

    if (existingSet) {
      // 既存のセットを更新
      return await this.prisma.exerciseSet.update({
        where: { id: existingSet.id },
        data: {
          weight: setData.weight,
          reps: setData.reps,
          is_completed: setData.isCompleted,
        },
      });
    } else {
      // 新しいセットを作成
      return await this.prisma.exerciseSet.create({
        data: {
          workout_session_exercise_id: workoutSessionExerciseId,
          set_number: setData.setNumber,
          weight: setData.weight,
          reps: setData.reps,
          is_completed: setData.isCompleted,
        },
      });
    }
  }

  async completeWorkoutSession(sessionId: string, userId: string) {
    return await this.prisma.workoutSession.update({
      where: {
        id: sessionId,
        user_id: userId,
      },
      data: {
        ended_at: new Date(),
      },
    });
  }
} 