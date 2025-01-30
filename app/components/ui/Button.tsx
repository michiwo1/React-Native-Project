import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#5856D6',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#FFFFFF',
  },
  outlineLabel: {
    color: '#007AFF',
  },
});

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  style,
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    style,
  ];

  const labelStyles = [
    styles.label,
    styles[`${variant}Label` as keyof typeof styles],
  ];

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress}>
      <Text style={labelStyles}>{label}</Text>
    </TouchableOpacity>
  );
}; 