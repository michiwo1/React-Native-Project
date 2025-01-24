import { View, StyleSheet, TouchableOpacity, Animated, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MetricCard } from '@/components/ui/MetricCard';
import { Colors, BaseColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';

interface Plan {
  id: string;
  name: string;
  exercises: {
    exercise: {
      name: string;
    };
  }[];
}

interface UserProfile {
  protein_target: number;
  calorie_target: number;
  weight: number;
  goal_type: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const weeklyGoalProgress = 0.75;
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { token } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [weightLoading, setWeightLoading] = useState(true);
  const [weightData, setWeightData] = useState<{
    weight: number;
    date: string;
    change: number | null;
  } | null>(null);
  const [totalNutrients, setTotalNutrients] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  
  useEffect(() => {
    if (token) {
      fetchPlans();
      fetchWeightData();
      fetchNutritionData();
      fetchUserProfile();
    }
  }, [token]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/plan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeightData = async () => {
    setWeightLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/user/weight`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch weight data');
      }
      const data = await response.json();
      setWeightData(data);
    } catch (error) {
      console.error('Error fetching weight data:', error);
    } finally {
      setWeightLoading(false);
    }
  };

  const fetchNutritionData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meal`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition data');
      }
      const data = await response.json();
      
      // 今日の食事のみをフィルタリング
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysMeals = data.filter((meal: any) => {
        const mealDate = new Date(meal.eaten_at);
        mealDate.setHours(0, 0, 0, 0);
        return mealDate.getTime() === today.getTime();
      });

      // 栄養価を計算
      const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };

      todaysMeals.forEach((meal: any) => {
        meal.items.forEach((item: any) => {
          if (!item.food_item?.nutrients) return;
          
          const ratio = item.quantity / (item.food_item.base_quantity || 1);
          
          item.food_item.nutrients.forEach((nutrient: any) => {
            if (!nutrient?.nutrient_type?.name) return;
            
            const nutrientName = nutrient.nutrient_type.name.toLowerCase();
            const nutrientValue = nutrient.amount_per_unit || 0;
            
            if (nutrientName.includes('calor') || nutrientName.includes('カロリー')) {
              totals.calories += nutrientValue * ratio;
            } else if (nutrientName.includes('protein') || nutrientName.includes('タンパク')) {
              totals.protein += nutrientValue * ratio;
            }
          });
        });
      });

      setTotalNutrients({
        ...totals,
        calories: Math.round(totals.calories * 100) / 100,
        protein: Math.round(totals.protein * 100) / 100,
      });
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setNutritionLoading(false);
    }
  };

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
      };
      
      setUserProfile(adjustedProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const dummyData = {
    benchPress: {
      current: 80,
      change: 5,
    },
    nutrition: {
      protein: 0.7,
      calories: 0.8,
      proteinTarget: 180,
      caloriesTarget: 3000,
      proteinCurrent: 126,
      caloriesCurrent: 2400,
    },
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 48,
      marginBottom: 24,
    },
    todayWorkout: {
      backgroundColor: colorScheme === 'light' ? '#F5F7FA' : '#1A1D1E',
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    workoutCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.tint,
      padding: 20,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    startButton: {
      color: colors.background,
      fontWeight: '700',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      fontSize: 15,
    },
    workoutText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    workoutInfo: {
      flex: 1,
      flexDirection: 'column',
      gap: 6,
      marginRight: 16,
    },
    exerciseCount: {
      fontSize: 14,
      color: colors.background,
      opacity: 0.9,
      fontWeight: '500',
    },
    duration: {
      color: colors.background,
      fontSize: 13,
      opacity: 0.7,
      maxWidth: '90%',
      lineHeight: 18,
    },
    progressSection: {
      marginBottom: 24,
    },
    metricsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
      minHeight: 180,
    },
    nutritionBars: {
      gap: 12,
    },
    barContainer: {
      gap: 8,
    },
    accordionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    plansContainer: {
      overflow: 'hidden',
    },
    chevron: {
      transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
    },
    progressTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    trainingCount: {
      fontSize: 12,
      color: '#687076',
    },
    nutritionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    nutritionTarget: {
      fontSize: 12,
      color: '#687076',
    },
    metricCardWrapper: {
      flex: 1,
      minHeight: 180,
    },
    plansScrollContainer: {
      maxHeight: 300,
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
  });

  const handleWeightCardPress = () => {
    router.push('/weight-input');
  };

  const handleBenchPressCardPress = () => {
    router.push('/exercises');
  };

  const handleStartPlan = async (planId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/plan/${planId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 400 && data.ongoingSession) {
          // 進行中のセッションがある場合
          Alert.alert(
            '進行中のトレーニング',
            'まだ終了していないトレーニングがあります。\n先に進行中のトレーニングを終了してください。',
            [
              {
                text: 'キャンセル',
                style: 'cancel',
              },
            ],
            { cancelable: true }
          );
          return;
        }
        throw new Error(data.message || 'Failed to start workout');
      }

      router.push('/workout/log');
    } catch (error) {
      console.error('Error starting workout:', error);
      Alert.alert(
        'エラー',
        'トレーニングの開始に失敗しました。\nもう一度お試しください。',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.greeting}>こんにちは、ユーザーさん</ThemedText>
        
        <View style={styles.todayWorkout}>
          <TouchableOpacity style={styles.accordionHeader} onPress={toggleAccordion}>
            <ThemedText style={styles.sectionTitle}>今日のトレーニング</ThemedText>
            <Ionicons 
              name="chevron-down" 
              size={24} 
              color={colors.text}
              style={styles.chevron}
            />
          </TouchableOpacity>

          <Animated.View 
            style={[
              styles.plansContainer,
              {
                maxHeight: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 300],
                }),
              },
            ]}
          >
            {loading ? (
              <ThemedText>読み込み中...</ThemedText>
            ) : plans.length > 0 ? (
              <ScrollView style={styles.plansScrollContainer}>
                {plans.map((plan) => (
                  <TouchableOpacity 
                    key={plan.id} 
                    style={styles.workoutCard}
                    onPress={() => handleStartPlan(plan.id)}
                  >
                    <View style={styles.workoutInfo}>
                      <ThemedText style={styles.workoutText}>{plan.name}</ThemedText>
                      <ThemedText style={styles.exerciseCount}>
                        {plan.exercises.length}種目
                      </ThemedText>
                      <ThemedText style={[styles.duration]} numberOfLines={1} ellipsizeMode="tail">
                        {plan.exercises.map(e => e.exercise.name).join(', ')}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.startButton}>開始</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={{
                padding: 16,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: colorScheme === 'light' ? '#F5F7FA' : '#1A1D1E',
                borderRadius: 8,
                marginBottom: 8,
              }}>
                <Ionicons 
                  name="clipboard-outline" 
                  size={32} 
                  color={colors.text}
                  style={{ marginBottom: 8 }}
                />
                <ThemedText style={{ 
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 4,
                }}>
                  プランが未設定です
                </ThemedText>
                <ThemedText style={{ 
                  fontSize: 14,
                  color: '#687076',
                  textAlign: 'center',
                  marginBottom: 8,
                }}>
                  新しいトレーニングプランを作成して{'\n'}トレーニングを始めましょう
                </ThemedText>
              </View>
            )}
          </Animated.View>

          <TouchableOpacity 
            style={{
              backgroundColor: '#007AFF',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 12,
              marginBottom: 12
            }}
            onPress={() => router.push('/workout/exercises')}
          >
            <ThemedText style={{ color: '#FFFFFF', fontWeight: '600' }}>
              今日のトレーニング始める
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              backgroundColor: colors.background,
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 12,
              borderWidth: 1,
              borderColor: colors.tint
            }}
            onPress={() => router.push('/plan/create')}
          >
            <ThemedText style={{ color: colors.tint, fontWeight: '600' }}>
              新しいプランを作成
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.progressSection}>
          <ThemedText style={styles.sectionTitle}>進捗状況</ThemedText>
          <View style={styles.metricsContainer}>
            <TouchableOpacity style={styles.metricCardWrapper} onPress={handleWeightCardPress}>
              <MetricCard
                title="体重"
                value={weightData ? `${weightData.weight}kg` : '未設定'}
                change={weightData?.change}
                changeUnit="kg"
                date={weightData ? new Date(weightData.date).toLocaleDateString('ja-JP') : undefined}
                hint="クリックで体重を入力"
                isLoading={weightLoading}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.metricCardWrapper} onPress={handleBenchPressCardPress}>
              <MetricCard
                title="ベンチプレス"
                value={`${dummyData.benchPress.current}kg`}
                change={dummyData.benchPress.change}
                changeUnit="kg"
                date={new Date().toLocaleDateString('ja-JP')}
                hint="クリックで表示を変更"
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.nutritionBars}>
            <ThemedText style={styles.sectionTitle}>栄養管理</ThemedText>
            {userProfile && (
              <View style={styles.goalTypeContainer}>
                <ThemedText style={styles.goalTypeText}>
                  目標タイプ: {userProfile.goal_type}
                </ThemedText>
                <ThemedText style={styles.calculationText}>
                  現在の体重: {userProfile.weight}kg
                </ThemedText>
                <ThemedText style={styles.calculationText}>
                  {userProfile.goal_type === '減量' ? '減量モード - 基礎代謝×0.8倍' :
                   userProfile.goal_type === '筋肥大' ? '筋肥大モード - 基礎代謝×1.2倍' :
                   '維持モード - 基礎代謝を維持'}
                </ThemedText>
              </View>
            )}
            <View style={styles.barContainer}>
              <View style={styles.nutritionHeader}>
                <ThemedText>タンパク質</ThemedText>
                <ThemedText style={styles.nutritionTarget}>
                  {nutritionLoading ? '読み込み中...' : `${Math.round(totalNutrients.protein)}g / ${userProfile?.protein_target || 150}g`}
                </ThemedText>
              </View>
              <ProgressBar progress={nutritionLoading ? 0 : Math.min(totalNutrients.protein / (userProfile?.protein_target || 150), 1)} />
            </View>
            <View style={styles.barContainer}>
              <View style={styles.nutritionHeader}>
                <ThemedText>カロリー</ThemedText>
                <ThemedText style={styles.nutritionTarget}>
                  {nutritionLoading ? '読み込み中...' : `${Math.round(totalNutrients.calories)}kcal / ${userProfile?.calorie_target || 2500}kcal`}
                </ThemedText>
              </View>
              <ProgressBar progress={nutritionLoading ? 0 : Math.min(totalNutrients.calories / (userProfile?.calorie_target || 2500), 1)} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
