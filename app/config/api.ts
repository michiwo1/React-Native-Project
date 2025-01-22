const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const api = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
}; 