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

  async hasOngoingWorkoutSession(userId: string): Promise<boolean> {
    const ongoingSession = await this.prisma.workoutSession.findFirst({
      where: {
        user_id: userId,
        ended_at: null,
      },
    });
    return !!ongoingSession;
  }


  async getOngoingWorkoutSession(userId: string) {
    return await this.prisma.workoutSession.findFirst({
      where: {
        user_id: userId,
        ended_at: null,
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
  }

  async createWorkoutSession(userId: string, exerciseIds: string[]) {
    // Check for ongoing session first
    const hasOngoing = await this.hasOngoingWorkoutSession(userId);
    if (hasOngoing) {
      throw new Error('You have an ongoing workout session. Please finish it before starting a new one.');
    }

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
    // First, check if this exercise set already exists
    const existingSet = await this.prisma.exerciseSet.findFirst({
      where: {
        workout_session_exercise_id: workoutSessionExerciseId,
        set_number: setData.setNumber,
      },
    });

    if (existingSet) {
      // Update the existing set
      return await this.prisma.exerciseSet.update({
        where: { id: existingSet.id },
        data: {
          weight: setData.weight,
          reps: setData.reps,
          is_completed: setData.isCompleted,
        },
      });
    } else {
      // Create a new set
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
      return await this.prisma.$transaction(async (tx) => {
        // Get workout session (including exercises and sets)
        const workoutSession = await tx.workoutSession.findFirst({
          where: {
            id: workoutSessionId,
            user_id: userId,
          },
          include: {
            exercises: {
              include: {
                exercise: true,
                sets: {
                  where: {
                    is_completed: true // Only target completed sets
                  }
                }
              }
            }
          }
        });

        if (!workoutSession) {
          throw new Error('Workout session not found');
        }

        // Check each exercise's personal record
        for (const workoutExercise of workoutSession.exercises) {
          if (workoutExercise.sets.length === 0) continue;

          // Calculate theoretical 1RM for each set using the Brzycki formula
          const oneRMs = workoutExercise.sets.map(set => {
            // Consider only 1-10 reps range for accuracy
            if (set.reps < 1 || set.reps > 10) return 0;
            // Brzycki formula: 1RM = weight × (36 / (37 - reps))
            return set.weight * (36 / (37 - set.reps));
          });

          // Get the highest 1RM from this workout
          const maxOneRM = Math.max(...oneRMs);
          if (maxOneRM === 0) continue; // Skip if no valid sets

          // Get all sets that achieved the highest 1RM
          const bestSets = workoutExercise.sets.filter((set, index) => 
            oneRMs[index] === maxOneRM
          );

          // Select the set with the least reps to achieve the highest 1RM
          const bestSet = bestSets.reduce((a, b) => 
            a.reps < b.reps ? a : b
          );

          // Get the current PR for this exercise
          const currentPR = await tx.exercisePersonalRecord.findFirst({
            where: {
              user_id: userId,
              exercise_id: workoutExercise.exercise_id
            },
            orderBy: {
              recorded_at: 'desc'
            }
          });

          // Calculate current PR 1RM (if exists)
          const currentOneRM = currentPR 
            ? currentPR.weight * (36 / (37 - currentPR.reps))
            : 0;

          // Update PR if current set's 1RM is higher
          if (!currentPR || maxOneRM > currentOneRM) {
            await tx.exercisePersonalRecord.create({
              data: {
                user_id: userId,
                exercise_id: workoutExercise.exercise_id,
                weight: bestSet.weight,
                reps: bestSet.reps,
                recorded_at: new Date()
              }
            });
          }
        }

        // Update session to ended state
        return await tx.workoutSession.update({
          where: {
            id: workoutSessionId,
            user_id: userId
          },
          data: {
            ended_at: new Date()
          },
          include: {
            exercises: {
              include: {
                exercise: true,
                sets: true
              }
            }
          }
        });
      });
    } catch (error) {
      console.error('Error while finishing workout session:', error);
      throw new Error('Workout session not found');
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

  async getWorkoutHistory(userId: string) {
    return await this.prisma.workoutSession.findMany({
      where: {
        user_id: userId,
        ended_at: {
          not: null
        }
      },
      orderBy: {
        ended_at: 'desc'
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
  }
} 