import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, SafeAreaView, StatusBar, Platform, ActivityIndicator, Modal, TextInput } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';

// 型定義
type Exercise = {
  id: string;
  name: string;
  category_id: string;
  category: {
    id: string;
    name: string;
  };
};

type ExerciseCategory = {
  id: string;
  name: string;
  display_order: number;
};

const ExercisesScreen = () => {
  const router = useRouter();
  const { token } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        setError('認証エラー');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [exercisesRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/exercise`, {
          headers,
          method: 'GET'
        }).then(async res => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'APIエラー');
          }
          return res.json();
        }),
        fetch(`${API_URL}/api/exercise/categories`, {
          headers,
          method: 'GET'
        }).then(async res => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'APIエラー');
          }
          return res.json();
        })
      ]);
      
      setExercises(exercisesRes);
      setCategories(categoriesRes);

      // ベンチプレスを自動選択
      const benchPress = exercisesRes.find((exercise: Exercise) => exercise.name === 'Bench Press');
      if (benchPress) {
        setSelectedExerciseId(benchPress.id);
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleAddExercise = async () => {
    if (!newExerciseName.trim() || !selectedCategoryId || !token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/exercise`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newExerciseName.trim(),
          category_id: selectedCategoryId,
        }),
      });

      if (!response.ok) {
        throw new Error('種目の追加に失敗しました');
      }

      // 新しい種目を追加した後、リストを更新
      await fetchData();
      setIsModalVisible(false);
      setNewExerciseName('');
      setSelectedCategoryId('');
    } catch (err) {
      console.error('Error adding exercise:', err);
      setError(err instanceof Error ? err.message : '種目の追加に失敗しました');
    }
  };

  const handleExerciseSelect = async (exerciseId: string) => {
    try {
      setSelectedExerciseId(exerciseId);
      const response = await fetch(`${API_URL}/api/exercise/${exerciseId}/select`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('種目の選択状態の更新に失敗しました');
      }
    } catch (err) {
      console.error('Error selecting exercise:', err);
      // エラーが発生しても、UIの選択状態は維持します
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchData}
          >
            <Text style={styles.retryButtonText}>再試行</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={[styles.container, { marginBottom: 80 }]}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerText}>種目一覧</Text>
          </View>
          {categories.map((category) => (
            <View key={category.id} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              <View style={styles.cardsContainer}>
                {exercises
                  .filter((exercise) => exercise.category_id === category.id)
                  .map((exercise) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={[
                        styles.card,
                        { width: cardWidth },
                        selectedExerciseId === exercise.id && styles.selectedCard
                      ]}
                      onPress={() => handleExerciseSelect(exercise.id)}
                    >
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      {selectedExerciseId === exercise.id && (
                        <Text style={styles.selectedExerciseText}>このカードの最大重量を表示中</Text>
                      )}
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.addButtonText}>種目を追加</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>新しい種目を追加</Text>
              
              <Text style={styles.inputLabel}>カテゴリー</Text>
              <ScrollView style={styles.categoryList}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      selectedCategoryId === category.id && styles.selectedCategory
                    ]}
                    onPress={() => setSelectedCategoryId(category.id)}
                  >
                    <Text style={[
                      styles.categoryItemText,
                      selectedCategoryId === category.id && styles.selectedCategoryText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>種目名</Text>
              <TextInput
                style={styles.input}
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                placeholder="種目名を入力"
                placeholderTextColor="#999"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setIsModalVisible(false);
                    setNewExerciseName('');
                    setSelectedCategoryId('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleAddExercise}
                >
                  <Text style={styles.submitButtonText}>追加</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categorySection: {
    marginTop: 16,
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
    color: '#333',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    minHeight: 80,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedExerciseText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  categoryList: {
    maxHeight: 150,
    marginBottom: 20,
  },
  categoryItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExercisesScreen; 