import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import { ReactNode } from 'react';

jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  Link: 'Link',
  Stack: 'Stack',
  Tabs: 'Tabs'
}));

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    token: 'mock-token',
    signIn: jest.fn(),
    signOut: jest.fn(),
    isLoading: false,
    isAuthenticated: true
  })
}));

// Mock API URL
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000';

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
) as jest.Mock; 
