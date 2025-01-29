import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setAuthState({
        token,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading token:', error);
      setAuthState({
        token: null,
        isLoading: false,
      });
    }
  };

  const signIn = async (token: string) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      setAuthState({
        token,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setAuthState({
        token: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  return {
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.token,
    signIn,
    signOut,
  };
} 