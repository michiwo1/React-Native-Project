import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

type Exercise = {
  id: string;
  name: string;
};

export default function CreatePlanScreen() {
  const [planName, setPlanName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  const handleSavePlan = () => {
    // TODO: プランの保存処理を実装
    if (!planName.trim()) {
      alert('プラン名を入力してください');
      return;
    }
    if (selectedExercises.length === 0) {
      alert('エクササイズを選択してください');
      return;
    }
    
    // 保存処理後、前の画面に戻る
    router.back();
  };

  const handleAddExercise = () => {
    // エクササイズ選択画面に遷移
    router.push('/exercises?mode=select');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <TextInput
              style={styles.nameInput}
              placeholder="プラン名を入力"
              value={planName}
              onChangeText={setPlanName}
            />
          </View>
        </View>

        <ScrollView style={styles.exerciseList}>
          {selectedExercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <TouchableOpacity
                onPress={() => {
                  const newExercises = [...selectedExercises];
                  newExercises.splice(index, 1);
                  setSelectedExercises(newExercises);
                }}
              >
                <MaterialIcons name="remove-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddExercise}
          >
            <Text style={styles.buttonText}>エクササイズを追加</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePlan}
          >
            <Text style={styles.buttonText}>プランを保存</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  exerciseList: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseName: {
    fontSize: 16,
  },
  buttonContainer: {
    paddingVertical: 16,
    gap: 12,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 