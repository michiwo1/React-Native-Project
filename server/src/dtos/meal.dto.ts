export interface CreateMealItemDto {
  foodItemId: string;
  quantity: number;
  unit: string;
}

export interface CreateMealDto {
  mealTypeId: string;
  eatenAt: string;
  note?: string;
  items: CreateMealItemDto[];
}

export interface CreateManualMealDto {
  meal_type: string;
  food_category: string;
  food_name?: string;
  eaten_at: string;
  note?: string;
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
} 