import { PrismaClient } from '@prisma/client';

export async function seedMealTypes(prisma: PrismaClient) {
  const mealTypes = [
    { name: '朝食' },
    { name: '昼食' },
    { name: '夕食' },
    { name: '間食' },
  ];

  for (const mealType of mealTypes) {
    await prisma.mealType.upsert({
      where: { name: mealType.name },
      update: {},
      create: mealType,
    });
  }

  console.log('Meal types seeded successfully');
} 