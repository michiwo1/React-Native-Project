import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api';


export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateInputs = () => {
    // エラーメッセージをリセット
    setErrorMessage('');

    // メールアドレスの形式チェック（より厳密な正規表現）
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setErrorMessage('メールアドレスを入力してください');
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrorMessage('有効なメールアドレスを入力してください');
      return false;
    }

    // 表示名のチェック
    if (!displayName) {
      setErrorMessage('表示名を入力してください');
      return false;
    }
    if (displayName.length < 2) {
      setErrorMessage('表示名は2文字以上で入力してください');
      return false;
    }
    if (displayName.length > 20) {
      setErrorMessage('表示名は20文字以下で入力してください');
      return false;
    }

    // パスワードのチェック
    if (!password) {
      setErrorMessage('パスワードを入力してください');
      return false;
    }
    if (password.length < 8) {
      setErrorMessage('パスワードは8文字以上で入力してください');
      return false;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setErrorMessage('パスワードは英字と数字を含める必要があります');
      return false;
    }

    // パスワード確認のチェック
    if (password !== confirmPassword) {
      setErrorMessage('パスワードが一致しません');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    // 入力値のバリデーション
    if (!validateInputs()) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
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

      let data;
      try {
        const textResponse = await response.text(); // レスポンスをテキストとして取得
        
        try {
          data = JSON.parse(textResponse); // JSONとしてパース
          console.log("Parsed data:", data);

          if (!response.ok) {
            if (data.message === 'Email already exists') {
              setErrorMessage('このメールアドレスは既に登録されています');
              return;
            }
            setErrorMessage(data.message || 'サインアップに失敗しました');
            return;
          }

          // データの存在確認を追加
          if (!data?.data?.token || !data?.data?.user) {
            setErrorMessage('サーバーからの応答が不正です');
            return;
          }

          // セッショントークンを保存
          await AsyncStorage.setItem('userToken', data.data.token);

          // ユーザー情報全体を文字列として保存
          await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));

          // サインアップ成功後の処理
          router.push("/onboarding/1");
        } catch (parseError) {
          console.error('Parse error:', parseError);
          setErrorMessage('サーバーとの通信に失敗しました。しばらく時間をおいて再度お試しください。');
          return;
        }
      } catch (error) {
        console.error('Error reading response:', error);
        setErrorMessage('サーバーとの通信に失敗しました。ネットワーク接続を確認してください。');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage('サーバーとの通信に失敗しました。ネットワーク接続を確認してください。');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>アカウント作成</Text>
      
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
      
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
  errorMessage: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 8,
  },
}); 