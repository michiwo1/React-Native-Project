import { OnboardingScreen } from './OnboardingScreen';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function OnboardingStep() {
  const { step } = useLocalSearchParams();
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <OnboardingScreen step={Number(step)} />
    </>
  );
} 