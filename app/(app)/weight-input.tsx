import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';

interface WeightHistory {
  id: string;
  value: number;
  measured_at: string;
}

export default function WeightInputScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [weight, setWeight] = useState('');
  const { token } = useAuth();
  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>([]);

  const fetchWeightHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/measurement/weight/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('体重履歴の取得に失敗しました');
      }

      const data = await response.json();
      setWeightHistory(data.slice(0, 10)); // 最新10件を表示
    } catch (error) {
      console.error('Error fetching weight history:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWeightHistory();
    }
  }, [token]);

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

      await fetchWeightHistory(); // 保存後に履歴を更新
      setWeight(''); // 入力をクリア
      router.replace('/(app)/(tabs)'); // ホーム画面に戻る
    } catch (error) {
      console.error('Error saving weight:', error);
      alert('体重の記録中にエラーが発生しました');
    }
  };

  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('カメラの使用許可が必要です');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        alert('OCR機能は現在利用できません');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('写真の撮影中にエラーが発生しました');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 60,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
      marginTop: 24,
    },
    header: {
      fontSize: 22,
      fontWeight: 'bold',
      marginLeft: 24,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 18,
      color: colors.text,
      marginBottom: 24,
      marginHorizontal: 16,
      backgroundColor: colors.background,
      height: 56,
    },
    saveButton: {
      backgroundColor: colors.tint,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 32,
      height: 56,
      justifyContent: 'center',
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    backButton: {
      padding: 8,
    },
    backIcon: {
      color: colors.text,
    },
    historyContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    historyHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: colors.text,
    },
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyDate: {
      fontSize: 16,
      color: colors.text,
    },
    historyWeight: {
      fontSize: 16,
      color: colors.text,
      fontWeight: 'bold',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons 
            name="arrow-back" 
            size={24} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <ThemedText style={styles.header}>体重を入力</ThemedText>
      </View>

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

      <View style={styles.historyContainer}>
        <ThemedText style={styles.historyHeader}>履歴</ThemedText>
        {weightHistory.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <ThemedText style={styles.historyDate}>{formatDate(item.measured_at)}</ThemedText>
            <ThemedText style={styles.historyWeight}>{item.value.toFixed(1)} kg</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
} 