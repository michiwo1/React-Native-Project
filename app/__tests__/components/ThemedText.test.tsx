import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '@/components/ThemedText';

describe('ThemedText', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('applies style prop correctly', () => {
    const { getByText } = render(
      <ThemedText style={{ fontSize: 20 }}>Styled Text</ThemedText>
    );
    const textElement = getByText('Styled Text');
    expect(textElement.props.style).toContainEqual({ fontSize: 20 });
  });

  it('applies theme type correctly', () => {
    const { getByText } = render(
      <ThemedText type="title">Title Text</ThemedText>
    );
    const textElement = getByText('Title Text');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ fontWeight: 'bold' })
    );
  });
}); 