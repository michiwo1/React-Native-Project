import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';

interface Set {
  reps: number;
  weight: number;
}

interface Exercise {
  id: string;
  exercise: {
    name: string;
  };
  exercise_id: string;
  sets: Set[];
}

interface WorkoutData {
  id: string;
  exercises: Exercise[];
  started_at: string;
  ended_at: string | null;
  note: string | null;
}

export default function WorkoutPlanScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      checkTodayWorkoutSession();
    }
  }, [token]);

  const checkTodayWorkoutSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/workout/latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data && !data.ended_at) {
          setHasActiveSession(true);
          setWorkoutData(data);
        }
      }
    } catch (error) {
      console.error('Error checking workout session:', error);
    }
  };

  // Get today's date in Japanese format
  const today = new Date();
  const dateString = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/calendar")}>
          <ThemedText style={styles.backButton}>← 戻る</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.dateText}>{dateString}</ThemedText>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hasActiveSession && workoutData ? (
          <View style={styles.workoutCard}>
            <TouchableOpacity 
              style={styles.summaryHeader}
              onPress={() => router.push('/workout/log')}
            >
              <ThemedText style={styles.summaryTitle}>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} Summary
              </ThemedText>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </TouchableOpacity>
            
            <View style={styles.warningBox}>
              <ThemedText style={styles.warningText}>
                This workout is not yet completed.
              </ThemedText>
              <ThemedText style={styles.warningSubtext}>
                Finish the workout to view the info.
              </ThemedText>
            </View>

            <View style={styles.workoutInfo}>
              <ThemedText style={styles.workoutInfoTitle}>Workout Info</ThemedText>
              {workoutData.exercises?.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseItem}>
                  <View style={styles.exerciseHeader}>
                    <ThemedText style={styles.exerciseNumber}>{index + 1}</ThemedText>
                    <ThemedText style={styles.exerciseName}>
                      {exercise.exercise?.name} | {exercise.sets?.length || 0} sets
                    </ThemedText>
                    <View style={[styles.checkmark, exercise.sets?.length > 0 && styles.completedCheckmark]} />
                  </View>
                  <View style={styles.setsContainer}>
                    {exercise.sets?.map((set, setIndex) => (
                      <ThemedText key={setIndex} style={styles.exerciseDetails}>
                        Set {setIndex + 1}: {set.weight || 0}lbs × {set.reps || 0}reps
                      </ThemedText>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.workoutSection}>
            <ThemedText style={styles.title}>Today's workout</ThemedText>
            <ThemedText style={styles.subtitle}>Plan your own workout!</ThemedText>
              
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#007AFF' }]}
              onPress={() => router.push('/workout/exercises')}
            >
              <ThemedText style={styles.buttonText}>Add exercises</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {!hasActiveSession && !workoutData && (
          <View>
            <TouchableOpacity 
              style={styles.routineSection}
              onPress={() => {/* Handle routine selection */}}
            >
              <View>
                <ThemedText style={styles.sectionTitle}>My routines</ThemedText>
                <ThemedText style={styles.routineText}>Select routine</ThemedText>
              </View>
              <ThemedText style={styles.arrow}>→</ThemedText>
            </TouchableOpacity>
            <View style={styles.restMessage}>
              <ThemedText style={styles.restText}>Today is a rest day 😢</ThemedText>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'column',
    gap: 12,
  },
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 20,
    color: '#1E293B',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  workoutSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  routineSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  routineText: {
    color: '#64748B',
    fontSize: 15,
  },
  arrow: {
    fontSize: 20,
    color: '#3B82F6',
    fontWeight: '600',
  },
  restMessage: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  restText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  chevron: {
    fontSize: 24,
    color: '#3B82F6',
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#F1F5F9',
    padding: 20,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 4,
  },
  warningSubtext: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  workoutInfo: {
    padding: 20,
  },
  workoutInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  exerciseItem: {
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
    color: '#3B82F6',
  },
  exerciseName: {
    fontSize: 16,
    flex: 1,
    fontWeight: '600',
    color: '#1E293B',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 28,
    marginTop: 2,
  },
  setsContainer: {
    marginLeft: 28,
    marginTop: 6,
  },
  completedCheckmark: {
    backgroundColor: '#10B981',
  },
}); 