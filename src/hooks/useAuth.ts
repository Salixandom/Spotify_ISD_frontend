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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, isAuthenticated, logout };
};
