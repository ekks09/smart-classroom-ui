import { useEffect, useMemo, useState } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';
import { config } from '@/lib/config';

const TOKEN_KEY = 'sc_token';
const USER_KEY = 'sc_user';
const USERS_KEY = 'sc_users';

type LocalUserRecord = User & { password: string };

const safeJsonParse = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const isNotFound = (err: any) => {
  const status = err?.status;
  const message = String(err?.message || '');
  return status === 404 || /not found/i.test(message);
};

const getLocalUsers = (): LocalUserRecord[] => {
  if (typeof window === 'undefined') return [];
  const list = safeJsonParse<LocalUserRecord[]>(localStorage.getItem(USERS_KEY));
  return Array.isArray(list) ? list : [];
};

const setLocalUsers = (users: LocalUserRecord[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const persistSession = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    return safeJsonParse<User>(localStorage.getItem(USER_KEY));
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    const hasUser = !!localStorage.getItem(USER_KEY);
    return hasToken && !hasUser;
  });

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  // If token exists but user is missing, try to resolve from backend (if auth exists).
  useEffect(() => {
    if (!token || user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api.getCurrentUser(token)
      .then((userData) => {
        if (cancelled) return;
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      })
      .catch((err: any) => {
        if (cancelled) return;
        console.warn('[Auth] Failed to validate token:', err?.message || err);
        clearSession();
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const login = async (username: string, password: string) => {
    // Prefer backend auth if available.
    try {
      const response = await api.login(username, password);
      setToken(response.token);
      setUser(response.user);
      persistSession(response.token, response.user);
      return response;
    } catch (err: any) {
      // Fallback: local auth (for backends that only expose /ask, /generate-semester, /docs).
      if (isNotFound(err)) {
        const demoOk = username === config.demo.username && password === config.demo.password;

        const localUsers = getLocalUsers();
        const record = demoOk
          ? ({
              id: 'demo_teacher',
              username: config.demo.username,
              email: undefined,
              role: 'teacher',
              password: config.demo.password,
            } satisfies LocalUserRecord)
          : localUsers.find((u) => u.username === username && u.password === password);

        if (!record) {
          throw new Error(
            'Auth endpoint not found on backend. Register a local account first, or add backend auth routes.'
          );
        }

        const localToken = `local_${record.id}`;
        const localUser: User = {
          id: record.id,
          username: record.username,
          email: record.email,
          role: record.role,
        };

        setToken(localToken);
        setUser(localUser);
        persistSession(localToken, localUser);

        return { token: localToken, user: localUser };
      }

      clearSession();
      setToken(null);
      setUser(null);
      throw err;
    }
  };

  const register = async (
    username: string,
    password: string,
    email?: string,
    role: string = 'teacher'
  ) => {
    try {
      const response = await api.register(username, password, email, role);
      setToken(response.token);
      setUser(response.user);
      persistSession(response.token, response.user);
      return response;
    } catch (err: any) {
      if (isNotFound(err)) {
        const localUsers = getLocalUsers();
        if (localUsers.some((u) => u.username === username)) {
          throw new Error('Username already exists (local). Please choose another.');
        }

        const id =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `local_${Date.now()}`;

        const localUser: User = {
          id,
          username,
          email,
          role: role as User['role'],
        };

        const record: LocalUserRecord = { ...localUser, password };
        setLocalUsers([...localUsers, record]);

        const localToken = `local_${id}`;
        setToken(localToken);
        setUser(localUser);
        persistSession(localToken, localUser);

        return { token: localToken, user: localUser };
      }

      clearSession();
      setToken(null);
      setUser(null);
      throw err;
    }
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  return {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };
};

