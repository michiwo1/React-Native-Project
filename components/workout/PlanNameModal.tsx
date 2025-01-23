import React, { useState } from 'react';
import { View, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Exercise } from '@/components/workout/ExerciseList';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';

type PlanNameModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (planName: string) => void;
  selectedExercises: Exercise[];
};

export function PlanNameModal({ isVisible, onClose, onSubmit, selectedExercises }: PlanNameModalProps) {
  const [planName, setPlanName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async () => {
    if (!planName.trim()) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: planName,
          exerciseIds: selectedExercises.map(exercise => exercise.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create plan');
      }

      const data = await response.json();
      onSubmit(planName);
      setPlanName('');
      Alert.alert('Success', 'Plan created successfully');
    } catch (error) {
      console.error('Error creating plan:', error);
      Alert.alert('Error', 'Failed to create plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ThemedText style={styles.modalTitle}>Create New Plan</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter plan name"
            value={planName}
            onChangeText={setPlanName}
            autoFocus
          />
          <ScrollView style={styles.exerciseList}>
            <ThemedText style={styles.exerciseListTitle}>Selected Exercises:</ThemedText>
            {selectedExercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <ThemedText style={styles.exerciseNumber}>{index + 1}.</ThemedText>
                <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.createButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <ThemedText style={styles.createButtonText}>
                {isLoading ? 'Creating...' : 'Create'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exerciseList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  exerciseListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  exerciseNumber: {
    width: 24,
    fontSize: 14,
    color: '#8E8E93',
  },
  exerciseName: {
    fontSize: 14,
    flex: 1,
  },
}); 