import { View, StyleSheet, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';


type WorkoutSummary = {
  duration: number;
  exerciseCount: number;
  totalVolume: number;
  startedAt: string;
  endedAt: string;
};

export default function WorkoutCompleteScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ workoutSessionId: string }>();
  const { token } = useAuth();
  const { colors } = useTheme();
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${API_URL}/workout/sessions/${params.workoutSessionId}/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch workout summary');
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching workout summary:', error);
      }
    };

    if (params.workoutSessionId) {
      fetchSummary();
    }
  }, [params.workoutSessionId, token]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleFinish = () => {
    router.replace('/(app)/(tabs)');
  };

  if (!summary) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="trophy" size={64} color={colors.primary} style={styles.icon} />
        <ThemedText style={styles.congratsText}>Workout Complete!</ThemedText>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{formatDuration(summary.duration)}</ThemedText>
            <ThemedText style={styles.statLabel}>Duration</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{summary.exerciseCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Exercises</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{summary.totalVolume}kg</ThemedText>
            <ThemedText style={styles.statLabel}>Total Volume</ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button onPress={handleFinish} title="Finish" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  icon: {
    marginBottom: 16,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  footer: {
    padding: 16,
  },
}); 