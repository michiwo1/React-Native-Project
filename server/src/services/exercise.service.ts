import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExerciseService {
  async getAllExercises() {
    return prisma.exercise.findMany({
      include: {
        category: true,
      },
    });
  }

  async getExercisesByCategory(categoryId: string) {
    return prisma.exercise.findMany({
      where: {
        category_id: categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async getAllCategories() {
    return prisma.exerciseCategory.findMany({
      orderBy: {
        display_order: 'asc',
      },
    });
  }
} 