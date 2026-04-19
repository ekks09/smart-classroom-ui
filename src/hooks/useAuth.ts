import { useState, useEffect } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('sc_token');

    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user info
      api.getCurrentUser(storedToken)
        .then(userData => setUser(userData))
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem('sc_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await api.login(username, password);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('sc_token', response.token);
  };

  const register = async (username: string, password: string, email?: string, role: string = 'teacher') => {
    const response = await api.register(username, password, email, role);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('sc_token', response.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sc_token');
  };

  return {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };
};