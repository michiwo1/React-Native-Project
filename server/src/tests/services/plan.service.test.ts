import { PlanService } from '../../services/plan.service';
import { prisma } from '../setup';
import { Prisma, Plan, PlanExercise, Exercise } from '@prisma/client';

type PlanWithExercises = Prisma.PlanGetPayload<{
  include: {
    exercises: {
      include: {
        exercise: true
      }
    }
  }
}>;

interface CreatePlanData {
  name: string;
  exerciseIds: string[];
  description: string | null;
}

describe('PlanService', () => {
  let planService: PlanService;

  beforeEach(() => {
    planService = new PlanService();
    jest.clearAllMocks();
  });

  describe('createPlan', () => {
    const userId = 'user-1';
    const validPlanData: CreatePlanData = {
      name: 'Full Body Workout',
      exerciseIds: ['exercise-1', 'exercise-2'],
      description: 'Test description'
    };

    it('should create a plan with exercises successfully', async () => {
      const mockPlan: Plan = {
        id: 'plan-1',
        user_id: userId,
        name: validPlanData.name,
        description: validPlanData.description,
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockExercise: Exercise = {
        id: 'exercise-1',
        name: 'Bench Press',
        category_id: 'category-1',
        description: null,
        instruction: null,
        thumbnail_url: null,
        is_last_selected: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      prisma.exercise.findUnique.mockResolvedValue(mockExercise);

      prisma.$transaction.mockImplementation(async (callback) => {
        return mockPlan;
      });

      const result = await planService.createPlan(userId, validPlanData);
      expect(result).toEqual(mockPlan);
    });

    it('should throw error when name is empty', async () => {
      const invalidPlanData = {
        ...validPlanData,
        name: ''
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        throw new Error('Plan name is required');
      });

      await expect(planService.createPlan(userId, invalidPlanData))
        .rejects
        .toThrow('Plan name is required');
    });
  });

  describe('getUserPlans', () => {
    const userId = 'user-1';

    it('should return all plans for a user with exercises', async () => {
      const mockPlans: PlanWithExercises[] = [{
        id: 'plan-1',
        user_id: userId,
        name: 'Full Body Workout',
        description: 'Test plan',
        created_at: new Date(),
        updated_at: new Date(),
        exercises: [{
          id: 'plan-exercise-1',
          plan_id: 'plan-1',
          exercise_id: 'exercise-1',
          display_order: 0,
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
            updated_at: new Date()
          }
        }]
      }];

      prisma.plan.findMany.mockResolvedValue(mockPlans);

      const result = await planService.getUserPlans(userId);

      expect(result).toEqual(mockPlans);
      expect(prisma.plan.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { display_order: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return empty array when user has no plans', async () => {
      prisma.plan.findMany.mockResolvedValue([]);

      const result = await planService.getUserPlans(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getPlanById', () => {
    const planId = 'plan-1';
    const userId = 'user-1';

    it('should return a plan by id with exercises', async () => {
      const mockPlan: PlanWithExercises = {
        id: planId,
        user_id: userId,
        name: 'Full Body Workout',
        description: 'Test plan',
        created_at: new Date(),
        updated_at: new Date(),
        exercises: [{
          id: 'plan-exercise-1',
          plan_id: planId,
          exercise_id: 'exercise-1',
          display_order: 0,
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
            updated_at: new Date()
          }
        }]
      };

      prisma.plan.findUnique.mockResolvedValue(mockPlan);

      const result = await planService.getPlanById(planId);

      expect(result).toEqual(mockPlan);
      expect(prisma.plan.findUnique).toHaveBeenCalledWith({
        where: { id: planId },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { display_order: 'asc' },
          },
        },
      });
    });

    it('should return null when plan not found', async () => {
      prisma.plan.findUnique.mockResolvedValue(null);

      const result = await planService.getPlanById(planId);

      expect(result).toBeNull();
    });

    it('should throw error when planId is invalid', async () => {
      prisma.plan.findUnique.mockImplementation(() => {
        throw new Error('Invalid plan ID');
      });

      await expect(planService.getPlanById(''))
        .rejects
        .toThrow('Invalid plan ID');
    });
  });
}); 
