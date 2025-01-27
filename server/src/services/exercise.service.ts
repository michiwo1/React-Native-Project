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

  async getExercisesWithRecords(userId: string) {
    return await prisma.exercise.findMany({
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

  async setLastSelectedExercise(exerciseId: string) {
    // トランザクションを使用して、すべての更新を一度に行う
    return prisma.$transaction(async (tx) => {
      // 現在選択されている種目のis_last_selectedをfalseに設定
      await tx.exercise.updateMany({
        where: {
          is_last_selected: true,
        },
        data: {
          is_last_selected: false,
        },
      });

      // 指定された種目のis_last_selectedをtrueに設定
      return tx.exercise.update({
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
  }

  async getLastSelectedExercise() {
    return prisma.exercise.findFirst({
      where: {
        is_last_selected: true,
      },
      include: {
        category: true,
      },
    });
  }
} 