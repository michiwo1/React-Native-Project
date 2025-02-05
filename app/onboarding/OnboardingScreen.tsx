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
  const [errors, setErrors] = useState({
    height: '',
    weight: '',
    age: '',
  });

  const validateNumber = (value: string, min: number, max: number, field: string) => {
    if (value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return `Please enter a number`;
    if (num < min) return `Please enter a value greater than ${min}`;
    if (num > max) return `Please enter a value less than ${max}`;
    return '';
  };

  const handleInputChange = (value: string, setter: (value: string) => void, field: string) => {
    // 数字とバックスペースのみを許可
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }

    setter(value);
    
    let error = '';
    switch (field) {
      case 'height':
        error = validateNumber(value, 100, 250, 'Height');
        break;
      case 'weight':
        error = validateNumber(value, 30, 200, 'Weight');
        break;
      case 'age':
        error = validateNumber(value, 13, 100, 'Age');
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleUpdateProfile = async () => {
    // Check if all fields are filled
    if (!height || !weight || !age) {
      alert('Please fill in all fields');
      return;
    }

    // Check for errors
    if (errors.height || errors.weight || errors.age) {
      alert('Please check your input');
      return;
    }

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
        throw new Error(`Failed to update profile: ${errorData}`);
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
      alert(error.message || 'Failed to update profile');
    }
  };

  const screens = [
    {
      title: 'Welcome',
      subtitle: 'Let\'s create your personalized training plan',
      button: 'Get Started',
      onNext: () => router.push('/onboarding/1'),
    },
    {
      title: 'Basic Information',
      inputs: [
        { 
          placeholder: 'Height (cm)', 
          value: height, 
          onChangeText: (value: string) => handleInputChange(value, setHeight, 'height'),
          error: errors.height
        },
        { 
          placeholder: 'Weight (kg)', 
          value: weight, 
          onChangeText: (value: string) => handleInputChange(value, setWeight, 'weight'),
          error: errors.weight
        },
        { 
          placeholder: 'Age', 
          value: age, 
          onChangeText: (value: string) => handleInputChange(value, setAge, 'age'),
          error: errors.age
        },
      ],
      button: 'Next',
      onNext: handleUpdateProfile,
    },
    {
      title: 'Select Your Goal',
      goals: ['Muscle Gain', 'Weight Loss', 'Maintenance'],
      button: 'Next',
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
            throw new Error(`Failed to save goal: ${errorData}`);
          }

          router.replace('/(app)/(tabs)');
        } catch (error: any) {
          console.error('Error saving goal:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack
          });
          alert(error.message || 'Failed to save goal');
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
            <View key={index} style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, input.error && styles.inputError]}
                placeholder={input.placeholder}
                value={input.value}
                onChangeText={input.onChangeText}
                keyboardType="numeric"
              />
              {input.error ? (
                <Text style={styles.errorText}>{input.error}</Text>
              ) : null}
            </View>
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
  inputWrapper: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 4,
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