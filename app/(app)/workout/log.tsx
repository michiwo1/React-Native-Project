import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

type Exercise = {
  id: string;
  name: string;
  category: string;
};

type ExerciseSet = {
  id?: string;
  weight: string;
  reps: string;
  done: boolean;
};

type WorkoutExercise = Exercise & {
  sets: ExerciseSet[];
  note: string;
  workoutSessionExerciseId: string;
};

export default function WorkoutLogScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ exercises: string }>();
  const selectedExercises: Exercise[] = params.exercises ? JSON.parse(params.exercises) : [];
  const { token } = useAuth();
  
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    selectedExercises.map(exercise => ({
      ...exercise,
      sets: [{ weight: '', reps: '', done: false }],
      note: '',
      workoutSessionExerciseId: ''
    }))
  );
  const [latestWorkoutSessionId, setLatestWorkoutSessionId] = useState<string | null>(null);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restStartTime, setRestStartTime] = useState<number | null>(null);
  const [targetRestTime, setTargetRestTime] = useState<number>(60);
  const [remainingRestTime, setRemainingRestTime] = useState<number>(0);
  const [isRestSettingModalVisible, setIsRestSettingModalVisible] = useState(false);
  const [tempMinutes, setTempMinutes] = useState(Math.floor(targetRestTime / 60));
  const [tempSeconds, setTempSeconds] = useState(targetRestTime % 60);

  useEffect(() => {
    setupNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        loadLatestWorkoutSession();
      }
    }, [token])
  );

  const loadLatestWorkoutSession = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/workout/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch latest workout session');
      }

      const data = await response.json();
      if (data.exercises && data.exercises.length > 0) {
        setLatestWorkoutSessionId(data.id);
        const formattedExercises: WorkoutExercise[] = data.exercises.map((exercise: any) => ({
          id: exercise.exercise.id,
          name: exercise.exercise.name,
          category: exercise.exercise.category.name,
          workoutSessionExerciseId: exercise.id,
          sets: exercise.sets.map((set: any) => ({
            id: set.id,
            weight: set.weight.toString(),
            reps: set.reps.toString(),
            done: set.is_completed,
          })),
          note: exercise.note || '',
        }));
        setWorkoutExercises(formattedExercises);
      }
    } catch (error) {
      console.error('Error fetching latest workout session:', error);
    }
  };

  const setupNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Enable notifications when app is in foreground
    await Notifications.setNotificationChannelAsync('rest-timer', {
      name: 'Rest Timer',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    });
  };

  const scheduleRestFinishedNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Rest Time Finished! 🔔",
          body: "Time to start your next set 💪",
          sound: true,
          priority: 'high',
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // Immediate notification
      });
    } catch (error) {
      console.log('Error scheduling notification:', error);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isWorkoutStarted && startTime) {
      intervalId = setInterval(() => {
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isWorkoutStarted, startTime]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isResting && restStartTime) {
      intervalId = setInterval(() => {
        const now = Date.now();
        const elapsedRestTime = Math.floor((now - restStartTime) / 1000);
        const remaining = targetRestTime - elapsedRestTime;
        
        if (remaining <= 0) {
          handleStopRest();
          scheduleRestFinishedNotification();
        } else {
          setRemainingRestTime(remaining);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isResting, restStartTime, targetRestTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(hours.toString().padStart(2, '0'));
    parts.push(minutes.toString().padStart(2, '0'));
    parts.push(remainingSeconds.toString().padStart(2, '0'));
    
    return parts.join(':');
  };

  const handleStartWorkout = () => {
    setIsWorkoutStarted(true);
    setStartTime(Date.now());
    if (isResting) {
      handleStopRest();
    }
  };

  const handleFinishWorkout = async () => {
    try {
      if (!latestWorkoutSessionId) return;

      const response = await fetch(`${API_URL}/api/workout/sessions/${latestWorkoutSessionId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to complete workout session');
      }

      setIsWorkoutStarted(false);
      setStartTime(null);
      setElapsedTime(0);
      if (isResting) {
        handleStopRest();
      }

      // Navigate back to the workout plan screen
      router.push('/workout/plan');
    } catch (error) {
      console.error('Error completing workout:', error);
      Alert.alert('Error', 'Failed to complete workout');
    }
  };

  const handleStartRest = () => {
    setIsResting(true);
    setRestStartTime(Date.now());
    setRemainingRestTime(targetRestTime);
  };

  const handleStopRest = () => {
    setIsResting(false);
    setRestStartTime(null);
    setRemainingRestTime(0);
  };

  const updateSet = async (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: string | boolean) => {
    try {
      const exercise = workoutExercises[exerciseIndex];
      const set = exercise.sets[setIndex];
      
      // Update local state first
      setWorkoutExercises(prev => {
        const updated = [...prev];
        updated[exerciseIndex].sets[setIndex] = {
          ...updated[exerciseIndex].sets[setIndex],
          [field]: value
        };
        return updated;
      });

      // Save to API when a set is marked as done
      if (field === 'done' && value === true) {
        // Get the workout session exercise ID from the exercise object
        const workoutSessionExerciseId = exercise.workoutSessionExerciseId;
        
        if (!workoutSessionExerciseId) {
          throw new Error('Workout session exercise ID not found');
        }

        const response = await fetch(`${API_URL}/api/workout/${workoutSessionExerciseId}/sets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            setNumber: setIndex + 1,
            weight: parseFloat(set.weight) || 0,
            reps: parseInt(set.reps) || 0,
            isCompleted: true
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save exercise set');
        }

        // Start rest timer
        if (isResting) {
          handleStopRest();
        }
        handleStartRest();
      }
    } catch (error) {
      console.error('Error updating set:', error);
      Alert.alert('Error', 'Failed to save exercise set');
    }
  };

  const addSet = (exerciseIndex: number) => {
    setWorkoutExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets.push({ weight: '', reps: '', done: false });
      return updated;
    });
  };

  const deleteSet = (exerciseIndex: number, setIndex: number) => {
    setWorkoutExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets.splice(setIndex, 1);
      return updated;
    });
  };

  const handleOpenRestSetting = () => {
    setTempMinutes(Math.floor(targetRestTime / 60));
    setTempSeconds(targetRestTime % 60);
    setIsRestSettingModalVisible(true);
  };

  const handleSaveRestSetting = () => {
    setTargetRestTime(tempMinutes * 60 + tempSeconds);
    setIsRestSettingModalVisible(false);
  };

  const updateNote = (exerciseIndex: number, note: string) => {
    setWorkoutExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].note = note;
      return updated;
    });
  };

  const handleExercisesAdded = async () => {
    await loadLatestWorkoutSession();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/workout/plan')}>
          <ThemedText style={styles.backButton}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Workout Log</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.timerSection}>
        <View style={styles.timerContainer}>
          <ThemedText style={styles.timerText}>
            {isWorkoutStarted || elapsedTime > 0 ? formatTime(elapsedTime) : '--:--'}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.startButton, isWorkoutStarted && styles.finishButton]}
          onPress={isWorkoutStarted ? handleFinishWorkout : handleStartWorkout}
        >
          <ThemedText style={styles.startButtonText}>
            {isWorkoutStarted ? 'FINISH' : 'START'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.restTimerSection}>
        <View style={styles.restTimerContainer}>
          <View style={styles.restTimerHeader}>
            <ThemedText style={styles.restTimerLabel}>Rest Timer</ThemedText>
          </View>
          <ThemedText style={styles.restTimerText}>
            {isResting ? formatTime(remainingRestTime) : formatTime(targetRestTime)}
          </ThemedText>
        </View>
        <View style={styles.restButtonGroup}>
          <TouchableOpacity style={styles.restSettingButtonContainer} onPress={handleOpenRestSetting}>
            <ThemedText style={styles.restSettingButton}>Edit</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.restButton, isResting && styles.stopRestButton]}
            onPress={isResting ? handleStopRest : handleStartRest}
          >
            <ThemedText style={styles.restButtonText}>
              {isResting ? 'STOP' : 'REST'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        <ScrollView style={styles.content}>
          {workoutExercises.map((exercise, exerciseIndex) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseHeaderMain}>
                  <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
                  <ThemedText style={styles.exerciseCategory}>{exercise.category}</ThemedText>
                </View>
                <View style={styles.volumeContainer}>
                  <ThemedText style={styles.volumeLabel}>Volume</ThemedText>
                  <ThemedText style={styles.volumeValue}>
                    {exercise.sets.reduce((total, set) => {
                      const weight = parseFloat(set.weight) || 0;
                      const reps = parseInt(set.reps) || 0;
                      return total + (weight * reps);
                    }, 0)}kg
                  </ThemedText>
                </View>
              </View>

              <TextInput
                style={styles.noteInput}
                placeholder="Note"
                value={exercise.note}
                onChangeText={(text) => updateNote(exerciseIndex, text)}
                multiline
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.setsHeader}>
                <ThemedText style={styles.setLabel}>Set</ThemedText>
                <ThemedText style={styles.weightLabel}>Weight (kg)</ThemedText>
                <ThemedText style={styles.repsLabel}>Reps</ThemedText>
                <ThemedText style={styles.doneLabel}>Done</ThemedText>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={`${exercise.id}_set_${setIndex}`} style={styles.setRow}>
                  <ThemedText style={styles.setNumber}>{setIndex + 1}</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={set.weight}
                    onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'weight', value)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <TextInput
                    style={styles.input}
                    value={set.reps}
                    onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'reps', value)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <TouchableOpacity
                    style={[styles.checkbox, set.done && styles.checkedBox]}
                    onPress={() => updateSet(exerciseIndex, setIndex, 'done', !set.done)}
                  >
                    {set.done && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.setButtonsContainer}>
                {exercise.sets.length > 1 && (
                  <TouchableOpacity
                    style={styles.deleteSetButton}
                    onPress={() => deleteSet(exerciseIndex, exercise.sets.length - 1)}
                  >
                    <ThemedText style={styles.deleteSetButtonText}>Delete set</ThemedText>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.addSetButton, exercise.sets.length > 1 && { marginLeft: 8, marginRight: 0 }]}
                  onPress={() => addSet(exerciseIndex)}
                >
                  <ThemedText style={styles.addSetButtonText}>+ Add set</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.addExerciseContainer}>
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => {
              if (latestWorkoutSessionId) {
                router.push({
                  pathname: '/workout/exercises',
                  params: { 
                    workoutSessionId: latestWorkoutSessionId,
                    onExercisesAdded: 'true'
                  }
                });
              } else {
                router.push('/workout/exercises');
              }
            }}
          >
            <ThemedText style={styles.addExerciseText}>+ Add Exercise</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isRestSettingModalVisible}
        onRequestClose={() => setIsRestSettingModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setIsRestSettingModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Set Rest Time</ThemedText>
              <TouchableOpacity onPress={() => setIsRestSettingModalVisible(false)}>
                <ThemedText style={styles.modalCloseButton}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerSection}>
                <ThemedText style={styles.timePickerLabel}>Minutes</ThemedText>
                <View style={styles.timePickerButtons}>
                  <TouchableOpacity 
                    style={styles.timeAdjustButton}
                    onPress={() => setTempMinutes(prev => Math.max(0, prev - 1))}
                  >
                    <ThemedText style={styles.timeAdjustButtonText}>-</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.timeValue}>{tempMinutes}</ThemedText>
                  <TouchableOpacity 
                    style={styles.timeAdjustButton}
                    onPress={() => setTempMinutes(prev => Math.min(10, prev + 1))}
                  >
                    <ThemedText style={styles.timeAdjustButtonText}>+</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.timePickerSection}>
                <ThemedText style={styles.timePickerLabel}>Seconds</ThemedText>
                <View style={styles.timePickerButtons}>
                  <TouchableOpacity 
                    style={styles.timeAdjustButton}
                    onPress={() => setTempSeconds(prev => Math.max(0, prev - 10))}
                  >
                    <ThemedText style={styles.timeAdjustButtonText}>-</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.timeValue}>{tempSeconds}</ThemedText>
                  <TouchableOpacity 
                    style={styles.timeAdjustButton}
                    onPress={() => setTempSeconds(prev => Math.min(50, prev + 10))}
                  >
                    <ThemedText style={styles.timeAdjustButtonText}>+</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveRestSetting}
            >
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    fontSize: 16,
    color: '#2563EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRight: {
    width: 40,
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  exerciseHeader: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseHeaderMain: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#0F172A',
  },
  exerciseCategory: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  volumeContainer: {
    alignItems: 'flex-end',
  },
  volumeLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  volumeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  setsHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  setLabel: {
    width: 40,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  weightLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  repsLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  doneLabel: {
    width: 50,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  setNumber: {
    width: 40,
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#93C5FD',
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '600',
  },
  addSetButton: {
    flex: 1,
    marginRight: 0,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  addSetButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  setButtonsContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  deleteSetButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  deleteSetButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  timerSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
  },
  timerContainer: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0F172A',
    includeFontPadding: false,
    lineHeight: 42,
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  finishButton: {
    backgroundColor: '#64748B',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  addExerciseContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  addExerciseButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  restTimerSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 88,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  restTimerContainer: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  restTimerHeader: {
    marginBottom: 4,
  },
  restTimerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  restTimerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    includeFontPadding: false,
    lineHeight: 38,
  },
  restButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  stopRestButton: {
    backgroundColor: '#64748B',
  },
  restButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  restSettingButtonContainer: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
  },
  restSettingButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCloseButton: {
    fontSize: 20,
    color: '#64748B',
    padding: 4,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  timePickerSection: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  timePickerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeAdjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeAdjustButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563EB',
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 40,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  noteInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    minHeight: 44,
    fontSize: 14,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
}); 