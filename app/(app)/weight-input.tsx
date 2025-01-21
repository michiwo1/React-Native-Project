import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';

export default function WeightInputScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [weight, setWeight] = useState('');

  const handleSave = () => {
    // TODO: 体重を保存する処理を実装
    router.back();
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
    </View>
  );
} 