import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExerciseHeader } from '@/components/workout/ExerciseHeader';
import { SearchBar } from '@/components/workout/SearchBar';
import { CategoryFilter } from '@/components/workout/CategoryFilter';
import { ExerciseList, Exercise } from '@/components/workout/ExerciseList';
import { ExerciseFooter } from '@/components/workout/ExerciseFooter';
import { API_URL } from '@/constants/api';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { workoutSessionId } = useLocalSearchParams<{ workoutSessionId: string }>();
  const { token } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchAllExercises();
    } else {
      console.log('No token available');
    }
  }, [token]);

  useEffect(() => {
    filterExercises();
  }, [selectedCategory, allExercises]);

  const fetchCategories = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/exercise/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      const categoryNames = data.map((cat: any) => cat.name);
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAllExercises = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/exercise`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      const data = await response.json();
      console.log('Exercises data:', data);
      const exercises = data.map((exercise: any) => ({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category.name,
        bookmarks: 0
      }));
      setAllExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const filterExercises = () => {
    console.log('Filtering exercises with category:', selectedCategory);
    if (!selectedCategory) {
      setFilteredExercises(allExercises);
    } else {
      const filtered = allExercises.filter(exercise => {
        console.log(`Comparing exercise category "${exercise.category}" with selected "${selectedCategory}"`);
        return exercise.category === selectedCategory;
      });
      console.log('Filtered exercises:', filtered);
      setFilteredExercises(filtered);
    }
  };

  const handleExerciseSelect = (exerciseId: number) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      }
      return [...prev, exerciseId];
    });
  };

  const addExercisesToWorkoutSession = async (exercises: Exercise[]) => {
    if (!workoutSessionId || !token) {
      throw new Error('No workout session ID or authentication token found');
    }

    console.log('4----------');

    const response = await fetch(`${API_URL}/api/workout/${workoutSessionId}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        exerciseIds: exercises.map(e => e.id),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add exercises to workout session');
    }

    return await response.json();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ExerciseHeader scrollY={scrollY} insets={insets} title="Exercises" />
      <SearchBar />
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <ExerciseList
        exercises={filteredExercises}
        selectedExercises={selectedExercises}
        onExerciseSelect={handleExerciseSelect}
        scrollY={scrollY}
      />
      <ExerciseFooter
        selectedExercises={selectedExercises}
        exercises={filteredExercises}
        insets={insets}
        workoutSessionId={workoutSessionId}
        onAddToWorkoutSession={addExercisesToWorkoutSession}
        buttonText={workoutSessionId ? {
          default: 'Select exercises',
          selected: `Add ${selectedExercises.length} exercise${selectedExercises.length === 1 ? '' : 's'}`
        } : {
          default: 'Select exercises',
          selected: 'Create plan'
        }}
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