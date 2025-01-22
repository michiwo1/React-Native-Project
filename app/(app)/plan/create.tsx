import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExerciseHeader } from '@/components/workout/ExerciseHeader';
import { SearchBar } from '@/components/workout/SearchBar';
import { CategoryFilter } from '@/components/workout/CategoryFilter';
import { ExerciseList, Exercise } from '@/components/workout/ExerciseList';
import { ExerciseFooter } from '@/components/workout/ExerciseFooter';

const categories = ['Leg', 'Chest', 'Back', 'Shoulder', 'Arms', 'Core'];

const exercises: Exercise[] = [
  { id: 1, name: 'Back Squat', category: 'Leg', bookmarks: 0 },
  { id: 2, name: 'Conventional Deadlift', category: 'Leg', bookmarks: 2 },
  { id: 3, name: 'Front Squat', category: 'Leg', bookmarks: 0 },
  { id: 4, name: 'Leg Press', category: 'Leg', bookmarks: 24 },
  { id: 5, name: 'Leg Curl', category: 'Leg', bookmarks: 1 },
];

export default function CreatePlanScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = useState('Leg');
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);

  const handleExerciseSelect = (exerciseId: number) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      }
      return [...prev, exerciseId];
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ExerciseHeader scrollY={scrollY} insets={insets} />
      <SearchBar />
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <ExerciseList
        exercises={exercises}
        selectedExercises={selectedExercises}
        onExerciseSelect={handleExerciseSelect}
        scrollY={scrollY}
      />
      <ExerciseFooter
        selectedExercises={selectedExercises}
        exercises={exercises}
        insets={insets}
        buttonText={{
          default: 'Select exercises',
          selected: 'Create plan'
        }}
        navigationType="home"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
}); 