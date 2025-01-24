import { PrismaClient } from '@prisma/client';

export async function seedGoalTypes(prisma: PrismaClient) {
  const goalTypes = [
    { name: '筋肥大' },
    { name: '減量' },
    { name: '維持' },
  ];

  for (const goalType of goalTypes) {
    await prisma.goalType.upsert({
      where: { name: goalType.name },
      update: {},
      create: {
        name: goalType.name,
      },
    });
  }

  console.log('Goal types seeded successfully');
} 