import api from './axios';
import type { User, AuthTokens } from '../types';
import { unwrapResponse } from '../utils/apiResponse';
import { profileAPI } from './profile';

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

    // Fetch and save user profile to localStorage
    try {
      const profile = await profileAPI.getMyProfile();
      localStorage.setItem('user', JSON.stringify({
        id: profile.user_id,
        username: profile.display_name,
        displayName: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      }));
    } catch (error) {
      console.error('Failed to fetch user profile after login:', error);
    }

    return tokens;
  },

  me: async (): Promise<User> => {
    const res = await api.get('/auth/me/');
    return unwrapResponse<User>(res.data, 'Failed to fetch user');
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};
