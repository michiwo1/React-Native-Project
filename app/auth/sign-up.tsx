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
    // Reset error message
    setErrorMessage('');

    // Email format validation (strict regex)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setErrorMessage('Please enter your email address');
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    // Display name validation
    if (!displayName) {
      setErrorMessage('Please enter your display name');
      return false;
    }
    if (displayName.length < 2) {
      setErrorMessage('Display name must be at least 2 characters');
      return false;
    }
    if (displayName.length > 20) {
      setErrorMessage('Display name must be 20 characters or less');
      return false;
    }

    // Password validation
    if (!password) {
      setErrorMessage('Please enter your password');
      return false;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setErrorMessage('Password must contain both letters and numbers');
      return false;
    }

    // Password confirmation validation
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    // Input validation
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
        const textResponse = await response.text(); // Get response as text
        
        try {
          data = JSON.parse(textResponse); // Parse as JSON
          console.log("Parsed data:", data);

          if (!response.ok) {
            if (data.message === 'Email already exists') {
              setErrorMessage('This email address is already registered');
              return;
            }
            setErrorMessage(data.message || 'Failed to sign up');
            return;
          }

          // Validate data existence
          if (!data?.data?.token || !data?.data?.user) {
            setErrorMessage('Invalid server response');
            return;
          }

          // Save session token
          await AsyncStorage.setItem('userToken', data.data.token);

          // Save user information as a string
          await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));

          // Post-signup processing
          router.push("/onboarding/1");
        } catch (parseError) {
          console.error('Parse error:', parseError);
          setErrorMessage('Communication with server failed. Please try again later.');
          return;
        }
      } catch (error) {
        console.error('Error reading response:', error);
        setErrorMessage('Failed to communicate with server. Please check your network connection.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage('Failed to communicate with server. Please check your network connection.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
      
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <Text>Already have an account? </Text>
        <Link href="/auth/sign-in" style={styles.link}>
          Sign In
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