import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ManualInputScreen() {
  const { token } = useAuth();
  const [mealType, setMealType] = useState('');
  const [foodCategory, setFoodCategory] = useState('');
  const [foodName, setFoodName] = useState('');
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
    { label: 'Breakfast', value: 'Breakfast' },
    { label: 'Lunch', value: 'Lunch' },
    { label: 'Dinner', value: 'Dinner' },
    { label: 'Snack', value: 'Snack' },
  ];

  const foodCategories = [
    { label: 'Staple Food', value: 'Staple Food' },
    { label: 'Protein Source', value: 'Protein Source' },
    { label: 'Vegetables', value: 'Vegetables' },
    { label: 'Fruits', value: 'Fruits' },
    { label: 'Dairy Products', value: 'Dairy Products' },
    { label: 'Seasonings & Oils', value: 'Seasonings & Oils' },
    { label: 'Beverages', value: 'Beverages' },
    { label: 'Snacks & Desserts', value: 'Snacks & Desserts' },
  ];

  const handleSubmit = async () => {
    if (!mealType) {
      alert('Please select a meal type');
      return;
    }

    if (!foodCategory) {
      alert('Please select a food category');
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
        alert('Please enter a valid date format (e.g., 2024-01-25 14:30)');
        return;
      }

      const requestData = {
        meal_type: mealType,
        food_category: foodCategory,
        food_name: foodName || 'Manual Input',
        eaten_at: date.toISOString(),
        nutrients: {
          calories: parseFloat(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
        },
        note,
      };

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
      alert('Failed to save meal. Please try again.');
    }
  };

  const handleImagePicker = async (sourceType: 'camera' | 'library') => {
    try {
      let permissionResult;
      
      if (sourceType === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          alert('Camera permission is required');
          return;
        }
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          alert('Photo library permission is required');
          return;
        }
      }

      const result = await (sourceType === 'camera' 
        ? ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          }));

      if (!result.canceled) {
        const formData = new FormData();
        const imageUri = result.assets[0].uri;
        const filename = imageUri.split('/').pop();
        
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: filename,
        } as any);
        
        try {
          const response = await fetch(`${API_URL}/api/ai/meal-analyze-image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          });

          const responseText = await response.text();

          if (!response.ok) {
            console.error('Error response:', responseText);
            throw new Error(`Failed to analyze image: ${response.status} ${responseText}`);
          }


          const data = JSON.parse(responseText);
          
          setFoodName(data.foodName || '');
          setCalories(data.nutrients?.calories?.toString() || '');
          setProtein(data.nutrients?.protein?.toString() || '');
          setCarbs(data.nutrients?.carbs?.toString() || '');
          setFat(data.nutrients?.fat?.toString() || '');
        } catch (error) {
          console.error('Error analyzing image:', error);
          alert('Failed to analyze image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to analyze image. Please try again.');
    }
  };

  const showImageSourceOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose image source',
      [
        {
          text: 'Take Photo',
          onPress: () => handleImagePicker('camera'),
        },
        {
          text: 'Choose from Library',
          onPress: () => handleImagePicker('library'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Nutrition Info</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={showImageSourceOptions}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.imagePickerButtonText}>Auto-fill with Photo</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Meal Type</Text>
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

          <Text style={styles.sectionTitle}>Food Category</Text>
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

          <Text style={styles.sectionTitle}>Food Name</Text>
          <TextInput
            style={styles.input}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="Enter food name"
          />

          <Text style={styles.sectionTitle}>Date & Time</Text>
          <TextInput
            style={styles.input}
            value={dateString}
            onChangeText={setDateString}
            placeholder="YYYY/MM/DD HH:MM"
            editable={false}
          />

          <Text style={styles.sectionTitle}>Nutrition Facts</Text>
          <View style={styles.nutrientInputContainer}>
            <View style={styles.nutrientInput}>
              <Text style={styles.label}>Calories</Text>
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
              <Text style={styles.label}>Protein</Text>
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
              <Text style={styles.label}>Carbs</Text>
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
              <Text style={styles.label}>Fat</Text>
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

          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={note}
            onChangeText={setNote}
            placeholder="Enter notes"
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
            <Text style={styles.submitButtonText}>Save</Text>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F8F8FA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
    marginTop: 0,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    marginHorizontal: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
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
    fontWeight: '600',
  },
  mealTypeButtonTextSelected: {
    color: '#fff',
  },
  nutrientInputContainer: {
    gap: 20,
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
    fontWeight: '500',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F8FA',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: '#000',
  },
  unit: {
    fontSize: 16,
    color: '#666',
    width: 40,
    fontWeight: '500',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  foodCategoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  foodCategoryButton: {
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    backgroundColor: '#F8F8FA',
    alignItems: 'center',
    marginBottom: 0,
  },
  foodCategoryButtonSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  foodCategoryButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  foodCategoryButtonTextSelected: {
    color: '#fff',
  },
  imagePickerButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
}); 