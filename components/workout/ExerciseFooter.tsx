import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import { Exercise } from './ExerciseList';
import { API_URL } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ExerciseFooterProps = {
  selectedExercises: number[];
  exercises: Exercise[];
  insets: { bottom: number };
  buttonText?: {
    default: string;
    selected: string;
  };
  navigationType?: 'log' | 'home';
  onPress?: () => void;
  workoutSessionId?: string;
  onAddToWorkoutSession?: (exercises: Exercise[]) => Promise<any>;
  onExercisesAdded?: string;
};

export function ExerciseFooter({ 
  selectedExercises, 
  exercises, 
  insets, 
  buttonText = {
    default: 'Select exercises',
    selected: `Add ${selectedExercises.length} exercise${selectedExercises.length === 1 ? '' : 's'}`
  },
  navigationType = 'log',
  onPress,
  workoutSessionId,
  onAddToWorkoutSession,
  onExercisesAdded
}: ExerciseFooterProps) {
  const handlePress = async () => {
    if (selectedExercises.length === 0) return;

    try {
      if (onPress) {
        onPress();
        return;
      }

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const selectedExerciseData = exercises.filter(ex => selectedExercises.includes(ex.id));

      if (workoutSessionId && onAddToWorkoutSession) {
        await onAddToWorkoutSession(selectedExerciseData);
        if (onExercisesAdded === 'true') {
          router.back();
        }

        router.replace({
          pathname: '/workout/log',
          params: { 
            exercises: JSON.stringify(selectedExerciseData)
          }
        });
      } else {
        // Create new workout session
        const response = await fetch(`${API_URL}/api/workout/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            exerciseIds: selectedExercises.map(id => id.toString()),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create workout session');
        }

        const workoutSession = await response.json();
        router.replace({
          pathname: '/workout/log',
          params: { 
            exercises: JSON.stringify(selectedExerciseData),
            workoutSessionId: workoutSession.id
          }
        });
      }
    } catch (error) {
      console.error('Error in handlePress:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  };

  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity 
        style={[
          styles.selectButton,
          selectedExercises.length > 0 && styles.selectButtonActive
        ]}
        onPress={handlePress}
        disabled={selectedExercises.length === 0}
      >
        <ThemedText style={[
          styles.selectButtonText,
          selectedExercises.length > 0 && styles.selectButtonTextActive
        ]}>
          {selectedExercises.length === 0
            ? buttonText.default
            : buttonText.selected}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  newButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  newButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },
  selectButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  selectButtonActive: {
    backgroundColor: '#007AFF',
  },
  selectButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#8E8E93',
  },
  selectButtonTextActive: {
    color: '#FFFFFF',
  },
}); 