import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MetricCard } from '@/components/ui/MetricCard';
import { Colors, BaseColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const weeklyGoalProgress = 0.75;
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const trainingPlans = [
    { id: 1, name: '胸部 + 三頭筋', duration: '60分' },
    { id: 2, name: '背中 + 二頭筋', duration: '45分' },
    { id: 3, name: '脚 + 肩', duration: '50分' },
  ];

  const dummyData = {
    weight: {
      current: 75.5,
      change: -2.0,
    },
    benchPress: {
      current: 80,
      change: 5,
    },
    nutrition: {
      protein: 0.7,
      calories: 0.8,
      proteinTarget: 180, // 体重 x 2.4g
      caloriesTarget: 3000, // 増量期の目標カロリー
      proteinCurrent: 126, // 現在の摂取量
      caloriesCurrent: 2400, // 現在の摂取量
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
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    startButton: {
      color: colors.background,
      fontWeight: '600',
    },
    workoutText: {
      color: colors.background,
    },
    workoutInfo: {
      flexDirection: 'column',
      gap: 4,
    },
    duration: {
      color: colors.background,
      fontSize: 12,
      opacity: 0.8,
    },
    progressSection: {
      marginBottom: 24,
    },
    metricsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
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
  });

  const handleWeightCardPress = () => {
    router.push('/weight-input');
  };

  const handleBenchPressCardPress = () => {
    router.push('/exercises');
  };

  return (
    <View style={styles.container}>
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
          {trainingPlans.map((plan) => (
            <TouchableOpacity key={plan.id} style={styles.workoutCard}>
              <View style={styles.workoutInfo}>
                <ThemedText style={styles.workoutText}>{plan.name}</ThemedText>
                <ThemedText style={styles.duration}>{plan.duration}</ThemedText>
              </View>
              <ThemedText style={styles.startButton}>開始</ThemedText>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <View style={styles.progressSection}>
          <View style={styles.progressTitleContainer}>
            <ThemedText>週間目標達成率</ThemedText>
            <ThemedText style={styles.trainingCount}>4/7回</ThemedText>
          </View>
          <ProgressBar progress={weeklyGoalProgress} />
        </View>
      </View>

      <View style={styles.progressSection}>
        <ThemedText style={styles.sectionTitle}>進捗状況</ThemedText>
        <View style={styles.metricsContainer}>
          <TouchableOpacity onPress={handleWeightCardPress}>
            <MetricCard
              title="体重"
              value={`${dummyData.weight.current}kg`}
              change={dummyData.weight.change}
              changeUnit="kg"
              date={new Date().toLocaleDateString('ja-JP')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBenchPressCardPress}>
            <MetricCard
              title="ベンチプレス"
              value={`${dummyData.benchPress.current}kg`}
              change={dummyData.benchPress.change}
              changeUnit="kg"
              date={new Date().toLocaleDateString('ja-JP')}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.nutritionBars}>
          <ThemedText style={styles.sectionTitle}>栄養管理</ThemedText>
          <View style={styles.barContainer}>
            <View style={styles.nutritionHeader}>
              <ThemedText>タンパク質</ThemedText>
              <ThemedText style={styles.nutritionTarget}>{dummyData.nutrition.proteinCurrent}g / {dummyData.nutrition.proteinTarget}g</ThemedText>
            </View>
            <ProgressBar progress={dummyData.nutrition.protein} />
          </View>
          <View style={styles.barContainer}>
            <View style={styles.nutritionHeader}>
              <ThemedText>カロリー</ThemedText>
              <ThemedText style={styles.nutritionTarget}>{dummyData.nutrition.caloriesCurrent}kcal / {dummyData.nutrition.caloriesTarget}kcal</ThemedText>
            </View>
            <ProgressBar progress={dummyData.nutrition.calories} />
          </View>
        </View>
      </View>
    </View>
  );
}
