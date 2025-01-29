import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, Slot, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '../hooks/useAuth';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (isLoading) return;

    const checkAuth = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      
      if (!storedToken && segments[0] === '(app)') {
        router.replace('/auth/sign-in');
      } else if (storedToken && segments[0] === 'auth') {
        router.replace('/(app)/(tabs)');
      }
    };

    checkAuth();
  }, [segments, isLoading, token]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/[step]" options={{ headerShown: false }} />
        <Stack.Screen 
          name="(app)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="weight-input" 
          options={{ 
            headerShown: true,
            title: '体重入力'
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
