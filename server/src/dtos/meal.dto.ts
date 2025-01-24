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