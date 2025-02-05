import { PrismaClient } from '@prisma/client';
import { CreateMealDto, CreateMealItemDto, CreateManualMealDto } from '../dtos/meal.dto';

const prisma = new PrismaClient();

// Update meal type definition
const VALID_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const VALID_FOOD_CATEGORIES = [
  'Staple Foods',
  'Protein Sources',
  'Vegetables',
  'Fruits',
  'Dairy Products',
  'Seasonings & Oils',
  'Beverages',
  'Snacks & Desserts'
];

export class MealService {
  async createMeal(userId: string, createMealDto: CreateMealDto) {
    const meal = await prisma.meal.create({
      data: {
        user_id: userId,
        meal_type_id: createMealDto.mealTypeId,
        eaten_at: new Date(createMealDto.eatenAt),
        note: createMealDto.note,
        items: {
          create: createMealDto.items.map((item: CreateMealItemDto) => ({
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
    return meal;
  }

  async getMealsByUserId(userId: string, startDate?: string, endDate?: string) {
    const where: any = {
      user_id: userId,
    };

    if (startDate && endDate) {
      where.eaten_at = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return prisma.meal.findMany({
      where,
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
  }

  async getFoodCategories() {
    return prisma.foodCategory.findMany({
      include: {
        food_items: true,
      },
    });
  }

  async getFoodItems(categoryId?: string) {
    const where = categoryId ? { category_id: categoryId } : {};
    return prisma.foodItem.findMany({
      where,
      include: {
        category: true,
        nutrients: {
          include: {
            nutrient_type: true,
          },
        },
      },
    });
  }

  async getMealTypes() {
    return prisma.mealType.findMany();
  }

  async createManualMeal(userId: string, createManualMealDto: CreateManualMealDto) {
    try {
      // Validate meal type
      if (!VALID_MEAL_TYPES.includes(createManualMealDto.meal_type)) {
        throw new Error(`Invalid meal type: ${createManualMealDto.meal_type}`);
      }

      // Validate food category
      if (!VALID_FOOD_CATEGORIES.includes(createManualMealDto.food_category)) {
        throw new Error(`Invalid food category: ${createManualMealDto.food_category}`);
      }

      // Get meal type ID
      const mealType = await prisma.mealType.findFirst({
        where: {
          name: createManualMealDto.meal_type,
        },
      });

      if (!mealType) {
        throw new Error(`Meal type not found in database: ${createManualMealDto.meal_type}`);
      }

      // Get food category ID
      const foodCategory = await prisma.foodCategory.findFirst({
        where: {
          name: createManualMealDto.food_category,
        },
      });

      if (!foodCategory) {
        throw new Error(`Food category not found in database: ${createManualMealDto.food_category}`);
      }

      // Get nutrient type IDs
      const nutrientTypes = await prisma.nutrientType.findMany({
        where: {
          name: {
            in: ['Calories', 'Protein', 'Carbohydrates', 'Fat']
          }
        }
      });

      const getNutrientTypeId = (name: string) => {
        const nutrientType = nutrientTypes.find(nt => nt.name === name);
        if (!nutrientType) {
          throw new Error(`Nutrient type not found: ${name}`);
        }
        return nutrientType.id;
      };

      // Validate date
      const eatenAt = new Date(createManualMealDto.eaten_at);
      if (isNaN(eatenAt.getTime())) {
        throw new Error('Invalid date format');
      }

      // Create food item for manual entry
      const manualFoodItem = await prisma.foodItem.create({
        data: {
          name: createManualMealDto.food_name || 'Manual Entry',
          base_quantity: 1,
          base_unit: 'serving',
          category_id: foodCategory.id,
          nutrients: {
            create: [
              {
                amount_per_unit: createManualMealDto.nutrients.calories,
                nutrient_type_id: getNutrientTypeId('Calories'),
              },
              {
                amount_per_unit: createManualMealDto.nutrients.protein,
                nutrient_type_id: getNutrientTypeId('Protein'),
              },
              {
                amount_per_unit: createManualMealDto.nutrients.carbs,
                nutrient_type_id: getNutrientTypeId('Carbohydrates'),
              },
              {
                amount_per_unit: createManualMealDto.nutrients.fat,
                nutrient_type_id: getNutrientTypeId('Fat'),
              },
            ],
          },
        },
      });

      const meal = await prisma.meal.create({
        data: {
          user_id: userId,
          meal_type_id: mealType.id,
          eaten_at: eatenAt,
          note: createManualMealDto.note,
          items: {
            create: [
              {
                food_item_id: manualFoodItem.id,
                quantity: 1,
                unit: 'serving',
              },
            ],
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

      return meal;
    } catch (error) {
      throw error;
    }
  }
} 