import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExerciseHeader } from '@/components/workout/ExerciseHeader';
import { SearchBar } from '@/components/workout/SearchBar';
import { CategoryFilter } from '@/components/workout/CategoryFilter';
import { ExerciseList, Exercise } from '@/components/workout/ExerciseList';
import { ExerciseFooter } from '@/components/workout/ExerciseFooter';
import { PlanNameModal } from '@/components/workout/PlanNameModal';
import { router } from 'expo-router';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';

export default function CreatePlanScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchAllExercises();
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
    if (!selectedCategory) {
      setFilteredExercises(allExercises);
    } else {
      const filtered = allExercises.filter(exercise => exercise.category === selectedCategory);
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

  const handleCreatePlan = () => {
    if (selectedExercises.length > 0) {
      setIsModalVisible(true);
    }
  };

  const handlePlanSubmit = (planName: string) => {
    // TODO: Here you would typically save the plan to your storage/backend
    const selectedExerciseData = allExercises.filter(ex => selectedExercises.includes(ex.id));
    const plan = {
      name: planName,
      exercises: selectedExerciseData,
    };
    setIsModalVisible(false);
    router.push('/(app)/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ExerciseHeader scrollY={scrollY} insets={insets} title="Create Plan" />
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
        exercises={allExercises}
        insets={insets}
        buttonText={{
          default: 'Select exercises',
          selected: 'Create plan'
        }}
        onPress={handleCreatePlan}
      />
      <PlanNameModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handlePlanSubmit}
        selectedExercises={allExercises.filter(ex => selectedExercises.includes(ex.id))}
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