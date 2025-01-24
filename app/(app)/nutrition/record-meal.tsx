import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { launchCameraAsync } from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '@/constants/api';
import FoodItemSelector from '@/app/components/nutrition/FoodItemSelector';

type MealType = {
  id: string;
  name: string;
};

type FoodItem = {
  id: string;
  name: string;
  base_quantity: number;
  base_unit: string;
  nutrients: Array<{
    nutrient_type: {
      name: string;
      unit: string;
    };
    amount_per_unit: number;
  }>;
};

type SelectedFood = {
  item: FoodItem;
  quantity: number;
};

export default function RecordMealScreen() {
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [mealDetails, setMealDetails] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [tempSelectedFood, setTempSelectedFood] = useState<FoodItem | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      setToken(storedToken);
    };
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchMealTypes();
    }
  }, [token]);

  const fetchMealTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meal/meal-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMealTypes(data);
      if (data.length > 0) {
        setSelectedMealType(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching meal types:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('エラー', 'カメラの起動に失敗しました');
    }
  };

  const handleAddFood = (item: FoodItem) => {
    setTempSelectedFood(item);
    setSelectedQuantity(item.base_quantity.toString());
  };

  const handleConfirmQuantity = () => {
    if (tempSelectedFood && selectedQuantity) {
      setSelectedFoods([
        ...selectedFoods,
        {
          item: tempSelectedFood,
          quantity: parseFloat(selectedQuantity),
        },
      ]);
      setTempSelectedFood(null);
      setSelectedQuantity('');
      setShowFoodSelector(false);
    }
  };

  const handleRemoveFood = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const calculateTotalNutrients = () => {
    const totals: { [key: string]: number } = {
      'カロリー': 0,
      'タンパク質': 0,
      '脂質': 0,
      '炭水化物': 0,
    };

    selectedFoods.forEach(({ item, quantity }) => {
      const ratio = quantity / item.base_quantity;
      item.nutrients.forEach(nutrient => {
        if (totals.hasOwnProperty(nutrient.nutrient_type.name)) {
          totals[nutrient.nutrient_type.name] += nutrient.amount_per_unit * ratio;
        }
      });
    });

    return totals;
  };

  const handleSubmit = async () => {
    if (!selectedMealType) {
      Alert.alert('エラー', '食事の種類を選択してください');
      return;
    }

    if (selectedFoods.length === 0) {
      Alert.alert('エラー', '食品を選択してください');
      return;
    }

    if (!token) {
      Alert.alert('エラー', '認証エラーが発生しました');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/meal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mealTypeId: selectedMealType,
          eatenAt: new Date().toISOString(),
          note: mealDetails,
          items: selectedFoods.map(({ item, quantity }) => ({
            foodItemId: item.id,
            quantity,
            unit: item.base_unit,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('食事の記録に失敗しました');
      }

      router.back();
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('エラー', '食事の記録に失敗しました');
    }
  };

  const totals = calculateTotalNutrients();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.title}>食事を記録</Text>
        <TouchableOpacity 
          style={[styles.headerButton, styles.saveButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.cameraButton} 
          onPress={handleTakePhoto}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <>
              <Ionicons name="camera" size={32} color="#007AFF" />
              <Text style={styles.cameraButtonText}>写真を撮影</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.formSection}>
          <Text style={styles.label}>食事の種類</Text>
          <View style={styles.mealTypeContainer}>
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === type.id && styles.mealTypeButtonSelected,
                ]}
                onPress={() => setSelectedMealType(type.id)}
              >
                <Text
                  style={[
                    styles.mealTypeButtonText,
                    selectedMealType === type.id && styles.mealTypeButtonTextSelected,
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>食品</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowFoodSelector(true)}
            >
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>

          {selectedFoods.map((food, index) => (
            <View key={index} style={styles.selectedFood}>
              <View style={styles.selectedFoodInfo}>
                <Text style={styles.selectedFoodName}>{food.item.name}</Text>
                <Text style={styles.selectedFoodQuantity}>
                  {food.quantity}{food.item.base_unit}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFood(index)}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>栄養成分</Text>
          <View style={styles.nutrientsGrid}>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>カロリー</Text>
              <Text style={styles.nutrientValue}>{Math.round(totals['カロリー'])} kcal</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>タンパク質</Text>
              <Text style={styles.nutrientValue}>{totals['タンパク質'].toFixed(1)} g</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>脂質</Text>
              <Text style={styles.nutrientValue}>{totals['脂質'].toFixed(1)} g</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>炭水化物</Text>
              <Text style={styles.nutrientValue}>{totals['炭水化物'].toFixed(1)} g</Text>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>メモ</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={mealDetails}
              onChangeText={setMealDetails}
              multiline
              numberOfLines={4}
              placeholder="メモを入力"
              placeholderTextColor="#A1A1A6"
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showFoodSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowFoodSelector(false)}
            >
              <Text style={styles.modalCancelButton}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>食品を選択</Text>
            <View style={{ width: 70 }} />
          </View>
          <FoodItemSelector onSelect={handleAddFood} />
        </SafeAreaView>
      </Modal>

      <Modal
        visible={!!tempSelectedFood}
        animationType="fade"
        transparent
      >
        <View style={styles.quantityModalContainer}>
          <View style={styles.quantityModalContent}>
            <Text style={styles.quantityModalTitle}>
              {tempSelectedFood?.name}の量を入力
            </Text>
            <View style={styles.quantityInputContainer}>
              <TextInput
                style={styles.quantityInput}
                value={selectedQuantity}
                onChangeText={setSelectedQuantity}
                keyboardType="numeric"
                placeholder="数量を入力"
              />
              <Text style={styles.quantityUnit}>
                {tempSelectedFood?.base_unit}
              </Text>
            </View>
            <View style={styles.quantityModalButtons}>
              <TouchableOpacity
                style={[styles.quantityModalButton, styles.quantityModalButtonCancel]}
                onPress={() => {
                  setTempSelectedFood(null);
                  setSelectedQuantity('');
                }}
              >
                <Text style={styles.quantityModalButtonTextCancel}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quantityModalButton, styles.quantityModalButtonConfirm]}
                onPress={handleConfirmQuantity}
              >
                <Text style={styles.quantityModalButtonTextConfirm}>確定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerButton: {
    minWidth: 70,
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  saveButton: {
    alignItems: 'flex-end',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  cameraButton: {
    height: 200,
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  cameraButtonText: {
    marginTop: 10,
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  mealTypeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    margin: 4,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  mealTypeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  mealTypeButtonText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  mealTypeButtonTextSelected: {
    color: '#FFFFFF',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#007AFF',
  },
  addButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedFood: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  selectedFoodInfo: {
    flex: 1,
  },
  selectedFoodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  selectedFoodQuantity: {
    fontSize: 14,
    color: '#8E8E93',
  },
  removeButton: {
    padding: 6,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  nutrientItem: {
    width: '50%',
    padding: 8,
  },
  nutrientLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  nutrientValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  input: {
    height: 42,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  textAreaWrapper: {
    minHeight: 120,
  },
  textArea: {
    height: undefined,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#007AFF',
    width: 70,
  },
  quantityModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityModalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  quantityModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1C1C1E',
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginRight: 10,
    fontSize: 16,
  },
  quantityUnit: {
    fontSize: 15,
    width: 40,
    color: '#8E8E93',
    textAlign: 'center',
  },
  quantityModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  quantityModalButtonCancel: {
    backgroundColor: '#F2F2F7',
  },
  quantityModalButtonConfirm: {
    backgroundColor: '#007AFF',
  },
  quantityModalButtonTextCancel: {
    fontSize: 16,
    color: '#1C1C1E',
    textAlign: 'center',
    fontWeight: '500',
  },
  quantityModalButtonTextConfirm: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
}); 