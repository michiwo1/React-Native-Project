import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';

export default function WeightInputScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [weight, setWeight] = useState('');
  const { token } = useAuth();

  const handleSave = async () => {
    try {
      const weightValue = parseFloat(weight);
      if (isNaN(weightValue)) {
        alert('有効な体重を入力してください');
        return;
      }

      const response = await fetch(`${API_URL}/api/measurement/weight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ weight: weightValue }),
      });

      if (!response.ok) {
        throw new Error('体重の記録に失敗しました');
      }

      router.back();
    } catch (error) {
      console.error('Error saving weight:', error);
      alert('体重の記録中にエラーが発生しました');
    }
  };

  const takePicture = async () => {
    try {
      // カメラの許可を要求
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('カメラの使用許可が必要です');
        return;
      }

      // カメラを起動して写真を撮影
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // OCR機能は一時的に無効化
        alert('OCR機能は現在利用できません');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('写真の撮影中にエラーが発生しました');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
      paddingTop: 60,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 24,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 16,
      fontSize: 18,
      color: colors.text,
      marginBottom: 24,
    },
    saveButton: {
      backgroundColor: colors.tint,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    scanButton: {
      backgroundColor: colors.tint,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    backButton: {
      position: 'absolute',
      top: 60,
      left: 16,
      padding: 8,
    },
    backIcon: {
      color: colors.text,
    },
    scanButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons 
          name="arrow-back" 
          size={24} 
          style={styles.backIcon}
        />
      </TouchableOpacity>
      <ThemedText style={styles.header}>体重を入力</ThemedText>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        placeholder="体重を入力 (kg)"
        placeholderTextColor={colors.text}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <ThemedText style={styles.saveButtonText}>保存</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.scanButton} onPress={takePicture}>
        <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
        <ThemedText style={styles.scanButtonText}>カメラでスキャン</ThemedText>
      </TouchableOpacity>
    </View>
  );
} 