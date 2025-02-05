import { PrismaClient } from '@prisma/client';

export async function seedGoalTypes(prisma: PrismaClient) {
  const goalTypes = [
    { name: 'Muscle Gain' },
    { name: 'Weight Loss' },
    { name: 'Maintenance' },
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