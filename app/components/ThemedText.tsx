import React from 'react';
import { Text, TextStyle } from 'react-native';

type ThemedTextProps = {
  children: React.ReactNode;
  style?: TextStyle;
  type?: 'title' | 'subtitle' | 'body' | 'caption';
};

const styles: Record<string, TextStyle> = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
    color: '#666',
  },
};

export const ThemedText: React.FC<ThemedTextProps> = ({ children, style, type = 'body' }) => {
  return (
    <Text style={[styles[type], style]}>
      {children}
    </Text>
  );
}; 