import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';

export function OnboardingScreen({ step }: { step: number }) {
  const { token } = useAuth();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');

  const handleUpdateProfile = async () => {
    try {
      console.log('Updating profile with:', {
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age),
        token
      });
      
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          height: parseFloat(height),
          weight: parseFloat(weight),
          age: parseInt(age),
        }),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`プロフィールの更新に失敗しました: ${errorData}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      router.push('/onboarding/2');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      alert(error.message || 'プロフィールの更新に失敗しました');
    }
  };

  const screens = [
    {
      title: 'ようこそ',
      subtitle: 'あなたに最適なトレーニングプランを作成します',
      button: '始める',
      onNext: () => router.push('/onboarding/1'),
    },
    {
      title: '基本情報',
      inputs: [
        { placeholder: '身長 (cm)', value: height, onChangeText: setHeight },
        { placeholder: '体重 (kg)', value: weight, onChangeText: setWeight },
        { placeholder: '年齢', value: age, onChangeText: setAge },
      ],
      button: '次へ',
      onNext: handleUpdateProfile,
    },
    {
      title: '目標を選択',
      goals: ['筋肥大', '減量', '維持'],
      button: '次へ',
      onNext: async () => {
        try {
          const response = await fetch(`${API_URL}/api/user/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              goal_type: goal,
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error('Error response:', errorData);
            throw new Error(`目標の保存に失敗しました: ${errorData}`);
          }

          router.replace('/(app)/(tabs)');
        } catch (error: any) {
          console.error('Error saving goal:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack
          });
          alert(error.message || '目標の保存に失敗しました');
        }
      },
    },
  ];

  const currentScreen = screens[step];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentScreen.title}</Text>
      {step === 0 && (
        <Text style={styles.subtitle}>{currentScreen.subtitle}</Text>
      )}
      {step === 1 && (
        <View style={styles.inputContainer}>
          {currentScreen.inputs?.map((input, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={input.placeholder}
              value={input.value}
              onChangeText={input.onChangeText}
              keyboardType={index < 2 ? 'numeric' : 'default'}
            />
          ))}
        </View>
      )}
      {step === 2 && (
        <View style={styles.goalsContainer}>
          {currentScreen.goals?.map((goalOption, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.goalButton,
                goal === goalOption && styles.selectedGoal,
              ]}
              onPress={() => setGoal(goalOption)}
            >
              <Text style={[
                styles.goalText,
                goal === goalOption && styles.selectedGoalText
              ]}>{goalOption}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Button
          label={currentScreen.button}
          onPress={currentScreen.onNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    color: '#424242',
  },
  inputContainer: {
    marginTop: 32,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  goalsContainer: {
    marginTop: 32,
    gap: 16,
  },
  goalButton: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    padding: 16,
  },
  selectedGoal: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  goalText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedGoalText: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 32,
  },
}); 