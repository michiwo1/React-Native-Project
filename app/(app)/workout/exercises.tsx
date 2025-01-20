import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import { useState } from 'react';

const categories = ['Leg', 'Chest', 'Back', 'Shoulder', 'Arms', 'Core'];

const exercises = [
  { id: 1, name: 'Back Squat', category: 'Leg', bookmarks: 0 },
  { id: 2, name: 'Conventional Deadlift', category: 'Leg', bookmarks: 2 },
  { id: 3, name: 'Front Squat', category: 'Leg', bookmarks: 0 },
  { id: 4, name: 'Leg Press', category: 'Leg', bookmarks: 24 },
  { id: 5, name: 'Leg Curl', category: 'Leg', bookmarks: 1 },
  { id: 6, name: 'Leg Extension', category: 'Leg', bookmarks: 9 },
  { id: 7, name: 'Dumbbell Lunge', category: 'Leg', bookmarks: 0 },
  { id: 8, name: 'Sumo Deadlift', category: 'Leg', bookmarks: 0 },
  { id: 9, name: 'Standing Calf Raise', category: 'Leg', bookmarks: 0 },
];

export default function ExercisesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Leg');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Add exercises</ThemedText>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Find exercise"
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <ThemedText style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText,
            ]}>
              {category}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.bookmarkFilter}
          onPress={() => setShowBookmarksOnly(!showBookmarksOnly)}
        >
          <View style={[styles.checkbox, showBookmarksOnly && styles.checkedBox]} />
          <ThemedText style={styles.filterText}>Bookmarks only</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton}>
          <ThemedText style={styles.filterText}>Sort</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.exercisesList}>
        {exercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseItem}
            onPress={() => handleExerciseSelect(exercise.id)}
          >
            <View style={styles.exerciseLeft}>
              <View 
                style={[
                  styles.checkbox,
                  selectedExercises.includes(exercise.id) && styles.checkedExercise
                ]}
              />
              <View style={styles.exerciseIcon} />
              <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
            </View>
            <View style={styles.exerciseRight}>
              {exercise.bookmarks > 0 && (
                <ThemedText style={styles.bookmarkCount}>{exercise.bookmarks}</ThemedText>
              )}
              <TouchableOpacity>
                <ThemedText style={styles.bookmarkIcon}>☆</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity>
                <ThemedText style={styles.infoIcon}>i</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.newButton}>
          <ThemedText style={styles.newButtonText}>New</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.selectButton,
            selectedExercises.length > 0 && styles.selectButtonActive
          ]}
          disabled={selectedExercises.length === 0}
        >
          <ThemedText style={[
            styles.selectButtonText,
            selectedExercises.length > 0 && styles.selectButtonTextActive
          ]}>
            {selectedExercises.length === 0
              ? 'Select exercises'
              : `Add ${selectedExercises.length} exercise${selectedExercises.length === 1 ? '' : 's'}`}
          </ThemedText>
        </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  youtubeText: {
    color: '#007AFF',
    fontSize: 17,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 10,
    fontSize: 17,
    height: 36,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderRadius: 16,
    height: 28,
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
  },
  selectedCategory: {
    backgroundColor: '#1C1C1E',
  },
  categoryText: {
    fontSize: 15,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  bookmarkFilter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 4,
    marginRight: 8,
  },
  checkedBox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 17,
    color: '#3A3A3C',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    borderBottomColor: '#E5E5EA',
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 17,
  },
  exerciseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookmarkCount: {
    fontSize: 17,
    color: '#8E8E93',
  },
  bookmarkIcon: {
    fontSize: 24,
    color: '#8E8E93',
  },
  infoIcon: {
    fontSize: 24,
    color: '#8E8E93',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  newButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  newButtonText: {
    fontSize: 17,
  },
  checkedExercise: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  selectButtonActive: {
    backgroundColor: '#007AFF',
  },
  selectButtonText: {
    fontSize: 17,
    color: '#8E8E93',
  },
  selectButtonTextActive: {
    color: '#FFFFFF',
  },
}); 