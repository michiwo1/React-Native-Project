import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[
        styles.headerBackground,
        {
          opacity: headerOpacity,
          paddingTop: insets.top,
        }
      ]} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Add exercises</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <ThemedText style={styles.searchIcon}>🔍</ThemedText>
          <TextInput
            style={styles.searchInput}
            placeholder="Find exercise"
            placeholderTextColor="#8E8E93"
          />
        </View>
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
          <View style={[styles.checkbox, showBookmarksOnly && styles.checkedBox]}>
            {showBookmarksOnly && <ThemedText style={styles.checkmark}>✓</ThemedText>}
          </View>
          <ThemedText style={styles.filterText}>Bookmarks only</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton}>
          <ThemedText style={styles.sortIcon}>↕️</ThemedText>
          <ThemedText style={styles.filterText}>Sort</ThemedText>
        </TouchableOpacity>
      </View>

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
            onPress={() => handleExerciseSelect(exercise.id)}
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

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.newButton}>
          <ThemedText style={styles.newButtonText}>＋ New</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.selectButton,
            selectedExercises.length > 0 && styles.selectButtonActive
          ]}
          onPress={() => {
            if (selectedExercises.length > 0) {
              const selectedExerciseData = exercises.filter(ex => selectedExercises.includes(ex.id));
              router.push({
                pathname: '/workout/log',
                params: { exercises: JSON.stringify(selectedExerciseData) }
              });
            }
          }}
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
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#8E8E93',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 17,
    color: '#000000',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryButton: {
    flex: 1,
    minWidth: '30%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  bookmarkFilter: {
    flexDirection: 'row',
    alignItems: 'center',
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
  checkedBox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: -3,
  },
  filterText: {
    fontSize: 17,
    color: '#3A3A3C',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortIcon: {
    fontSize: 16,
    marginRight: 4,
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
  checkedExercise: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
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