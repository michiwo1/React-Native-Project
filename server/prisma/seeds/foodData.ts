import { PrismaClient } from '@prisma/client';

export async function seedFoodData(prisma: PrismaClient) {
  // Register food categories
  const foodCategories = [
    { name: 'Staple Foods', display_order: 1 },
    { name: 'Protein Sources', display_order: 2 },
    { name: 'Vegetables', display_order: 3 },
    { name: 'Fruits', display_order: 4 },
    { name: 'Dairy Products', display_order: 5 },
    { name: 'Seasonings & Oils', display_order: 6 },
    { name: 'Beverages', display_order: 7 },
    { name: 'Snacks & Desserts', display_order: 8 },
  ];

  for (const category of foodCategories) {
    await prisma.foodCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Register nutrient types
  const nutrientTypes = [
    { name: 'Calories', unit: 'kcal' },
    { name: 'Protein', unit: 'g' },
    { name: 'Fat', unit: 'g' },
    { name: 'Carbohydrates', unit: 'g' },
    { name: 'Dietary Fiber', unit: 'g' },
    { name: 'Sodium', unit: 'mg' },
    { name: 'Potassium', unit: 'mg' },
    { name: 'Calcium', unit: 'mg' },
    { name: 'Iron', unit: 'mg' },
    { name: 'Vitamin A', unit: 'μg' },
    { name: 'Vitamin B1', unit: 'mg' },
    { name: 'Vitamin B2', unit: 'mg' },
    { name: 'Vitamin C', unit: 'mg' },
    { name: 'Vitamin D', unit: 'μg' },
    { name: 'Vitamin E', unit: 'mg' },
  ];

  for (const nutrientType of nutrientTypes) {
    await prisma.nutrientType.upsert({
      where: { name: nutrientType.name },
      update: {},
      create: nutrientType,
    });
  }

  // Get category and NutrientType IDs
  const categories = await prisma.foodCategory.findMany();
  const nutrients = await prisma.nutrientType.findMany();

  // Register food data
  const foodItems = [
    // Staple Foods
    {
      name: 'White Rice',
      categoryName: 'Staple Foods',
      baseQuantity: 100,
      baseUnit: 'g',
      nutrients: [
        { name: 'Calories', amount: 356 },
        { name: 'Protein', amount: 6.1 },
        { name: 'Fat', amount: 0.9 },
        { name: 'Carbohydrates', amount: 77.6 },
        { name: 'Dietary Fiber', amount: 0.5 },
      ],
    },
    // ... other food items
  ];

  // Register food items
  for (const item of foodItems) {
    const category = categories.find(c => c.name === item.categoryName);
    if (!category) continue;

    const foodItem = await prisma.foodItem.upsert({
      where: {
        name_category_id: {
          name: item.name,
          category_id: category.id,
        },
      },
      update: {
        base_quantity: item.baseQuantity,
        base_unit: item.baseUnit,
      },
      create: {
        name: item.name,
        category_id: category.id,
        base_quantity: item.baseQuantity,
        base_unit: item.baseUnit,
      },
    });

    // Register nutrient data
    for (const nutrient of item.nutrients) {
      const nutrientType = nutrients.find(n => n.name === nutrient.name);
      if (!nutrientType) continue;

      await prisma.foodItemNutrient.upsert({
        where: {
          food_item_id_nutrient_type_id: {
            food_item_id: foodItem.id,
            nutrient_type_id: nutrientType.id,
          },
        },
        update: {
          amount_per_unit: nutrient.amount,
        },
        create: {
          food_item_id: foodItem.id,
          nutrient_type_id: nutrientType.id,
          amount_per_unit: nutrient.amount,
        },
      });
    }
  }

  console.log('Food data seeded successfully');
} 