import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';

// 種目データの型定義
type Exercise = {
  id: string;
  name: string;
  data: number[];
  color: string;
};

type WeightHistory = {
  value: number;
  date: Date;
};

export default function LibraryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [weightData, setWeightData] = useState<{
    labels: string[];
    datasets: {
      data: number[];
      color: () => string;
      strokeWidth?: number;
    }[];
  }>({
    labels: [],
    datasets: [
      {
        data: [],
        color: () => '#2563EB',
        strokeWidth: 2,
      },
    ],
  });

  const fetchWeightHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/measurement/weight/history/graph`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch weight history');
      }
      const data: WeightHistory[] = await response.json();
      
      if (data.length === 0) {
        setWeightData({
          labels: ['データなし'],
          datasets: [{
            data: [0],
            color: () => '#2563EB',
            strokeWidth: 2,
          }],
        });
        return;
      }
      
      // グラフ用にデータを変換
      const formattedData = {
        labels: data.map(d => {
          const date = new Date(d.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
        datasets: [{
          data: data.map(d => Number(d.value.toFixed(1))),
          color: () => '#2563EB',
          strokeWidth: 2,
        }],
      };
      
      setWeightData(formattedData);
    } catch (error) {
      console.error('Error fetching weight history:', error);
      // エラー時のフォールバックデータ
      setWeightData({
        labels: ['エラー'],
        datasets: [{
          data: [0],
          color: () => '#2563EB',
          strokeWidth: 2,
        }],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWeightHistory();
    }
  }, [token]);

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
    backgroundColor: Colors[colorScheme].background,
    backgroundGradientFrom: Colors[colorScheme].background,
    backgroundGradientTo: Colors[colorScheme].background,
    decimalPlaces: 1,
    color: () => '#E2E8F0',
    labelColor: () => Colors[colorScheme].text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: '#2563EB',
    },
    strokeWidth: 2,
    useShadowColorFromDataset: false,
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 24,
    },
    chartContainer: {
      backgroundColor: Colors[colorScheme].background,
      padding: 16,
      borderRadius: 16,
      marginBottom: 24,
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
    loader: {
      marginVertical: 32,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.title}>統計</ThemedText>
      
      <View style={styles.chartContainer}>
        <ThemedText style={styles.chartTitle}>体重の推移</ThemedText>
        <ThemedText style={styles.chartSubtitle}>過去6ヶ月</ThemedText>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
        ) : (
          <LineChart
            data={weightData}
            width={Dimensions.get('window').width - 64}
            height={220}
            chartConfig={chartConfig}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            yAxisSuffix="kg"
            yAxisInterval={1}
            fromZero={false}
            segments={5}
          />
        )}
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