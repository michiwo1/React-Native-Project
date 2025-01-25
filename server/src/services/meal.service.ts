import { PrismaClient } from '@prisma/client';
import { CreateMealDto, CreateMealItemDto, CreateManualMealDto } from '../dtos/meal.dto';

const prisma = new PrismaClient();

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
      console.log('Received meal type:', createManualMealDto.meal_type);
      console.log('Received food category:', createManualMealDto.food_category);

      // 食事タイプのIDを取得
      const mealType = await prisma.mealType.findFirst({
        where: {
          name: createManualMealDto.meal_type,
        },
      });
      console.log('Found meal type:', mealType);

      if (!mealType) {
        throw new Error(`Invalid meal type: ${createManualMealDto.meal_type}`);
      }

      // 食品カテゴリーのIDを取得
      const foodCategory = await prisma.foodCategory.findFirst({
        where: {
          name: createManualMealDto.food_category,
        },
      });
      console.log('Found food category:', foodCategory);

      if (!foodCategory) {
        throw new Error(`Invalid food category: ${createManualMealDto.food_category}`);
      }

      // 栄養素タイプのIDを取得
      const nutrientTypes = await prisma.nutrientType.findMany({
        where: {
          name: {
            in: ['カロリー', 'タンパク質', '炭水化物', '脂質']
          }
        }
      });
      console.log('Found nutrient types:', nutrientTypes);

      const getNutrientTypeId = (name: string) => {
        const nutrientType = nutrientTypes.find(nt => nt.name === name);
        if (!nutrientType) {
          throw new Error(`Nutrient type not found: ${name}`);
        }
        return nutrientType.id;
      };

      // 日付の検証
      const eatenAt = new Date(createManualMealDto.eaten_at);
      if (isNaN(eatenAt.getTime())) {
        throw new Error('Invalid date format');
      }

      // 手動入力用の食品アイテムを作成
      const manualFoodItem = await prisma.foodItem.create({
        data: {
          name: createManualMealDto.food_name || '手動入力',
          base_quantity: 1,
          base_unit: 'serving',
          category_id: foodCategory.id,
          nutrients: {
            create: [
              {
                amount_per_unit: createManualMealDto.nutrients.calories,
                nutrient_type_id: getNutrientTypeId('カロリー'),
              },
              {
                amount_per_unit: createManualMealDto.nutrients.protein,
                nutrient_type_id: getNutrientTypeId('タンパク質'),
              },
              {
                amount_per_unit: createManualMealDto.nutrients.carbs,
                nutrient_type_id: getNutrientTypeId('炭水化物'),
              },
              {
                amount_per_unit: createManualMealDto.nutrients.fat,
                nutrient_type_id: getNutrientTypeId('脂質'),
              },
            ],
          },
        },
      });

      // 食事を作成
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
      console.error('Error in createManualMeal:', error);
      throw error;
    }
  }
} 