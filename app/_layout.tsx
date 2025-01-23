import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, Slot, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '../hooks/useAuth';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// 認証が必要なグループと不要なグループを定義
const PROTECTED_GROUPS = ['(app)'];
const AUTH_GROUPS = ['auth'];

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

    const inAuthGroup = segments[0] === 'auth';
    const inProtectedGroup = PROTECTED_GROUPS.includes(segments[0]);

    if (token && inAuthGroup) {
      // ログイン済みユーザーが認証画面にアクセスした場合
      router.replace('/(app)/(tabs)');
    } else if (!token && inProtectedGroup) {
      // 未ログインユーザーが保護されたルートにアクセスした場合
      router.replace('/auth/sign-in');
    }
  }, [token, segments, isLoading]);

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
