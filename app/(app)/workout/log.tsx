import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Exercise = {
  id: number;
  name: string;
  category: string;
};

type ExerciseSet = {
  weight: string;
  reps: string;
  done: boolean;
};

type WorkoutExercise = Exercise & {
  sets: ExerciseSet[];
};

export default function WorkoutLogScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ exercises: string }>();
  const selectedExercises: Exercise[] = params.exercises ? JSON.parse(params.exercises) : [];
  
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    selectedExercises.map(exercise => ({
      ...exercise,
      sets: [{ weight: '', reps: '', done: false }]
    }))
  );
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

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
  };

  const handleFinishWorkout = () => {
    setIsWorkoutStarted(false);
    setStartTime(null);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: string | boolean) => {
    setWorkoutExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets[setIndex] = {
        ...updated[exerciseIndex].sets[setIndex],
        [field]: value
      };
      return updated;
    });
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
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

      <View style={styles.mainContent}>
        <ScrollView style={styles.content}>
          {workoutExercises.map((exercise, exerciseIndex) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
                <ThemedText style={styles.exerciseCategory}>{exercise.category}</ThemedText>
              </View>

              <View style={styles.setsHeader}>
                <ThemedText style={styles.setLabel}>Set</ThemedText>
                <ThemedText style={styles.weightLabel}>Weight (kg)</ThemedText>
                <ThemedText style={styles.repsLabel}>Reps</ThemedText>
                <ThemedText style={styles.doneLabel}>Done</ThemedText>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
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
                  {exercise.sets.length > 1 && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteSet(exerciseIndex, setIndex)}
                    >
                      <ThemedText style={styles.deleteButtonText}>×</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => addSet(exerciseIndex)}
              >
                <ThemedText style={styles.addSetButtonText}>+ Add set</ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.addExerciseContainer}>
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => router.push('/workout/exercises')}
          >
            <ThemedText style={styles.addExerciseText}>+ Add Exercise</ThemedText>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
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
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  setsHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  setLabel: {
    width: 40,
    fontSize: 14,
    color: '#6B7280',
  },
  weightLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  repsLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  doneLabel: {
    width: 50,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  setNumber: {
    width: 40,
    fontSize: 16,
    color: '#6B7280',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    borderRadius: 6,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#FF3B30',
  },
  addSetButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  addSetButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  timerSection: {
    backgroundColor: '#F5F7FA',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  finishButton: {
    backgroundColor: '#FF3B30',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  timerContainer: {
    flex: 1,
    paddingLeft: 8,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#007AFF',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  addExerciseContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  addExerciseButton: {
    backgroundColor: '#F5F7FA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
}); 