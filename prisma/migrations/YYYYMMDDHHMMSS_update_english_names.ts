-- AlterTable
ALTER TABLE "meal_type" ADD COLUMN "name_en" TEXT;
UPDATE "meal_type" SET 
  name_en = 'Breakfast' WHERE name = '朝食',
  name_en = 'Lunch' WHERE name = '昼食',
  name_en = 'Dinner' WHERE name = '夕食',
  name_en = 'Snack' WHERE name = '間食';

-- AlterTable
ALTER TABLE "food_category" ADD COLUMN "name_en" TEXT;
UPDATE "food_category" SET 
  name_en = 'Staple Food' WHERE name = '主食',
  name_en = 'Protein Source' WHERE name = 'タンパク源',
  name_en = 'Vegetables' WHERE name = '野菜',
  name_en = 'Fruits' WHERE name = '果物',
  name_en = 'Dairy Products' WHERE name = '乳製品',
  name_en = 'Seasonings & Oils' WHERE name = '調味料・油',
  name_en = 'Beverages' WHERE name = '飲み物',
  name_en = 'Snacks & Desserts' WHERE name = 'お菓子・デザート';

-- AlterTable
ALTER TABLE "nutrient_type" ADD COLUMN "name_en" TEXT;
UPDATE "nutrient_type" SET 
  name_en = 'calories' WHERE name = 'カロリー',
  name_en = 'protein' WHERE name = 'タンパク質',
  name_en = 'carbs' WHERE name = '炭水化物',
  name_en = 'fat' WHERE name = '脂質'; 