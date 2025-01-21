import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';

type MealType = '朝食' | '昼食' | '夕食' | '間食';

export default function RecordMealScreen() {
  const [mealType, setMealType] = useState<MealType>('朝食');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealDetails, setMealDetails] = useState('');

  const handleSubmit = () => {
    // ここで食事記録をデータベースに保存する処理を実装
    console.log({
      mealType,
      calories,
      protein,
      carbs,
      fat,
      mealDetails,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.title}>食事を記録</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSubmit}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formSection}>
          <Text style={styles.label}>食事の種類</Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={(value) => setMealType(value)}
              value={mealType}
              items={[
                { label: '朝食', value: '朝食' },
                { label: '昼食', value: '昼食' },
                { label: '夕食', value: '夕食' },
                { label: '間食', value: '間食' },
              ]}
              style={pickerSelectStyles}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>カロリー (kcal)</Text>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            placeholder="例：500"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.nutrientsSection}>
          <View style={styles.nutrientInput}>
            <Text style={styles.label}>タンパク質 (g)</Text>
            <TextInput
              style={styles.input}
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              placeholder="例：20"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.nutrientInput}>
            <Text style={styles.label}>炭水化物 (g)</Text>
            <TextInput
              style={styles.input}
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
              placeholder="例：60"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.nutrientInput}>
            <Text style={styles.label}>脂質 (g)</Text>
            <TextInput
              style={styles.input}
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
              placeholder="例：15"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>食事の内容</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={mealDetails}
            onChangeText={setMealDetails}
            multiline
            numberOfLines={4}
            placeholder="例：玄米ご飯、サラダチキン、ブロッコリーのサラダ"
            placeholderTextColor="#666"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.tint,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  nutrientsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  nutrientInput: {
    flex: 1,
    marginHorizontal: 4,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: '#000',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: '#000',
  },
}); 