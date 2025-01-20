import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          animation: 'none',
        }} 
      />
      <Stack.Screen 
        name="workout/plan" 
        options={{ 
          headerShown: false,
          presentation: 'modal',
          animation: Platform.select({
            ios: 'default',
            android: 'slide_from_bottom',
          }),
        }} 
      />
    </Stack>
  );
}
