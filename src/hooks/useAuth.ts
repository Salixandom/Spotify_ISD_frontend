import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api/auth';

export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !user) {
      authAPI.me().then(setUser).catch(logout);
    }
  }, []);

  return { user, isAuthenticated, logout };
};
