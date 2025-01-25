import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';

export default function ManualInputScreen() {
  const { token } = useAuth();
  const [mealType, setMealType] = useState('');
  const [foodCategory, setFoodCategory] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [note, setNote] = useState('');
  const [dateString, setDateString] = useState(
    new Date().toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\//g, '-')
  );

  const mealTypes = [
    { label: '朝食', value: '朝食' },
    { label: '昼食', value: '昼食' },
    { label: '夕食', value: '夕食' },
    { label: '間食', value: '間食' },
  ];

  const foodCategories = [
    { label: '主食', value: '主食' },
    { label: 'タンパク源', value: 'タンパク源' },
    { label: '野菜', value: '野菜' },
    { label: '果物', value: '果物' },
    { label: '乳製品', value: '乳製品' },
    { label: '調味料・油', value: '調味料・油' },
    { label: '飲み物', value: '飲み物' },
    { label: 'お菓子・デザート', value: 'お菓子・デザート' },
  ];

  const handleSubmit = async () => {
    if (!mealType) {
      alert('食事の種類を選択してください');
      return;
    }

    if (!foodCategory) {
      alert('食品カテゴリーを選択してください');
      return;
    }

    try {
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = timePart ? timePart.split(':') : ['00', '00'];
      
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );

      if (isNaN(date.getTime())) {
        alert('正しい日付形式で入力してください（例：2024-01-25 14:30）');
        return;
      }

      const requestData = {
        meal_type: mealType,
        food_category: foodCategory,
        eaten_at: date.toISOString(),
        nutrients: {
          calories: parseFloat(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
        },
        note,
      };

      console.log('Sending request data:', requestData);

      const response = await fetch(`${API_URL}/api/meal/manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error('Failed to save meal');
      }

      router.back();
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>栄養成分を手動入力</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>食事の種類</Text>
          <View style={styles.mealTypeContainer}>
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.mealTypeButton,
                  mealType === type.value && styles.mealTypeButtonSelected
                ]}
                onPress={() => setMealType(type.value)}
              >
                <Text style={[
                  styles.mealTypeButtonText,
                  mealType === type.value && styles.mealTypeButtonTextSelected
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>食品カテゴリー</Text>
          <View style={styles.foodCategoryContainer}>
            {foodCategories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.foodCategoryButton,
                  foodCategory === category.value && styles.foodCategoryButtonSelected
                ]}
                onPress={() => setFoodCategory(category.value)}
              >
                <Text style={[
                  styles.foodCategoryButtonText,
                  foodCategory === category.value && styles.foodCategoryButtonTextSelected
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>日時</Text>
          <TextInput
            style={styles.input}
            value={dateString}
            onChangeText={setDateString}
            placeholder="YYYY/MM/DD HH:MM"
            editable={false}
          />

          <Text style={styles.sectionTitle}>栄養成分</Text>
          <View style={styles.nutrientInputContainer}>
            <View style={styles.nutrientInput}>
              <Text style={styles.label}>カロリー</Text>
              <TextInput
                style={styles.input}
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={styles.unit}>kcal</Text>
            </View>

            <View style={styles.nutrientInput}>
              <Text style={styles.label}>タンパク質</Text>
              <TextInput
                style={styles.input}
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={styles.unit}>g</Text>
            </View>

            <View style={styles.nutrientInput}>
              <Text style={styles.label}>炭水化物</Text>
              <TextInput
                style={styles.input}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={styles.unit}>g</Text>
            </View>

            <View style={styles.nutrientInput}>
              <Text style={styles.label}>脂質</Text>
              <TextInput
                style={styles.input}
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={styles.unit}>g</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>メモ</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={note}
            onChangeText={setNote}
            placeholder="メモを入力"
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              !mealType && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!mealType}
          >
            <Text style={styles.submitButtonText}>保存する</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
    marginTop: 16,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mealTypeButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F8F8FA',
    alignItems: 'center',
  },
  mealTypeButtonSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  mealTypeButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  mealTypeButtonTextSelected: {
    color: '#fff',
  },
  nutrientInputContainer: {
    gap: 16,
  },
  nutrientInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
    width: 100,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F8FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  unit: {
    fontSize: 16,
    color: '#666',
    width: 40,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  foodCategoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  foodCategoryButton: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F8F8FA',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodCategoryButtonSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  foodCategoryButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  foodCategoryButtonTextSelected: {
    color: '#fff',
  },
}); 