import { PrismaClient, WorkoutSession, ExerciseSet, WorkoutSessionExercise } from '@prisma/client';

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

  async finishWorkoutSession(workoutSessionId: string, userId: string) {
    try {
      const workoutSession = await this.prisma.workoutSession.findFirst({
        where: {
          id: workoutSessionId,
          user_id: userId,
        },
      });

      if (!workoutSession) {
        throw new Error('Workout session not found');
      }

      return await this.prisma.workoutSession.update({
        where: { 
          id: workoutSessionId,
          user_id: userId // Add user_id to ensure ownership
        },
        data: { 
          ended_at: new Date() 
        },
        include: { // Include related data for verification
          exercises: {
            include: {
              sets: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error finishing workout session:', error);
      throw new Error('Failed to finish workout session');
    }
  }

  async getWorkoutSummary(workoutSessionId: string, userId: string) {
    const workoutSession = await this.prisma.workoutSession.findFirst({
      where: {
        id: workoutSessionId,
        user_id: userId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    if (!workoutSession) {
      throw new Error('Workout session not found');
    }

    const duration = workoutSession.ended_at 
      ? Math.floor((workoutSession.ended_at.getTime() - workoutSession.started_at.getTime()) / 1000)
      : 0;

    const exerciseCount = workoutSession.exercises.length;

    const totalVolume = workoutSession.exercises.reduce((total: number, exercise) => {
      return total + exercise.sets.reduce((setTotal: number, set) => {
        return setTotal + (set.weight * set.reps);
      }, 0);
    }, 0);

    return {
      duration,
      exerciseCount,
      totalVolume,
      startedAt: workoutSession.started_at,
      endedAt: workoutSession.ended_at,
    };
  }
} 