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
      select: {
        id: true,
        name: true,
        display_order: true,
      },
      orderBy: {
        display_order: 'asc',
      },
    });
  }

  async createExercise(data: { name: string; category_id: string }) {
    return prisma.exercise.create({
      data: {
        name: data.name,
        category_id: data.category_id,
      },
      include: {
        category: true,
      },
    });
  }
} 