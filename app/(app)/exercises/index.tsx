import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, SafeAreaView, StatusBar, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ダミーデータの型定義
type Exercise = {
  id: number;
  name: string;
  maxWeight: number;
};

// ダミーデータ
const exerciseData: Exercise[] = [
  { id: 1, name: 'ベンチプレス', maxWeight: 80 },
  { id: 2, name: 'スクワット', maxWeight: 100 },
  { id: 3, name: 'デッドリフト', maxWeight: 120 },
  { id: 4, name: 'オーバーヘッドプレス', maxWeight: 50 },
  { id: 5, name: 'バーベルロウ', maxWeight: 70 },
  { id: 6, name: 'チンニング', maxWeight: 15 },
  { id: 7, name: 'ディップス', maxWeight: 20 },
  { id: 8, name: 'レッグプレス', maxWeight: 150 },
];

const ExercisesScreen = () => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2; // 2列のカードの幅を計算

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerText}>種目一覧</Text>
          </View>
          <View style={styles.cardsContainer}>
            {exerciseData.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={[styles.card, { width: cardWidth }]}
              >
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.maxWeight}>{exercise.maxWeight}kg</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardsContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  maxWeight: {
    fontSize: 14,
    color: '#666',
  },
});

export default ExercisesScreen; 