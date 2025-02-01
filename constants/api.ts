import { Platform } from 'react-native';

export const API_URL = Platform.select({
  ios: process.env.EXPO_PUBLIC_API_URL,
  android: process.env.EXPO_PUBLIC_API_URL?.replace('localhost', '10.0.2.2'), // Android Studio emulator
  default: process.env.EXPO_PUBLIC_API_URL,
});