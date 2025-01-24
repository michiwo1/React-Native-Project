import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { router, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';

type NutrientProgress = {
  current: number;
  target: number;
  label: string;
  color: string;
};

type Nutrient = {
  id: string;
  amount_per_unit: number;
  nutrient_type: {
    id: string;
    name: string;
    unit: string;
  };
};

type FoodItem = {
  id: string;
  name: string;
  base_quantity: number;
  base_unit: string;
  nutrients: Nutrient[];
};

type MealItem = {
  id: string;
  food_item: FoodItem;
  quantity: number;
  unit: string;
};

type MealType = {
  id: string;
  name: string;
};

type Meal = {
  id: string;
  meal_type: MealType;
  eaten_at: string;
  note: string;
  items: MealItem[];
};

export default function NutritionScreen() {
  const { token } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalNutrients, setTotalNutrients] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const calculateTotalNutrients = (meals: Meal[]) => {
    console.log('Calculating nutrients for meals:', meals);
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    meals.forEach((meal) => {
      meal.items.forEach((item) => {
        if (!item.food_item?.nutrients) {
          console.log('No nutrients found for item:', item);
          return;
        }
        
        const ratio = item.quantity / (item.food_item.base_quantity || 1);
        console.log('Processing item:', item.food_item.name, 'with ratio:', ratio);
        
        item.food_item.nutrients.forEach((nutrient) => {
          if (!nutrient?.nutrient_type?.name) {
            console.log('Invalid nutrient:', nutrient);
            return;
          }
          
          const nutrientName = nutrient.nutrient_type.name.toLowerCase();
          const nutrientValue = nutrient.amount_per_unit || 0;
          console.log('Processing nutrient:', nutrientName, 'with value:', nutrientValue);
          
          if (nutrientName.includes('calor') || nutrientName.includes('カロリー')) {
            totals.calories += nutrientValue * ratio;
          } else if (nutrientName.includes('protein') || nutrientName.includes('タンパク')) {
            totals.protein += nutrientValue * ratio;
          } else if (nutrientName.includes('carb') || nutrientName.includes('炭水')) {
            totals.carbs += nutrientValue * ratio;
          } else if (nutrientName.includes('fat') || nutrientName.includes('脂')) {
            totals.fat += nutrientValue * ratio;
          }
        });
      });
    });

    console.log('Final totals:', totals);
    return {
      calories: Math.round(totals.calories * 100) / 100,
      protein: Math.round(totals.protein * 100) / 100,
      carbs: Math.round(totals.carbs * 100) / 100,
      fat: Math.round(totals.fat * 100) / 100,
    };
  };

  const fetchMeals = async () => {
    try {
      console.log('Fetching meals with token:', token);
      const response = await fetch(`${API_URL}/api/meal`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }
      const data = await response.json();
      console.log('Received meals data:', data);
      
      // 今日の食事のみをフィルタリング
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysMeals = data.filter((meal: Meal) => {
        const mealDate = new Date(meal.eaten_at);
        mealDate.setHours(0, 0, 0, 0);
        return mealDate.getTime() === today.getTime();
      });
      
      console.log('Today\'s meals:', todaysMeals);
      setMeals(todaysMeals);
      const calculatedNutrients = calculateTotalNutrients(todaysMeals);
      console.log('Setting total nutrients:', calculatedNutrients);
      setTotalNutrients(calculatedNutrients);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const nutrients: NutrientProgress[] = [
    { label: 'カロリー', current: totalNutrients.calories, target: 2500, color: '#007AFF' },
    { label: 'タンパク質', current: totalNutrients.protein, target: 150, color: '#34C759' },
    { label: '炭水化物', current: totalNutrients.carbs, target: 300, color: '#FF9500' },
    { label: '脂質', current: totalNutrients.fat, target: 80, color: '#FF3B30' },
  ];

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchMeals();
      }
    }, [token])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>栄養管理</Text>
        
        <TouchableOpacity 
          style={styles.aiAdviceButton}
          onPress={() => router.push('/nutrition/ai-advice')}
        >
          <Text style={styles.aiAdviceButtonText}>AIに食事アドバイスを相談する</Text>
        </TouchableOpacity>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日の摂取状況</Text>
          {nutrients.map((nutrient, index) => (
            <View key={index} style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>{nutrient.label}</Text>
              <View style={styles.progressContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${Math.min((nutrient.current / nutrient.target) * 100, 100)}%`,
                      backgroundColor: nutrient.color
                    }
                  ]} 
                />
              </View>
              <Text style={[
                styles.nutrientValue,
                nutrient.current > nutrient.target && { color: '#FF3B30' }
              ]}>
                {nutrient.current.toLocaleString()}/{nutrient.target.toLocaleString()} {nutrient.label === 'カロリー' ? 'kcal' : 'g'}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>食事記録</Text>
          {meals.map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>{meal.meal_type.name}</Text>
                <Text style={styles.mealTime}>
                  {new Date(meal.eaten_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {meal.items.map((item) => (
                <View key={item.id} style={styles.foodItem}>
                  <Text style={styles.foodName}>{item.food_item.name}</Text>
                  <Text style={styles.foodQuantity}>{item.quantity}{item.unit}</Text>
                </View>
              ))}
              {meal.note && <Text style={styles.mealNote}>{meal.note}</Text>}
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/nutrition/record-meal')}
        >
          <Text style={styles.addButtonText}>食事を記録</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#000',
  },
  aiAdviceButton: {
    backgroundColor: Colors.light.tint,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAdviceButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#000',
  },
  nutrientRow: {
    marginBottom: 16,
  },
  nutrientLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  progressContainer: {
    height: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  nutrientValue: {
    fontSize: 14,
    color: '#666',
  },
  mealCard: {
    backgroundColor: '#F8F8FA',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  mealTime: {
    fontSize: 16,
    color: '#666',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    color: '#333',
  },
  foodQuantity: {
    fontSize: 16,
    color: '#666',
  },
  mealNote: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 