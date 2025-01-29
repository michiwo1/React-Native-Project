import { ExerciseService } from '../../services/exercise.service';
import { prisma } from '../setup';
import { Prisma } from '@prisma/client';

type ExerciseWithCategory = Prisma.ExerciseGetPayload<{
  include: { category: true }
}>;

describe('ExerciseService', () => {
  let exerciseService: ExerciseService;

  beforeEach(() => {
    exerciseService = new ExerciseService();
  });

  describe('getAllExercises', () => {
    it('should return all exercises with categories', async () => {
      const mockExercises: ExerciseWithCategory[] = [
        {
          id: 'exercise-1',
          name: 'Bench Press',
          category_id: 'category-1',
          is_last_selected: false,
          created_at: new Date(),
          updated_at: new Date(),
          description: null,
          instruction: null,
          thumbnail_url: null,
          category: {
            id: 'category-1',
            name: 'Chest',
            display_order: 1,
            created_at: new Date(),
            updated_at: new Date()
          }
        }
      ];

      prisma.exercise.findMany.mockResolvedValue(mockExercises);

      const result = await exerciseService.getAllExercises();
      expect(result).toEqual(mockExercises);
      expect(prisma.exercise.findMany).toHaveBeenCalledWith({
        include: {
          category: true,
        },
      });
    });
  });

  describe('getExercisesWithRecords', () => {
    it('should return exercises with user records', async () => {
      const userId = 'user-1';
      const mockExercisesWithRecords = [
        {
          id: 'exercise-1',
          name: 'Bench Press',
          category_id: 'category-1',
          is_last_selected: false,
          created_at: new Date(),
          updated_at: new Date(),
          description: null,
          instruction: null,
          thumbnail_url: null,
          personal_records: [
            {
              weight: 100,
              reps: 10,
              recorded_at: new Date()
            }
          ]
        }
      ];

      prisma.exercise.findMany.mockResolvedValue(mockExercisesWithRecords);

      const result = await exerciseService.getExercisesWithRecords(userId);
      expect(result).toEqual(mockExercisesWithRecords);
      expect(prisma.exercise.findMany).toHaveBeenCalledWith({
        include: {
          personal_records: {
            where: {
              user_id: userId
            },
            select: {
              weight: true,
              reps: true,
              recorded_at: true
            },
            orderBy: {
              recorded_at: 'desc'
            }
          }
        },
        where: {
          personal_records: {
            some: {
              user_id: userId
            }
          }
        }
      });
    });
  });

  describe('getExercisesByCategory', () => {
    it('should return exercises for a specific category', async () => {
      const categoryId = 'category-1';
      const mockExercises: ExerciseWithCategory[] = [
        {
          id: 'exercise-1',
          name: 'Bench Press',
          category_id: categoryId,
          is_last_selected: false,
          created_at: new Date(),
          updated_at: new Date(),
          description: null,
          instruction: null,
          thumbnail_url: null,
          category: {
            id: categoryId,
            name: 'Chest',
            display_order: 1,
            created_at: new Date(),
            updated_at: new Date()
          }
        }
      ];

      prisma.exercise.findMany.mockResolvedValue(mockExercises);

      const result = await exerciseService.getExercisesByCategory(categoryId);
      expect(result).toEqual(mockExercises);
      expect(prisma.exercise.findMany).toHaveBeenCalledWith({
        where: {
          category_id: categoryId,
        },
        include: {
          category: true,
        },
      });
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories ordered by display_order', async () => {
      const mockCategories = [
        {
          id: 'category-1',
          name: 'Chest',
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'category-2',
          name: 'Back',
          display_order: 2,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      prisma.exerciseCategory.findMany.mockResolvedValue(mockCategories);

      const result = await exerciseService.getAllCategories();
      expect(result).toEqual(mockCategories);
      expect(prisma.exerciseCategory.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          display_order: true,
        },
        orderBy: {
          display_order: 'asc',
        },
      });
    });
  });

  describe('createExercise', () => {
    it('should create a new exercise', async () => {
      const mockExerciseData = {
        name: 'New Exercise',
        category_id: 'category-1'
      };

      const mockCreatedExercise: ExerciseWithCategory = {
        id: 'exercise-1',
        name: mockExerciseData.name,
        category_id: mockExerciseData.category_id,
        is_last_selected: false,
        created_at: new Date(),
        updated_at: new Date(),
        description: null,
        instruction: null,
        thumbnail_url: null,
        category: {
          id: 'category-1',
          name: 'Chest',
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      };

      prisma.exercise.create.mockResolvedValue(mockCreatedExercise);

      const result = await exerciseService.createExercise(mockExerciseData);
      expect(result).toEqual(mockCreatedExercise);
      expect(prisma.exercise.create).toHaveBeenCalledWith({
        data: mockExerciseData,
        include: {
          category: true,
        },
      });
    });
  });

  describe('setLastSelectedExercise', () => {
    it('should update last selected exercise', async () => {
      const exerciseId = 'exercise-1';
      const mockUpdatedExercise: ExerciseWithCategory = {
        id: exerciseId,
        name: 'Bench Press',
        category_id: 'category-1',
        is_last_selected: true,
        created_at: new Date(),
        updated_at: new Date(),
        description: null,
        instruction: null,
        thumbnail_url: null,
        category: {
          id: 'category-1',
          name: 'Chest',
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });

      prisma.exercise.updateMany.mockResolvedValue({ count: 1 });
      prisma.exercise.update.mockResolvedValue(mockUpdatedExercise);

      const result = await exerciseService.setLastSelectedExercise(exerciseId);
      expect(result).toEqual(mockUpdatedExercise);
      expect(prisma.exercise.updateMany).toHaveBeenCalledWith({
        where: {
          is_last_selected: true,
        },
        data: {
          is_last_selected: false,
        },
      });
      expect(prisma.exercise.update).toHaveBeenCalledWith({
        where: {
          id: exerciseId,
        },
        data: {
          is_last_selected: true,
        },
        include: {
          category: true,
        },
      });
    });
  });

  describe('getLastSelectedExercise', () => {
    it('should return the last selected exercise', async () => {
      const mockExercise: ExerciseWithCategory = {
        id: 'exercise-1',
        name: 'Bench Press',
        category_id: 'category-1',
        is_last_selected: true,
        created_at: new Date(),
        updated_at: new Date(),
        description: null,
        instruction: null,
        thumbnail_url: null,
        category: {
          id: 'category-1',
          name: 'Chest',
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      };

      prisma.exercise.findFirst.mockResolvedValue(mockExercise);

      const result = await exerciseService.getLastSelectedExercise();
      expect(result).toEqual(mockExercise);
      expect(prisma.exercise.findFirst).toHaveBeenCalledWith({
        where: {
          is_last_selected: true,
        },
        include: {
          category: true,
        },
      });
    });

    it('should return null when no exercise is selected', async () => {
      prisma.exercise.findFirst.mockResolvedValue(null);

      const result = await exerciseService.getLastSelectedExercise();
      expect(result).toBeNull();
    });
  });
}); 
