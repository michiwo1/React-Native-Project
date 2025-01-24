import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { router, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';

type UserProfile = {
  calorie_target: number;
  protein_target: number;
  carb_target: number;
  fat_target: number;
  goal_type: string; // 文字列型に変更
  weight: number;
};

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
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

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      
      // 目標タイプに基づいて栄養目標値を調整
      const adjustedProfile = {
        ...data,
        calorie_target: calculateCalorieTarget(data.weight, data.goal_type),
        protein_target: calculateProteinTarget(data.weight, data.goal_type),
        carb_target: calculateCarbTarget(data.weight, data.goal_type),
        fat_target: calculateFatTarget(data.weight, data.goal_type),
      };
      
      setUserProfile(adjustedProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // 体重と目標タイプに基づいて各栄養素の目標値を計算する関数
  const calculateCalorieTarget = (weight: number, goalType: string) => {
    const baseCalories = weight * 30; // 基礎代謝を体重×30で概算
    switch (goalType) {
      case '筋肥大':
        return Math.round(baseCalories * 1.2); // 筋肥大時は20%増
      case '減量':
        return Math.round(baseCalories * 0.8); // 減量時は20%減
      default:
        return Math.round(baseCalories); // 維持
    }
  };

  const calculateProteinTarget = (weight: number, goalType: string) => {
    switch (goalType) {
      case '筋肥大':
        return Math.round(weight * 2.2); // 筋肥大時は体重×2.2g
      case '減量':
        return Math.round(weight * 2.4); // 減量時は体重×2.4g
      default:
        return Math.round(weight * 2.0); // 維持時は体重×2.0g
    }
  };

  const calculateCarbTarget = (weight: number, goalType: string) => {
    switch (goalType) {
      case '筋肥大':
        return Math.round(weight * 6); // 筋肥大時は体重×6g
      case '減量':
        return Math.round(weight * 3); // 減量時は体重×3g
      default:
        return Math.round(weight * 4); // 維持時は体重×4g
    }
  };

  const calculateFatTarget = (weight: number, goalType: string) => {
    switch (goalType) {
      case '筋肥大':
        return Math.round(weight * 1.5); // 筋肥大時は体重×1.5g
      case '減量':
        return Math.round(weight * 1.0); // 減量時は体重×1.0g
      default:
        return Math.round(weight * 1.2); // 維持時は体重×1.2g
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchMeals();
        fetchUserProfile();
      }
    }, [token])
  );

  const nutrients: NutrientProgress[] = [
    { 
      label: 'カロリー', 
      current: totalNutrients.calories, 
      target: userProfile?.calorie_target || 2500, 
      color: '#007AFF' 
    },
    { 
      label: 'タンパク質', 
      current: totalNutrients.protein, 
      target: userProfile?.protein_target || 150, 
      color: '#34C759' 
    },
    { 
      label: '炭水化物', 
      current: totalNutrients.carbs, 
      target: userProfile?.carb_target || 300, 
      color: '#FF9500' 
    },
    { 
      label: '脂質', 
      current: totalNutrients.fat, 
      target: userProfile?.fat_target || 80, 
      color: '#FF3B30' 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>データを読み込み中...</Text>
        </View>
      ) : (
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
            {userProfile && (
              <View style={styles.goalTypeContainer}>
                <Text style={styles.goalTypeText}>
                  目標タイプ: {userProfile.goal_type}
                </Text>
                <Text style={styles.calculationText}>
                  現在の体重: {userProfile.weight}kg
                </Text>
                <Text style={styles.calculationText}>
                  {userProfile.goal_type === '減量' ? '減量モード - 基礎代謝×0.8倍' :
                   userProfile.goal_type === '筋肥大' ? '筋肥大モード - 基礎代謝×1.2倍' :
                   '維持モード - 基礎代謝を維持'}
                </Text>
              </View>
            )}
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
      )}
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
    fontWeight: '700',
    marginBottom: 24,
    color: '#000',
  },
  aiAdviceButton: {
    backgroundColor: Colors.light.tint,
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
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  nutrientRow: {
    marginBottom: 12,
  },
  nutrientLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  nutrientValue: {
    fontSize: 13,
    color: '#666',
  },
  mealCard: {
    backgroundColor: '#F8F8FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  foodName: {
    fontSize: 15,
    color: '#333',
  },
  foodQuantity: {
    fontSize: 15,
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
    marginTop: 12,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  goalTypeContainer: {
    backgroundColor: '#F8F8FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  goalTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
    marginBottom: 6,
  },
  calculationText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
}); 