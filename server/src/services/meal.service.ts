import { PrismaClient } from '@prisma/client';
import { CreateMealDto, CreateMealItemDto } from '../dtos/meal.dto';

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
} 