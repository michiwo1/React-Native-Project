import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import { launchCameraAsync } from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

type MealType = '朝食' | '昼食' | '夕食' | '間食';

export default function RecordMealScreen() {
  const [mealType, setMealType] = useState<MealType>('朝食');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealDetails, setMealDetails] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    try {
      const result = await launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        // ここでAI APIを呼び出して料理を分析する
        analyzeFoodImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('エラー', 'カメラの起動に失敗しました');
    }
  };

  const analyzeFoodImage = async (imageUri: string) => {
    try {
      // ローディング状態を表示
      Alert.alert('分析中', 'AIが料理を分析しています...');

      // 画像をBase64に変換
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // AI APIにリクエストを送信
      const apiResponse = await fetch('YOUR_AI_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
          image: base64,
          // 他の必要なパラメータ
        })
      });

      const data = await apiResponse.json();

      // APIレスポンスを使用してフォームを更新
      setMealDetails(data.foodName);
      setCalories(data.calories.toString());
      setProtein(data.protein.toString());
      setCarbs(data.carbs.toString());
      setFat(data.fat.toString());

    } catch (error) {
      Alert.alert('エラー', '料理の分析に失敗しました');
      console.error(error);
    }
  };

  const handleSubmit = () => {
    // ここで食事記録をデータベースに保存する処理を実装
    console.log({
      mealType,
      calories,
      protein,
      carbs,
      fat,
      mealDetails,
      image,
    });
    router.back();
  };

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
              <Text style={styles.cameraSubText}>AIが料理を分析します</Text>
            </>
          )}
        </TouchableOpacity>

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
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="例：500"
              placeholderTextColor="#A1A1A6"
            />
          </View>
        </View>

        <View style={styles.nutrientsSection}>
          <View style={styles.nutrientInput}>
            <Text style={styles.label}>タンパク質 (g)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                placeholder="例：20"
                placeholderTextColor="#A1A1A6"
              />
            </View>
          </View>

          <View style={styles.nutrientInput}>
            <Text style={styles.label}>炭水化物 (g)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                placeholder="例：60"
                placeholderTextColor="#A1A1A6"
              />
            </View>
          </View>

          <View style={styles.nutrientInput}>
            <Text style={styles.label}>脂質 (g)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                placeholder="例：15"
                placeholderTextColor="#A1A1A6"
              />
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>食事の内容</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={mealDetails}
              onChangeText={setMealDetails}
              multiline
              numberOfLines={4}
              placeholder="例：玄米ご飯、サラダチキン、ブロッコリーのサラダ"
              placeholderTextColor="#A1A1A6"
              textAlignVertical="top"
            />
          </View>
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
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerButton: {
    padding: 8,
    minWidth: 70,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    alignItems: 'flex-end',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    backgroundColor: '#F9F9FB',
    overflow: 'hidden',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    backgroundColor: '#F9F9FB',
    overflow: 'hidden',
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#000',
  },
  textAreaWrapper: {
    minHeight: 120,
  },
  textArea: {
    minHeight: 120,
  },
  nutrientsSection: {
    flexDirection: 'row',
    marginBottom: 28,
    gap: 12,
  },
  nutrientInput: {
    flex: 1,
  },
  cameraButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  cameraButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  cameraSubText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 4,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
  iconContainer: {
    top: 16,
    right: 12,
  },
}); 