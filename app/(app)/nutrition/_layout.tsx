import { Stack } from 'expo-router';

export default function NutritionLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="manual-input" 
        options={{ 
          title: '栄養成分を手動入力',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="record-meal" 
        options={{ 
          title: '食事を記録',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="ai-advice" 
        options={{ 
          title: 'AIアドバイス',
          headerShown: false,
        }} 
      />
    </Stack>
  );
} 