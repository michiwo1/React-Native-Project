import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';

type Set = {
  id: string;
  weight: number;
  reps: number;
  is_completed: boolean;
};

type Exercise = {
  id: string;
  name: string;
  exercise: {
    name: string;
  };
  sets: Set[];
};

export default function WorkoutLog() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchExercises();
    }
  }, [token]);

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${API_URL}/api/workout/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }

      const data = await response.json();
      setExercises(data.exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleSetCompletion = async (exerciseId: string, setId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/workout/set/${setId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to complete set');
      }

      setExercises(exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map(set => {
              if (set.id === setId) {
                return { ...set, is_completed: true };
              }
              return set;
            }),
          };
        }
        return exercise;
      }));
    } catch (error) {
      console.error('Error completing set:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {exercises.map(exercise => (
        <View key={exercise.id} style={styles.exerciseCard}>
          <ThemedText type="title">{exercise.exercise.name}</ThemedText>
          {exercise.sets.map(set => (
            <View key={set.id} style={styles.setRow}>
              <ThemedText>{`${set.weight}kg × ${set.reps}回`}</ThemedText>
              {!set.is_completed && (
                <Button
                  label="Done"
                  onPress={() => handleSetCompletion(exercise.id, set.id)}
                  variant="outline"
                />
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
  },
}); 