import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInScreen from '@/app/auth/sign-in';
import { Alert } from 'react-native';

jest.spyOn(Alert, 'alert');

// Properly type the fetch mock
const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>;

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates empty form submission', async () => {
    const { getByText } = render(<SignInScreen />);
    
    fireEvent.press(getByText('ログイン'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'エラー',
      'メールアドレスとパスワードを入力してください'
    );
  });

  it('handles successful login', async () => {
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    
    fireEvent.changeText(getByPlaceholderText('メールアドレス'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('パスワード'), 'password123');
    
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        data: { token: 'mock-token', user: { id: '1' } }
      })
    } as Response));
    
    fireEvent.press(getByText('ログイン'));
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('handles login error', async () => {
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    
    fireEvent.changeText(getByPlaceholderText('メールアドレス'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('パスワード'), 'password123');
    
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({
        message: 'Invalid credentials'
      })
    } as Response));
    
    fireEvent.press(getByText('ログイン'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        expect.any(String)
      );
    });
  });
}); 