import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export type Exercise = {
  id: number;
  name: string;
  category: string;
  bookmarks: number;
};

type ExerciseListProps = {
  exercises: Exercise[];
  selectedExercises: number[];
  onExerciseSelect: (exerciseId: number) => void;
  scrollY: Animated.Value;
};

export function ExerciseList({ exercises, selectedExercises, onExerciseSelect, scrollY }: ExerciseListProps) {
  return (
    <Animated.ScrollView
      style={styles.exercisesList}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    >
      {exercises.map((exercise) => (
        <TouchableOpacity
          key={exercise.id}
          style={[
            styles.exerciseItem,
            selectedExercises.includes(exercise.id) && styles.selectedExerciseItem
          ]}
          onPress={() => onExerciseSelect(exercise.id)}
        >
          <View style={styles.exerciseLeft}>
            <View 
              style={[
                styles.checkbox,
                selectedExercises.includes(exercise.id) && styles.checkedExercise
              ]}
            >
              {selectedExercises.includes(exercise.id) && (
                <ThemedText style={styles.checkmark}>✓</ThemedText>
              )}
            </View>
            <View style={styles.exerciseIcon} />
            <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
          </View>
          <View style={styles.exerciseRight}>
            {exercise.bookmarks > 0 && (
              <View style={styles.bookmarkBadge}>
                <ThemedText style={styles.bookmarkCount}>{exercise.bookmarks}</ThemedText>
              </View>
            )}
            <TouchableOpacity style={styles.actionButton}>
              <ThemedText style={styles.bookmarkIcon}>☆</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <ThemedText style={styles.infoIcon}>i</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  exercisesList: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  selectedExerciseItem: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedExercise: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: -3,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '500',
  },
  exerciseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookmarkBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
  },
  bookmarkCount: {
    fontSize: 14,
    color: '#3A3A3C',
    fontWeight: '500',
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
  },
  bookmarkIcon: {
    fontSize: 20,
    color: '#8E8E93',
  },
  infoIcon: {
    fontSize: 20,
    color: '#8E8E93',
    fontWeight: '600',
  },
}); 