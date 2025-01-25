import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';

export default function ManualInputScreen() {
  const { token } = useAuth();
  const [mealType, setMealType] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [note, setNote] = useState('');
  const [dateString, setDateString] = useState(new Date().toLocaleString('ja-JP'));

  const mealTypes = [
    { label: '朝食', value: 'breakfast' },
    { label: '昼食', value: 'lunch' },
    { label: '夕食', value: 'dinner' },
    { label: '間食', value: 'snack' },
  ];

  const handleSubmit = async () => {
    if (!mealType) {
      alert('食事の種類を選択してください');
      return;
    }

    try {
      const date = new Date(dateString);
      
      const response = await fetch(`${API_URL}/api/meal/manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meal_type: mealType,
          eaten_at: date.toISOString(),
          nutrients: {
            calories: parseFloat(calories),
            protein: parseFloat(protein),
            carbs: parseFloat(carbs),
            fat: parseFloat(fat),
          },
          note,
        }),
      });

      if (!response.ok) {
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

          <Text style={styles.sectionTitle}>日時</Text>
          <TextInput
            style={styles.input}
            value={dateString}
            onChangeText={setDateString}
            placeholder="YYYY/MM/DD HH:MM"
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#000',
    textAlign: 'center',
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
}); 