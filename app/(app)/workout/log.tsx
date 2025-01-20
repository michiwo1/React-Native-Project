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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  exerciseHeader: {
    marginBottom: 20,
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
    color: '#EF4444',
    fontWeight: '600',
  },
  addSetButton: {
    marginTop: 16,
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
  timerSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    backgroundColor: '#EF4444',
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
}); 