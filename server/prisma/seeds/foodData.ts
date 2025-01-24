import { PrismaClient } from '@prisma/client';

export async function seedFoodData(prisma: PrismaClient) {
  // 食品カテゴリーの登録
  const foodCategories = [
    { name: '主食', display_order: 1 },
    { name: 'タンパク源', display_order: 2 },
    { name: '野菜', display_order: 3 },
    { name: '果物', display_order: 4 },
    { name: '乳製品', display_order: 5 },
    { name: '調味料・油', display_order: 6 },
    { name: '飲み物', display_order: 7 },
    { name: 'お菓子・デザート', display_order: 8 },
  ];

  for (const category of foodCategories) {
    await prisma.foodCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // 栄養素タイプの登録
  const nutrientTypes = [
    { name: 'カロリー', unit: 'kcal' },
    { name: 'タンパク質', unit: 'g' },
    { name: '脂質', unit: 'g' },
    { name: '炭水化物', unit: 'g' },
    { name: '食物繊維', unit: 'g' },
    { name: 'ナトリウム', unit: 'mg' },
    { name: 'カリウム', unit: 'mg' },
    { name: 'カルシウム', unit: 'mg' },
    { name: '鉄分', unit: 'mg' },
    { name: 'ビタミンA', unit: 'μg' },
    { name: 'ビタミンB1', unit: 'mg' },
    { name: 'ビタミンB2', unit: 'mg' },
    { name: 'ビタミンC', unit: 'mg' },
    { name: 'ビタミンD', unit: 'μg' },
    { name: 'ビタミンE', unit: 'mg' },
  ];

  for (const nutrientType of nutrientTypes) {
    await prisma.nutrientType.upsert({
      where: { name: nutrientType.name },
      update: {},
      create: nutrientType,
    });
  }

  // カテゴリーとNutrientTypeのIDを取得
  const categories = await prisma.foodCategory.findMany();
  const nutrients = await prisma.nutrientType.findMany();

  // 食品データの登録
  const foodItems = [
    // 主食
    {
      name: '白米',
      categoryName: '主食',
      baseQuantity: 100,
      baseUnit: 'g',
      nutrients: [
        { name: 'カロリー', amount: 356 },
        { name: 'タンパク質', amount: 6.1 },
        { name: '脂質', amount: 0.9 },
        { name: '炭水化物', amount: 77.6 },
        { name: '食物繊維', amount: 0.5 },
      ],
    },
    // ... その他の食品データ
  ];

  // 食品データを登録
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

    // 栄養素データを登録
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