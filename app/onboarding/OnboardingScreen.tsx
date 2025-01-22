import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function OnboardingScreen({ step }: { step: number }) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');

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
      onNext: () => router.push('/onboarding/2'),
    },
    {
      title: '目標を選択',
      goals: ['筋肥大', '減量', '維持'],
      button: '次へ',
      onNext: () => router.replace('/(app)/(tabs)'),
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