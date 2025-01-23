import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
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
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const iconAnimation = useRef(new Animated.Value(0)).current;
  const textAnimation = useRef(new Animated.Value(0)).current;
  const statsAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        console.log('Fetching summary with token:', token);
        const response = await fetch(`${API_URL}/api/workout/sessions/${params.workoutSessionId}/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch workout summary');
        }
        const data = await response.json();
        setSummary(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching workout summary:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch workout summary');
      }
    };

    if (params.workoutSessionId && token) {
      fetchSummary();
    }
  }, [params.workoutSessionId, token]);

  useEffect(() => {
    if (summary) {
      // Reset animation values
      iconAnimation.setValue(0);
      textAnimation.setValue(0);
      statsAnimation.setValue(0);

      // Start all animations immediately in parallel
      Animated.parallel([
        // Trophy icon animation with bounce
        Animated.spring(iconAnimation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 280,
          friction: 1.8,
        }),
        // Text animation - simple fade
        Animated.timing(textAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Stats container animation - simple fade
        Animated.timing(statsAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [summary]);

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

  const handleBack = () => {
    router.back();
  };

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
          <Button title="Return to Home" onPress={handleFinish} />
        </View>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={handleBack} variant="secondary" />
      </View>
      <View style={styles.content}>
        <Animated.View style={[{
          opacity: iconAnimation,
          transform: [
            {
              scale: iconAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
            {
              translateY: iconAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        }]}>
          <MaterialCommunityIcons 
            name="trophy" 
            size={80} 
            color={colors.primary} 
            style={styles.icon} 
          />
        </Animated.View>

        <Animated.View style={[{
          opacity: textAnimation,
        }]}>
          <ThemedText style={styles.congratsText}>Workout Complete!</ThemedText>
        </Animated.View>
        
        <Animated.View style={[styles.statsContainer, {
          opacity: statsAnimation,
        }]}>
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
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button title="Finish" onPress={handleFinish} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  icon: {
    marginBottom: 24,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
}); 