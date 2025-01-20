import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function WorkoutPlanScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Get today's date in Japanese format
  const today = new Date();
  const dateString = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← 戻る</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.dateText}>{dateString}</ThemedText>
      </View>
      
      <View style={styles.content}>
        <View style={styles.workoutSection}>
          <ThemedText style={styles.title}>Today's workout</ThemedText>
          <ThemedText style={styles.subtitle}>Plan your own workout!</ThemedText>
              
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#007AFF' }]}
            onPress={() => {/* Handle add exercises */}}
          >
            <ThemedText style={styles.buttonText}>Add exercises</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.routineSection}
          onPress={() => {/* Handle routine selection */}}
        >
          <View>
            <ThemedText style={styles.sectionTitle}>My routines</ThemedText>
            <ThemedText style={styles.routineText}>Select routine</ThemedText>
          </View>
          <ThemedText style={styles.arrow}>→</ThemedText>
        </TouchableOpacity>

        <View style={styles.restMessage}>
          <ThemedText style={styles.restText}>Today is a rest day 😢</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'column',
    gap: 8,
  },
  backButton: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  workoutSection: {
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  routineSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  routineText: {
    color: '#6B7280',
  },
  arrow: {
    fontSize: 20,
    color: '#6B7280',
  },
  restMessage: {
    alignItems: 'center',
    padding: 16,
  },
  restText: {
    fontSize: 16,
    color: '#6B7280',
  },
  bottomBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007AFF',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
}); 