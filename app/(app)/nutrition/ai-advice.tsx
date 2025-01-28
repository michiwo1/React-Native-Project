import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';

export default function AiAdviceScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleSubmit = async () => {
    if (!query.trim() || !token) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/ai/nutrition-advice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'アドバイスの取得に失敗しました');
      }

      const data = await response.json();
      if (!data.advice) {
        throw new Error('アドバイスデータが空でした');
      }
      setAdvice(data.advice);
    } catch (error) {
      console.error('Error getting AI advice:', error);
      setError(error instanceof Error ? error.message : 'アドバイスの取得中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← 戻る</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>AIアドバイス</Text>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>あなたの目標や状況を教えてください</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            value={query}
            onChangeText={setQuery}
            placeholder="例：筋肉をつけたいです。1日の目標カロリーは2500kcalで、タンパク質を多めに取りたいです。"
            placeholderTextColor="#666"
          />
          <TouchableOpacity 
            style={[styles.submitButton, !query.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!query.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>アドバイスを受ける</Text>
            )}
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {advice ? (
          <View style={styles.adviceSection}>
            <Text style={styles.adviceTitle}>AIからのアドバイス</Text>
            <View style={styles.adviceCard}>
              <Text style={styles.adviceText}>{advice}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.tint,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  adviceSection: {
    marginTop: 24,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  adviceCard: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
  },
  adviceText: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  errorText: {
    color: '#D00',
    fontSize: 14,
  },
}); 