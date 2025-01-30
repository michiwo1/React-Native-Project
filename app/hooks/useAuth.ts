import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (newToken: string) => {
    try {
      await AsyncStorage.setItem('token', newToken);
      setToken(newToken);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    token,
    isLoading,
    isAuthenticated: !!token,
    signIn,
    signOut,
  };
};
