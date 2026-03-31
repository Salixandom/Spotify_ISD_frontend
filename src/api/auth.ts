import api from './axios';
import type { User, AuthTokens } from '../types';
import { unwrapResponse } from '../utils/apiResponse';

export const authAPI = {
  register: async (username: string, password: string): Promise<User> => {
    const res = await api.post('/auth/register/', { username, password });
    return unwrapResponse<User>(res.data, 'Registration failed');
  },

  login: async (username: string, password: string): Promise<AuthTokens> => {
    const res = await api.post('/auth/login/', { username, password });
    const tokens = unwrapResponse<AuthTokens>(res.data, 'Login failed');

    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    return tokens;
  },

  me: async (): Promise<User> => {
    const res = await api.get('/auth/me/');
    return unwrapResponse<User>(res.data, 'Failed to fetch user');
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
