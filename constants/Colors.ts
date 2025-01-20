/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Colors are normalized across platforms and use explicit sRGB color space on iOS.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Color utility function for platform-specific color normalization
function normalizeColor(color: string): string {
  if (Platform.OS === 'ios') {
    // Specify sRGB color space for iOS
    return color.startsWith('#') ? `#sRGB:${color.slice(1)}` : color;
  }
  return color;
}

// Base color palette definition
const baseColors = {
  primary: '#0a7ea4',
  background: '#ffffff',
  text: '#11181C',
  icon: '#687076',
} as const;

// Platform-specific color processing
export const Colors = {
  light: {
    text: normalizeColor(baseColors.text),
    background: normalizeColor(baseColors.background),
    tint: normalizeColor(baseColors.primary),
    icon: normalizeColor(baseColors.icon),
    tabIconDefault: normalizeColor(baseColors.icon),
    tabIconSelected: normalizeColor(baseColors.primary),
  },
  dark: {
    text: normalizeColor('#ECEDEE'),
    background: normalizeColor('#151718'),
    tint: normalizeColor('#ffffff'),
    icon: normalizeColor('#9BA1A6'),
    tabIconDefault: normalizeColor('#9BA1A6'),
    tabIconSelected: normalizeColor('#ffffff'),
  },
};

// Additional color constants for the app
export const BaseColors = {
  ...baseColors,
  success: normalizeColor('#4CAF50'),
  warning: normalizeColor('#FFC107'),
  error: normalizeColor('#F44336'),
  inactive: normalizeColor('#9E9E9E'),
} as const;
