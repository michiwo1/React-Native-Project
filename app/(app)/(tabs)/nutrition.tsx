import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
  name: string;
  value: number;
  unit: string;
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

  const nutrients: NutrientProgress[] = [
    { label: 'カロリー', current: 1800, target: 2500, color: '#007AFF' },
    { label: 'タンパク質', current: 120, target: 150, color: '#34C759' },
    { label: '炭水化物', current: 200, target: 300, color: '#FF9500' },
    { label: '脂質', current: 60, target: 80, color: '#FF3B30' },
  ];

  const fetchMeals = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meal`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMeals();
    }
  }, [token]);

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
                      width: `${(nutrient.current / nutrient.target) * 100}%`,
                      backgroundColor: nutrient.color
                    }
                  ]} 
                />
              </View>
              <Text style={styles.nutrientValue}>
                {nutrient.current}/{nutrient.target} {nutrient.label === 'カロリー' ? 'kcal' : 'g'}
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
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  aiAdviceButton: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAdviceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nutrientLabel: {
    width: 80,
    fontSize: 14,
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  nutrientValue: {
    width: 100,
    fontSize: 14,
    textAlign: 'right',
  },
  mealCard: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 14,
  },
  foodQuantity: {
    fontSize: 14,
    color: '#666',
  },
  mealNote: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 