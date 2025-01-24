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
    
    // Exercise Categories
    const categories = [
      { id: 'cat_leg', name: 'Leg', display_order: 1 },
      { id: 'cat_chest', name: 'Chest', display_order: 2 },
      { id: 'cat_back', name: 'Back', display_order: 3 },
      { id: 'cat_shoulder', name: 'Shoulder', display_order: 4 },
      { id: 'cat_arms', name: 'Arms', display_order: 5 },
      { id: 'cat_core', name: 'Core', display_order: 6 },
    ];

    for (const category of categories) {
      await prisma.exerciseCategory.upsert({
        where: { id: category.id },
        update: {},
        create: {
          id: category.id,
          name: category.name,
          display_order: category.display_order,
        },
      });
    }

    // Exercises
    const exercises = [
      {
        id: 'ex_back_squat',
        category_id: 'cat_leg',
        name: 'Back Squat',
        description: 'A compound exercise that primarily targets the quadriceps, hamstrings, and glutes.',
      },
      {
        id: 'ex_deadlift',
        category_id: 'cat_leg',
        name: 'Conventional Deadlift',
        description: 'A compound exercise that targets the posterior chain, including the back, glutes, and hamstrings.',
      },
      {
        id: 'ex_front_squat',
        category_id: 'cat_leg',
        name: 'Front Squat',
        description: 'A squat variation that emphasizes the quadriceps and core stability.',
      },
      {
        id: 'ex_leg_press',
        category_id: 'cat_leg',
        name: 'Leg Press',
        description: 'A machine exercise that targets the quadriceps, hamstrings, and glutes.',
      },
      {
        id: 'ex_leg_curl',
        category_id: 'cat_leg',
        name: 'Leg Curl',
        description: 'An isolation exercise that targets the hamstrings.',
      },
      {
        id: 'ex_leg_extension',
        category_id: 'cat_leg',
        name: 'Leg Extension',
        description: 'An isolation exercise that targets the quadriceps.',
      },
      {
        id: 'ex_lunge',
        category_id: 'cat_leg',
        name: 'Dumbbell Lunge',
        description: 'A unilateral exercise that targets the legs and improves balance.',
      },
      {
        id: 'ex_sumo_deadlift',
        category_id: 'cat_leg',
        name: 'Sumo Deadlift',
        description: 'A deadlift variation that emphasizes the inner thighs and quadriceps.',
      },
      {
        id: 'ex_calf_raise',
        category_id: 'cat_leg',
        name: 'Standing Calf Raise',
        description: 'An isolation exercise that targets the calves.',
      },
      {
        id: 'ex_bench_press',
        category_id: 'cat_chest',
        name: 'Bench Press',
        description: 'A compound exercise that primarily targets the chest, shoulders, and triceps.',
      },
      {
        id: 'ex_incline_press',
        category_id: 'cat_chest',
        name: 'Incline Press',
        description: 'A bench press variation that emphasizes the upper chest.',
      },
      {
        id: 'ex_dips',
        category_id: 'cat_chest',
        name: 'Chest Dips',
        description: 'A bodyweight exercise that targets the chest, shoulders, and triceps.',
      },
      {
        id: 'ex_pullup',
        category_id: 'cat_back',
        name: 'Pull-up',
        description: 'A compound bodyweight exercise that targets the back and biceps.',
      },
      {
        id: 'ex_row',
        category_id: 'cat_back',
        name: 'Barbell Row',
        description: 'A compound exercise that targets the back and biceps.',
      },
      {
        id: 'ex_lat_pulldown',
        category_id: 'cat_back',
        name: 'Lat Pulldown',
        description: 'A machine exercise that mimics the pull-up movement.',
      },
      {
        id: 'ex_overhead_press',
        category_id: 'cat_shoulder',
        name: 'Overhead Press',
        description: 'A compound exercise that targets the shoulders and triceps.',
      },
      {
        id: 'ex_lateral_raise',
        category_id: 'cat_shoulder',
        name: 'Lateral Raise',
        description: 'An isolation exercise that targets the lateral deltoids.',
      },
      {
        id: 'ex_bicep_curl',
        category_id: 'cat_arms',
        name: 'Bicep Curl',
        description: 'An isolation exercise that targets the biceps.',
      },
      {
        id: 'ex_tricep_extension',
        category_id: 'cat_arms',
        name: 'Tricep Extension',
        description: 'An isolation exercise that targets the triceps.',
      },
      {
        id: 'ex_plank',
        category_id: 'cat_core',
        name: 'Plank',
        description: 'An isometric exercise that targets the core muscles.',
      },
      {
        id: 'ex_crunch',
        category_id: 'cat_core',
        name: 'Crunch',
        description: 'An isolation exercise that targets the abdominal muscles.',
      },
    ];

    for (const exercise of exercises) {
      await prisma.exercise.upsert({
        where: { id: exercise.id },
        update: {},
        create: {
          id: exercise.id,
          category_id: exercise.category_id,
          name: exercise.name,
          description: exercise.description,
        },
      });
    }

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