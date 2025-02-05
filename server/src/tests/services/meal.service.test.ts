import { MealService } from '../../services/meal.service';
import { prisma } from '../setup';
import { CreateMealDto, CreateManualMealDto } from '../../dtos/meal.dto';
import { Prisma } from '@prisma/client';

type MealWithRelations = Prisma.MealGetPayload<{
  include: {
    items: {
      include: {
        food_item: {
          include: {
            nutrients: {
              include: {
                nutrient_type: true
              }
            }
          }
        }
      }
    },
    meal_type: true
  }
}>;

describe('MealService', () => {
  let mealService: MealService;

  beforeEach(() => {
    mealService = new MealService();
  });

  describe('createMeal', () => {
    it('should create a meal with items', async () => {
      const userId = 'user-1';
      const createMealDto: CreateMealDto = {
        mealTypeId: 'meal-type-1',
        eatenAt: '2024-01-29T12:00:00Z',
        note: 'Test meal',
        items: [
          {
            foodItemId: 'food-1',
            quantity: 1,
            unit: 'serving'
          }
        ]
      };

      const mockCreatedMeal: MealWithRelations = {
        id: 'meal-1',
        user_id: userId,
        meal_type_id: createMealDto.mealTypeId,
        eaten_at: new Date(createMealDto.eatenAt),
        note: createMealDto.note || null,
        created_at: new Date(),
        updated_at: new Date(),
        items: [
          {
            id: 'meal-item-1',
            meal_id: 'meal-1',
            food_item_id: 'food-1',
            quantity: 1,
            unit: 'serving',
            created_at: new Date(),
            updated_at: new Date(),
            food_item: {
              id: 'food-1',
              name: 'Test Food',
              base_quantity: 1,
              base_unit: 'serving',
              category_id: 'category-1',
              created_at: new Date(),
              updated_at: new Date(),
              nutrients: [
                {
                  id: 'nutrient-1',
                  food_item_id: 'food-1',
                  nutrient_type_id: 'nutrient-type-1',
                  amount_per_unit: 100,
                  created_at: new Date(),
                  updated_at: new Date(),
                  nutrient_type: {
                    id: 'nutrient-type-1',
                    name: 'カロリー',
                    unit: 'kcal',
                    created_at: new Date(),
                    updated_at: new Date()
                  }
                }
              ]
            }
          }
        ],
        meal_type: {
          id: 'meal-type-1',
          name: '朝食',
          created_at: new Date(),
          updated_at: new Date()
        }
      };

      prisma.meal.create.mockResolvedValue(mockCreatedMeal);

      const result = await mealService.createMeal(userId, createMealDto);
      expect(result).toEqual(mockCreatedMeal);
      expect(prisma.meal.create).toHaveBeenCalledWith({
        data: {
          user_id: userId,
          meal_type_id: createMealDto.mealTypeId,
          eaten_at: new Date(createMealDto.eatenAt),
          note: createMealDto.note || null,
          items: {
            create: createMealDto.items.map(item => ({
              food_item_id: item.foodItemId,
              quantity: item.quantity,
              unit: item.unit,
            })),
          },
        },
        include: {
          items: {
            include: {
              food_item: {
                include: {
                  nutrients: {
                    include: {
                      nutrient_type: true,
                    },
                  },
                },
              },
            },
          },
          meal_type: true,
        },
      });
    });
  });

  describe('getMealsByUserId', () => {
    it('should return meals for a user within date range', async () => {
      const userId = 'user-1';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const mockMeals: MealWithRelations[] = [
        {
          id: 'meal-1',
          user_id: userId,
          meal_type_id: 'meal-type-1',
          eaten_at: new Date('2024-01-15'),
          note: null,
          created_at: new Date(),
          updated_at: new Date(),
          items: [],
          meal_type: {
            id: 'meal-type-1',
            name: '朝食',
            created_at: new Date(),
            updated_at: new Date()
          }
        }
      ];

      prisma.meal.findMany.mockResolvedValue(mockMeals);

      const result = await mealService.getMealsByUserId(userId, startDate, endDate);
      expect(result).toEqual(mockMeals);
      expect(prisma.meal.findMany).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          eaten_at: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          items: {
            include: {
              food_item: {
                include: {
                  nutrients: {
                    include: {
                      nutrient_type: true,
                    },
                  },
                },
              },
            },
          },
          meal_type: true,
        },
        orderBy: {
          eaten_at: 'desc',
        },
      });
    });
  });

  describe('getFoodCategories', () => {
    it('should return all food categories with items', async () => {
      const mockCategories = [
        {
          id: 'category-1',
          name: '主食',
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date(),
          food_items: [
            {
              id: 'food-1',
              name: 'ご飯',
              base_quantity: 1,
              base_unit: 'serving',
              category_id: 'category-1',
              created_at: new Date(),
              updated_at: new Date()
            }
          ]
        }
      ];

      prisma.foodCategory.findMany.mockResolvedValue(mockCategories);

      const result = await mealService.getFoodCategories();
      expect(result).toEqual(mockCategories);
      expect(prisma.foodCategory.findMany).toHaveBeenCalledWith({
        include: {
          food_items: true,
        },
      });
    });
  });

  describe('getFoodItems', () => {
    it('should return food items for a category', async () => {
      const categoryId = 'category-1';
      const mockFoodItems = [
        {
          id: 'food-1',
          name: 'ご飯',
          base_quantity: 1,
          base_unit: 'serving',
          category_id: categoryId,
          created_at: new Date(),
          updated_at: new Date(),
          category: {
            id: categoryId,
            name: '主食',
            display_order: 1,
            created_at: new Date(),
            updated_at: new Date()
          },
          nutrients: [
            {
              id: 'nutrient-1',
              food_item_id: 'food-1',
              nutrient_type_id: 'nutrient-type-1',
              amount_per_unit: 100,
              created_at: new Date(),
              updated_at: new Date(),
              nutrient_type: {
                id: 'nutrient-type-1',
                name: 'カロリー',
                unit: 'kcal',
                created_at: new Date(),
                updated_at: new Date()
              }
            }
          ]
        }
      ];

      prisma.foodItem.findMany.mockResolvedValue(mockFoodItems);

      const result = await mealService.getFoodItems(categoryId);
      expect(result).toEqual(mockFoodItems);
      expect(prisma.foodItem.findMany).toHaveBeenCalledWith({
        where: { category_id: categoryId },
        include: {
          category: true,
          nutrients: {
            include: {
              nutrient_type: true,
            },
          },
        },
      });
    });
  });

  describe('getMealTypes', () => {
    it('should return all meal types', async () => {
      const mockMealTypes = [
        {
          id: 'meal-type-1',
          name: '朝食',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      prisma.mealType.findMany.mockResolvedValue(mockMealTypes);

      const result = await mealService.getMealTypes();
      expect(result).toEqual(mockMealTypes);
      expect(prisma.mealType.findMany).toHaveBeenCalled();
    });
  });

  describe('createManualMeal', () => {
    const userId = 'user-1';
    let createManualMealDto: CreateManualMealDto;
    let mockMealType: any;
    let mockFoodCategory: any;
    let mockNutrientTypes: any[];
    let mockCreatedFoodItem: any;
    let mockCreatedMeal: MealWithRelations;

    beforeEach(() => {
      createManualMealDto = {
        meal_type: 'Breakfast',
        food_category: 'Staple Foods',
        food_name: 'Manual Input',
        eaten_at: '2024-01-29T12:00:00Z',
        note: 'Test manual meal',
        nutrients: {
          calories: 100,
          protein: 20,
          carbs: 30,
          fat: 10
        }
      };

      mockMealType = {
        id: 'meal-type-1',
        name: 'Breakfast',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockFoodCategory = {
        id: 'category-1',
        name: 'Staple Foods',
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockNutrientTypes = [
        { id: 'nt-1', name: 'Calories', unit: 'kcal', created_at: new Date(), updated_at: new Date() },
        { id: 'nt-2', name: 'Protein', unit: 'g', created_at: new Date(), updated_at: new Date() },
        { id: 'nt-3', name: 'Carbohydrates', unit: 'g', created_at: new Date(), updated_at: new Date() },
        { id: 'nt-4', name: 'Fat', unit: 'g', created_at: new Date(), updated_at: new Date() }
      ];

      mockCreatedFoodItem = {
        id: 'food-1',
        name: createManualMealDto.food_name,
        base_quantity: 1,
        base_unit: 'serving',
        category_id: mockFoodCategory.id,
        created_at: new Date(),
        updated_at: new Date(),
        nutrients: mockNutrientTypes.map((nt, index) => ({
          id: `n-${index + 1}`,
          food_item_id: 'food-1',
          nutrient_type_id: nt.id,
          amount_per_unit: Object.values(createManualMealDto.nutrients)[index],
          created_at: new Date(),
          updated_at: new Date(),
          nutrient_type: nt
        }))
      };

      mockCreatedMeal = {
        id: 'meal-1',
        user_id: userId,
        meal_type_id: mockMealType.id,
        eaten_at: new Date(createManualMealDto.eaten_at),
        note: createManualMealDto.note || null,
        created_at: new Date(),
        updated_at: new Date(),
        items: [
          {
            id: 'meal-item-1',
            meal_id: 'meal-1',
            food_item_id: mockCreatedFoodItem.id,
            quantity: 1,
            unit: 'serving',
            created_at: new Date(),
            updated_at: new Date(),
            food_item: mockCreatedFoodItem
          }
        ],
        meal_type: mockMealType
      };

      // モックの設定
      prisma.mealType.findFirst.mockResolvedValue(mockMealType);
      prisma.foodCategory.findFirst.mockResolvedValue(mockFoodCategory);
      prisma.nutrientType.findMany.mockResolvedValue(mockNutrientTypes);
      prisma.foodItem.create.mockResolvedValue(mockCreatedFoodItem);
      prisma.meal.create.mockResolvedValue(mockCreatedMeal);
    });

    it('should create a manual meal entry successfully', async () => {
      const result = await mealService.createManualMeal(userId, createManualMealDto);

      expect(result).toEqual(mockCreatedMeal);

      expect(prisma.mealType.findFirst).toHaveBeenCalledWith({
        where: { name: createManualMealDto.meal_type }
      });

      expect(prisma.foodCategory.findFirst).toHaveBeenCalledWith({
        where: { name: createManualMealDto.food_category }
      });

      expect(prisma.nutrientType.findMany).toHaveBeenCalledWith({
        where: { name: { in: ['Calories', 'Protein', 'Carbohydrates', 'Fat'] } }
      });
    });

    it('should throw error when meal type is invalid', async () => {
      const invalidDto = {
        ...createManualMealDto,
        meal_type: 'Invalid Meal Type'
      };

      // このテストケースでは特別にモックをnullに設定
      prisma.mealType.findFirst.mockResolvedValue(null);

      await expect(mealService.createManualMeal(userId, invalidDto))
        .rejects
        .toThrow('Invalid meal type: Invalid Meal Type');
    });

    it('should throw error when food category is invalid', async () => {
      const invalidDto = {
        ...createManualMealDto,
        food_category: 'Invalid Category'
      };

      await expect(mealService.createManualMeal(userId, invalidDto))
        .rejects
        .toThrow('Invalid food category: Invalid Category');
    });
  });
}); 
