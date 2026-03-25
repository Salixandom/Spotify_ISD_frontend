import api from './axios';
import type { User, AuthTokens } from '../types';

export const authAPI = {
  register: async (username: string, password: string): Promise<User> => {
    const res = await api.post('/auth/register/', { username, password });
    return res.data;
  },

  login: async (username: string, password: string): Promise<AuthTokens> => {
    const res = await api.post('/auth/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    return res.data;
  },

  me: async (): Promise<User> => {
    const res = await api.get('/auth/me/');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
