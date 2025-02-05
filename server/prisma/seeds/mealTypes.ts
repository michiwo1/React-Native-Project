import { PrismaClient } from '@prisma/client';

export async function seedMealTypes(prisma: PrismaClient) {
  const mealTypes = [
    { name: 'Breakfast' },
    { name: 'Lunch' },
    { name: 'Dinner' },
    { name: 'Snack' },
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