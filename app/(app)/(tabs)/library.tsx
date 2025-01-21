import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';

// 種目データの型定義
type Exercise = {
  id: string;
  name: string;
  data: number[];
  color: string;
};

export default function LibraryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // ダミーデータ
  const weightData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        data: [75.5, 75.0, 74.2, 74.8, 73.9, 73.5],
        color: () => '#2563EB', // 青色
      },
    ],
  };

  // 種目データ
  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'ベンチプレス',
      data: [80, 82.5, 85, 85, 87.5, 90],
      color: '#2563EB',
    },
    {
      id: '2',
      name: 'スクワット',
      data: [100, 105, 110, 112.5, 115, 120],
      color: '#2563EB',
    },
    {
      id: '3',
      name: 'デッドリフト',
      data: [120, 125, 130, 132.5, 135, 140],
      color: '#2563EB',
    },
  ];

  const getExerciseData = (exercise: Exercise) => ({
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        data: exercise.data,
        color: () => exercise.color,
      },
    ],
  });

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 1,
    color: () => colors.text,
    labelColor: () => colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
    },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText style={styles.title}>統計</ThemedText>
      
      <View style={styles.chartContainer}>
        <ThemedText style={styles.chartTitle}>体重の推移</ThemedText>
        <ThemedText style={styles.chartSubtitle}>過去6ヶ月</ThemedText>
        <LineChart
          data={weightData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          yAxisSuffix="kg"
          yAxisInterval={1}
        />
      </View>

      <View style={styles.exerciseSection}>
        <ThemedText style={styles.sectionTitle}>種目別の推移</ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.exerciseScrollView}
        >
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseButton,
                selectedExercise?.id === exercise.id && styles.selectedExercise,
                { borderColor: '#2563EB' }
              ]}
              onPress={() => setSelectedExercise(exercise)}
            >
              <ThemedText style={[
                styles.exerciseButtonText,
                selectedExercise?.id === exercise.id && { color: '#2563EB' }
              ]}>
                {exercise.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedExercise && (
          <View style={styles.exerciseChartContainer}>
            <ThemedText style={[styles.chartTitle, { color: selectedExercise.color }]}>
              {selectedExercise.name}の推移
            </ThemedText>
            <ThemedText style={styles.chartSubtitle}>過去6ヶ月</ThemedText>
            <LineChart
              data={getExerciseData(selectedExercise)}
              width={Dimensions.get('window').width - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisSuffix="kg"
              yAxisInterval={1}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 44,
    marginBottom: 24,
  },
  chartContainer: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  exerciseSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  exerciseScrollView: {
    marginBottom: 16,
  },
  exerciseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: '#F8FAFC',
  },
  selectedExercise: {
    backgroundColor: '#F0FDF4',
  },
  exerciseButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseChartContainer: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
}); 