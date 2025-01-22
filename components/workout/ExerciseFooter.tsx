import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import { Exercise } from './ExerciseList';

type ExerciseFooterProps = {
  selectedExercises: number[];
  exercises: Exercise[];
  insets: { bottom: number };
  buttonText?: {
    default: string;
    selected: string;
  };
  navigationType?: 'log' | 'home';
};

export function ExerciseFooter({ 
  selectedExercises, 
  exercises, 
  insets, 
  buttonText = {
    default: 'Select exercises',
    selected: `Add ${selectedExercises.length} exercise${selectedExercises.length === 1 ? '' : 's'}`
  },
  navigationType = 'log'
}: ExerciseFooterProps) {
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity 
        style={[
          styles.selectButton,
          selectedExercises.length > 0 && styles.selectButtonActive
        ]}
        onPress={() => {
          if (selectedExercises.length > 0) {
            if (navigationType === 'home') {
              router.push('/(tabs)');
            } else {
              const selectedExerciseData = exercises.filter(ex => selectedExercises.includes(ex.id));
              router.push({
                pathname: '/workout/log',
                params: { exercises: JSON.stringify(selectedExerciseData) }
              });
            }
          }
        }}
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