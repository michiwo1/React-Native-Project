import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, Platform, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';
import ModalSelector from 'react-native-modal-selector';

// 種目データの型定義
type Exercise = {
  id: string;
  name: string;
  personal_records: {
    weight: number;
    reps: number;
    recorded_at: string;
  }[];
};

type WeightHistory = {
  value: number;
  date: Date;
};

export default function LibraryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
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

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${API_URL}/api/exercise/with-records`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setExercises([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWeightHistory();
      fetchExercises();
    }
  }, [token]);

  const getExerciseData = (exercise: Exercise) => {
    const records = exercise.personal_records;
    const sortedRecords = records
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-6);  // 最新の6件を取得

    return {
      labels: sortedRecords.map(record => {
        const date = new Date(record.recorded_at);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: sortedRecords.map(record => record.weight),
          color: () => '#2563EB',
        },
      ],
    };
  };

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
    selectorContainer: {
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    selectorButton: {
      paddingVertical: 8,
      paddingHorizontal: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: 36,
    },
    selectorButtonText: {
      fontSize: 15,
      color: '#64748B',
      fontWeight: '500',
    },
    selectorIcon: {
      marginLeft: 6,
      fontSize: 12,
      color: '#64748B',
      marginTop: 1,
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 12,
      paddingBottom: 20,
      maxHeight: Dimensions.get('window').height * 0.7,
    },
    modalHeader: {
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1F2937',
      textAlign: 'center',
    },
    optionContainer: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 56,
    },
    selectedOption: {
      backgroundColor: '#F0F9FF',
    },
    optionText: {
      fontSize: 16,
      color: '#1F2937',
      flex: 1,
    },
    selectedOptionText: {
      color: '#2563EB',
      fontWeight: '500',
    },
    cancelButton: {
      paddingVertical: 16,
      backgroundColor: '#F8FAFC',
    },
    cancelText: {
      fontSize: 16,
      color: '#DC2626',
      textAlign: 'center',
      fontWeight: '500',
    },
    placeholderText: {
      color: '#64748B',
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
        <ThemedText style={styles.sectionTitle}>種目別の最大重量の推移</ThemedText>
        <View style={styles.selectorContainer}>
          <ModalSelector
            data={[
              { key: '', label: '種目を選択' },
              ...exercises.slice(0, 100).map(exercise => ({
                key: exercise.id,
                label: exercise.name
              }))
            ]}
            onChange={(option) => {
              const selected = exercises.find(ex => ex.id === option.key);
              setSelectedExercise(selected || null);
            }}
            style={styles.selectorButton}
            optionContainerStyle={styles.modalContent}
            cancelContainerStyle={styles.cancelButton}
            optionStyle={styles.optionContainer}
            optionTextStyle={styles.optionText}
            selectedItemTextStyle={styles.selectedOptionText}
            cancelTextStyle={styles.cancelText}
            cancelText="キャンセル"
            overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            touchableActiveOpacity={0.7}
            listType="FLATLIST"
            keyExtractor={(item) => item.key}
            ListHeaderComponent={
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>種目を選択</ThemedText>
              </View>
            }
          >
            <View style={styles.selectorButton}>
              <ThemedText style={[
                styles.selectorButtonText,
                selectedExercise && { color: '#1F2937', fontWeight: '600' }
              ]}>
                {selectedExercise ? selectedExercise.name : 'エクササイズを選択'}
              </ThemedText>
              <ThemedText style={styles.selectorIcon}>▼</ThemedText>
            </View>
          </ModalSelector>
        </View>

        {selectedExercise && (
          <View style={styles.exerciseChartContainer}>
            <ThemedText style={[styles.chartTitle, { color: '#2563EB' }]}>
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