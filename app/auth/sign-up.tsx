import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// APIのベースURL設定
const API_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          displayName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'サインアップに失敗しました');
      }

      // レスポンスデータをコンソールに出力（デバッグ用）
      console.log('サインアップレスポンス:', data);

      // セッショントークンを保存
      if (data.token) {
        await AsyncStorage.setItem('userToken', data.token);
      }

      // ユーザー情報全体を文字列として保存
      await AsyncStorage.setItem('userData', JSON.stringify(data));

      // 保存されたセッション情報をコンソールに表示（デバッグ用）
      const savedToken = await AsyncStorage.getItem('userToken');
      const savedUserData = await AsyncStorage.getItem('userData');
      console.log('保存されたトークン:', savedToken);
      console.log('保存されたユーザー情報:', savedUserData);

      // サインアップ成功後の処理
      router.push("/onboarding/1");
    } catch (error) {
      alert(error instanceof Error ? error.message : 'サインアップに失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>アカウント作成</Text>
      
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
        placeholder="表示名"
        value={displayName}
        onChangeText={setDisplayName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="パスワード（確認）"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>登録</Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <Text>すでにアカウントをお持ちの方は </Text>
        <Link href="/auth/sign-in" style={styles.link}>
          ログイン
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: '#007AFF',
  },
}); 