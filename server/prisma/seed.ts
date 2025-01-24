import { PrismaClient } from '@prisma/client';
import { seedGoalTypes } from './seeds/goalTypes';
import { seedMealTypes } from './seeds/mealTypes';
import { seedFoodData } from './seeds/foodData';

const prisma = new PrismaClient();

async function main() {
  try {
    await seedGoalTypes(prisma);
    await seedMealTypes(prisma);
    await seedFoodData(prisma);
    
    console.log('All seed data has been successfully inserted');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 