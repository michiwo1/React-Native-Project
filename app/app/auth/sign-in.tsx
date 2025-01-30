import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ログインに失敗しました');
      }

      await signIn(data.data.token);
      router.replace('/(app)/(tabs)');
    } catch (error) {
      Alert.alert('エラー', error instanceof Error ? error.message : 'ログインに失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="メールアドレス"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button label="ログイン" onPress={handleSignIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
}); 