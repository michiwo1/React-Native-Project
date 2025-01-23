import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
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

export default function CalendarScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<{ [date: string]: WorkoutData }>({});
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchWorkoutSessions();
    }
  }, [token]);

  const fetchWorkoutSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/workout/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workout sessions');
      }

      const data = await response.json();
      const workoutMap: { [date: string]: WorkoutData } = {};
      const markedDatesMap: { [date: string]: any } = {};

      data.forEach((workout: WorkoutData) => {
        if (workout.ended_at) {
          const date = new Date(workout.ended_at).toISOString().split('T')[0];
          workoutMap[date] = workout;
          markedDatesMap[date] = {
            marked: true,
            dotColor: colors.primary,
            customStyles: {
              container: {
                borderRadius: 8,
              },
              text: {
                color: colors.text,
              }
            }
          };
        }
      });

      setWorkouts(workoutMap);
      setMarkedDates(markedDatesMap);
    } catch (error) {
      console.error('Error fetching workout sessions:', error);
    }
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(new Date(day.timestamp));
  };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedWorkout = workouts[selectedDateStr];

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
          markingType={'custom'}
          style={styles.calendar}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: colors.text,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: colors.textSecondary,
            dotColor: colors.primary,
            monthTextColor: colors.text,
            arrowColor: colors.text,
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>

      <ScrollView style={styles.selectedDateSection}>
        <ThemedText style={styles.selectedDateText}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </ThemedText>

        <View style={styles.createButtonContainer}>
          <Button 
            label="Create today's workout plan"
            onPress={() => router.push('/workout/plan')}
          />
        </View>

        {selectedWorkout && (
          <View style={styles.workoutCard}>
            <View style={styles.workoutInfo}>
              <ThemedText style={styles.workoutInfoTitle}>Workout Info</ThemedText>
              {selectedWorkout.exercises?.map((exercise, index) => (
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
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 44,
    backgroundColor: Colors.light.background,
  },
  calendarContainer: {
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  calendar: {
    padding: 12,
  },
  selectedDateSection: {
    flex: 1,
    padding: 16,
  },
  selectedDateText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  chevron: {
    fontSize: 24,
    color: '#3B82F6',
    fontWeight: '600',
  },
  workoutInfo: {
    padding: 20,
  },
  workoutInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  exerciseItem: {
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 12,
    color: '#3B82F6',
  },
  exerciseName: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
    color: '#1E293B',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  completedCheckmark: {
    backgroundColor: '#10B981',
  },
  setsContainer: {
    marginTop: 8,
    paddingLeft: 26,
  },
  exerciseDetails: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  createButtonContainer: {
    marginBottom: 16,
  },
}); 