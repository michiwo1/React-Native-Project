import { WorkoutService } from '../../services/workout.service';
import { prisma } from '../setup';
import { Prisma } from '@prisma/client';

type WorkoutSessionWithExercises = Prisma.WorkoutSessionGetPayload<{
  include: {
    exercises: {
      include: {
        exercise: {
          include: {
            category: true
          }
        }
        sets: true
      }
    }
  }
}>;

type MockWorkoutSession = {
  id: string;
  user_id: string;
  started_at: Date;
  ended_at: Date | null;
  note: string | null;
  created_at: Date;
  updated_at: Date;
};

describe('WorkoutService', () => {
  let workoutService: WorkoutService;

  beforeEach(() => {
    workoutService = new WorkoutService();
  });

  describe('hasOngoingWorkoutSession', () => {
    it('should return true if user has ongoing session', async () => {
      const userId = 'user-1';
      const mockSession: MockWorkoutSession = {
        id: 'session-1',
        user_id: userId,
        started_at: new Date(),
        ended_at: null,
        note: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      prisma.workoutSession.findFirst.mockResolvedValue(mockSession);

      const result = await workoutService.hasOngoingWorkoutSession(userId);
      expect(result).toBe(true);
      expect(prisma.workoutSession.findFirst).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          ended_at: null,
        },
      });
    });

    it('should return false if user has no ongoing session', async () => {
      const userId = 'user-1';
      prisma.workoutSession.findFirst.mockResolvedValue(null);

      const result = await workoutService.hasOngoingWorkoutSession(userId);
      expect(result).toBe(false);
    });
  });

  describe('getOngoingWorkoutSession', () => {
    it('should return ongoing workout session with exercises', async () => {
      const userId = 'user-1';
      const mockSession: WorkoutSessionWithExercises = {
        id: 'session-1',
        user_id: userId,
        started_at: new Date(),
        ended_at: null,
        note: null,
        created_at: new Date(),
        updated_at: new Date(),
        exercises: [
          {
            id: 'workout-exercise-1',
            workout_session_id: 'session-1',
            exercise_id: 'exercise-1',
            note: null,
            created_at: new Date(),
            updated_at: new Date(),
            exercise: {
              id: 'exercise-1',
              name: 'Bench Press',
              category_id: 'category-1',
              description: null,
              instruction: null,
              thumbnail_url: null,
              is_last_selected: false,
              created_at: new Date(),
              updated_at: new Date(),
              category: {
                id: 'category-1',
                name: 'Chest',
                display_order: 1,
                created_at: new Date(),
                updated_at: new Date()
              }
            },
            sets: [
              {
                id: 'set-1',
                workout_session_exercise_id: 'workout-exercise-1',
                set_number: 1,
                weight: 100,
                reps: 10,
                is_completed: true,
                created_at: new Date(),
                updated_at: new Date()
              }
            ]
          }
        ]
      };

      prisma.workoutSession.findFirst.mockResolvedValue(mockSession);

      const result = await workoutService.getOngoingWorkoutSession(userId);
      expect(result).toEqual(mockSession);
      expect(prisma.workoutSession.findFirst).toHaveBeenCalledWith({
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
    });
  });

  describe('createWorkoutSession', () => {
    it('should create a new workout session with exercises', async () => {
      const userId = 'user-1';
      const exerciseIds = ['exercise-1', 'exercise-2'];

      const mockSession: MockWorkoutSession = {
        id: 'session-1',
        user_id: userId,
        started_at: new Date(),
        ended_at: null,
        note: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockWorkoutExercises = exerciseIds.map(exerciseId => ({
        id: `workout-exercise-${exerciseId}`,
        workout_session_id: mockSession.id,
        exercise_id: exerciseId,
        note: null,
        created_at: new Date(),
        updated_at: new Date()
      }));

      prisma.workoutSession.findFirst.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });

      prisma.workoutSession.create.mockResolvedValue(mockSession);
      prisma.workoutSessionExercise.create
        .mockResolvedValueOnce(mockWorkoutExercises[0])
        .mockResolvedValueOnce(mockWorkoutExercises[1]);

      const result = await workoutService.createWorkoutSession(userId, exerciseIds);
      expect(result).toEqual({
        ...mockSession,
        exercises: mockWorkoutExercises
      });
    });

    it('should throw error if user has ongoing session', async () => {
      const userId = 'user-1';
      const exerciseIds = ['exercise-1'];

      const mockOngoingSession: MockWorkoutSession = {
        id: 'ongoing-session',
        user_id: userId,
        started_at: new Date(),
        ended_at: null,
        note: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      prisma.workoutSession.findFirst.mockResolvedValue(mockOngoingSession);

      await expect(workoutService.createWorkoutSession(userId, exerciseIds))
        .rejects
        .toThrow('You have an ongoing workout session. Please finish it before starting a new one.');
    });
  });

  describe('saveExerciseSet', () => {
    const workoutSessionExerciseId = 'workout-exercise-1';
    const setData = {
      setNumber: 1,
      weight: 100,
      reps: 10,
      isCompleted: true
    };

    it('should update existing exercise set', async () => {
      const existingSet = {
        id: 'set-1',
        workout_session_exercise_id: workoutSessionExerciseId,
        set_number: setData.setNumber,
        weight: 90,
        reps: 8,
        is_completed: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      const updatedSet = {
        ...existingSet,
        weight: setData.weight,
        reps: setData.reps,
        is_completed: setData.isCompleted
      };

      prisma.exerciseSet.findFirst.mockResolvedValue(existingSet);
      prisma.exerciseSet.update.mockResolvedValue(updatedSet);

      const result = await workoutService.saveExerciseSet(workoutSessionExerciseId, setData);
      expect(result).toEqual(updatedSet);
      expect(prisma.exerciseSet.update).toHaveBeenCalledWith({
        where: { id: existingSet.id },
        data: {
          weight: setData.weight,
          reps: setData.reps,
          is_completed: setData.isCompleted,
        },
      });
    });

    it('should create new exercise set if not exists', async () => {
      const newSet = {
        id: 'set-1',
        workout_session_exercise_id: workoutSessionExerciseId,
        set_number: setData.setNumber,
        weight: setData.weight,
        reps: setData.reps,
        is_completed: setData.isCompleted,
        created_at: new Date(),
        updated_at: new Date()
      };

      prisma.exerciseSet.findFirst.mockResolvedValue(null);
      prisma.exerciseSet.create.mockResolvedValue(newSet);

      const result = await workoutService.saveExerciseSet(workoutSessionExerciseId, setData);
      expect(result).toEqual(newSet);
      expect(prisma.exerciseSet.create).toHaveBeenCalledWith({
        data: {
          workout_session_exercise_id: workoutSessionExerciseId,
          set_number: setData.setNumber,
          weight: setData.weight,
          reps: setData.reps,
          is_completed: setData.isCompleted,
        },
      });
    });
  });

  describe('finishWorkoutSession', () => {
    it('should finish workout session and update personal records', async () => {
      const userId = 'user-1';
      const workoutSessionId = 'session-1';

      const mockSession: WorkoutSessionWithExercises = {
        id: workoutSessionId,
        user_id: userId,
        started_at: new Date(),
        ended_at: null,
        note: null,
        created_at: new Date(),
        updated_at: new Date(),
        exercises: [
          {
            id: 'workout-exercise-1',
            workout_session_id: workoutSessionId,
            exercise_id: 'exercise-1',
            note: null,
            created_at: new Date(),
            updated_at: new Date(),
            exercise: {
              id: 'exercise-1',
              name: 'Bench Press',
              category_id: 'category-1',
              description: null,
              instruction: null,
              thumbnail_url: null,
              is_last_selected: false,
              created_at: new Date(),
              updated_at: new Date(),
              category: {
                id: 'category-1',
                name: 'Chest',
                display_order: 1,
                created_at: new Date(),
                updated_at: new Date()
              }
            },
            sets: [
              {
                id: 'set-1',
                workout_session_exercise_id: 'workout-exercise-1',
                set_number: 1,
                weight: 100,
                reps: 8,
                is_completed: true,
                created_at: new Date(),
                updated_at: new Date()
              }
            ]
          }
        ]
      };

      const updatedSession = {
        ...mockSession,
        ended_at: new Date()
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });

      prisma.workoutSession.findFirst.mockResolvedValue(mockSession);
      prisma.exercisePersonalRecord.findFirst.mockResolvedValue(null);
      prisma.workoutSession.update.mockResolvedValue(updatedSession);

      const result = await workoutService.finishWorkoutSession(workoutSessionId, userId);
      expect(result).toBeDefined();
      expect(result.ended_at).toBeDefined();
      expect(result.exercises).toBeDefined();
      expect(prisma.workoutSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: workoutSessionId,
            user_id: userId
          },
          data: {
            ended_at: expect.any(Date)
          }
        })
      );
    });

    it('should throw error if workout session not found', async () => {
      const userId = 'user-1';
      const workoutSessionId = 'non-existent-session';

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });

      prisma.workoutSession.findFirst.mockResolvedValue(null);

      await expect(workoutService.finishWorkoutSession(workoutSessionId, userId))
        .rejects
        .toThrow('ワークアウトセッションが見つかりません');
    });
  });
}); 
