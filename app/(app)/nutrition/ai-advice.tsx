import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

export default function AiAdviceScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState('');

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    // ここにAI APIの呼び出しを実装
    // 仮のレスポンス
    setTimeout(() => {
      const demoAdvice = `以下の食事をお勧めします：

1. 朝食 (600kcal)
- 全粒粉トースト2枚
- ゆで卵2個
- グリーンサラダ
- 無糖ヨーグルト

2. 昼食 (700kcal)
- 鶏胸肉のグリル120g
- 玄米1膳
- 季節の温野菜
- みそ汁

3. 夕食 (600kcal)
- 白身魚の蒸し焼き
- 雑穀ご飯
- 豆腐サラダ
- きのこスープ

特記事項：
- タンパク質が豊富な食材を各食事に取り入れています
- 食物繊維の摂取を意識しています
- 良質な炭水化物を選んでいます`;
      
      setAdvice(demoAdvice);
      setLoading(false);
    }, 1500);
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
}); 