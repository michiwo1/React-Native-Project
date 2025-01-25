import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';

interface Plan {
  id: string;
  name: string;
  exercises: {
    exercise: {
      name: string;
    };
  }[];
}

interface Exercise {
  id: string;
  exercise: {
    name: string;
  };
  sets: {
    reps: number;
    weight: number;
  }[];
}

interface WorkoutSession {
  id: string;
  started_at: string;
  ended_at: string | null;
  exercises: Exercise[];
}

export default function WorkoutPlanScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { token } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    if (token) {
      checkActiveSession();
      fetchPlans();
    }
  }, [token]);

  const checkActiveSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/workout/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch active session');
      }
      const data = await response.json();
      if (data && !data.ended_at) {
        setActiveSession(data);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/calendar")}>
          <ThemedText style={styles.backButton}>← 戻る</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.dateText}>{new Date().toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })}</ThemedText>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeSession ? (
          <View style={styles.workoutCard}>
            <TouchableOpacity 
              style={styles.summaryHeader}
              onPress={() => router.push('/workout/log')}
            >
              <ThemedText style={styles.summaryTitle}>
                {new Date(activeSession.started_at).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })} Summary
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
              {activeSession.exercises?.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseItem}>
                  <View style={styles.exerciseHeader}>
                    <ThemedText style={styles.exerciseNumber}>{index + 1}</ThemedText>
                    <ThemedText style={styles.exerciseName}>
                      {exercise.exercise?.name} | {exercise.sets?.length || 0} sets
                    </ThemedText>
                    <View style={[styles.checkmark, exercise.sets?.length > 0 && styles.completedCheckmark]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.workoutSection}>
              <ThemedText style={styles.title}>今日のワークアウト</ThemedText>
              <ThemedText style={styles.subtitle}>プランを選択するか、新しいワークアウトを始めましょう！</ThemedText>
                  
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#007AFF' }]}
                onPress={() => router.push('/workout/exercises')}
              >
                <ThemedText style={styles.buttonText}>新しいワークアウトを始める</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.plansSection}>
              <ThemedText style={styles.sectionTitle}>マイプラン</ThemedText>
              {loading ? (
                <ThemedText>読み込み中...</ThemedText>
              ) : plans.length > 0 ? (
                <ScrollView style={styles.plansScrollContainer}>
                  {plans.map((plan) => (
                    <TouchableOpacity 
                      key={plan.id} 
                      style={styles.planCard}
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
                <View style={styles.emptyPlansContainer}>
                  <ThemedText style={styles.emptyPlansText}>
                    プランが未設定です
                  </ThemedText>
                  <ThemedText style={styles.emptyPlansSubtext}>
                    新しいトレーニングプランを作成して{'\n'}トレーニングを始めましょう
                  </ThemedText>
                </View>
              )}

              <TouchableOpacity 
                style={styles.createPlanButton}
                onPress={() => router.push('/plan/create')}
              >
                <ThemedText style={styles.createPlanButtonText}>
                  新しいプランを作成
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
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
    flex: 1,
    marginRight: 12,
  },
  workoutInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  exerciseItem: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  completedCheckmark: {
    backgroundColor: '#10B981',
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
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  plansSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  workoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  duration: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
    maxWidth: '90%',
    lineHeight: 16,
  },
  startButton: {
    color: '#FFFFFF',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 14,
  },
  plansScrollContainer: {
    maxHeight: 400,
  },
  emptyPlansContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyPlansText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyPlansSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  createPlanButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  createPlanButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
}); 