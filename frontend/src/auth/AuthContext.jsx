import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { httpClient } from '@/api/httpClient';

const AuthContext = createContext(null);

const DEMO_CREDENTIALS = {
  email: 'test@alca.com',
  password: 'ALCA123',
};

const DEMO_USER = {
  id: 'demo-user',
  name: 'ALCA Demo',
  email: DEMO_CREDENTIALS.email,
  role: 'admin',
};

const STORAGE_KEY = 'flota-auth-user';

function getStoredUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('Error reading stored auth state', err);
    return null;
  }
}

function persistUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error persisting auth state', err);
  }
}

async function fetchCurrentUser() {
  const storedUser = getStoredUser();

  try {
    const data = await httpClient.get('/api/auth/me');
    persistUser(data);
    return data;
  } catch (error) {
    if (error.status === 401) {
      persistUser(null);
      return null;
    }

    // If the backend is unreachable, fall back to the last known state.
    if ((error instanceof TypeError || error?.message === 'Failed to fetch') && storedUser) {
      return storedUser;
    }

    throw error;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | unauthenticated
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await fetchCurrentUser();
        if (!isMounted) return;
        setUser(data);
        setStatus(data ? 'authenticated' : 'unauthenticated');
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading current user', err);
        setError(err);
        setStatus('unauthenticated');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    const normalizedEmail = (credentials?.email ?? '').trim().toLowerCase();
    const isDemoLogin =
      normalizedEmail === DEMO_CREDENTIALS.email && credentials?.password === DEMO_CREDENTIALS.password;

    try {
      await httpClient.post('/api/auth/login', credentials);
      const data = await fetchCurrentUser();
      persistUser(data);
      setUser(data);
      setStatus(data ? 'authenticated' : 'unauthenticated');
      return data;
    } catch (err) {
      if (isDemoLogin && (err instanceof TypeError || err?.message === 'Failed to fetch')) {
        persistUser(DEMO_USER);
        setUser(DEMO_USER);
        setStatus('authenticated');
        return DEMO_USER;
      }

      persistUser(null);
      setStatus('unauthenticated');
      throw err;
    }
  }, []);

  const register = useCallback(async (payload) => {
    setError(null);
    await httpClient.post('/api/auth/register', payload);
    const data = await fetchCurrentUser();
    persistUser(data);
    setUser(data);
    setStatus(data ? 'authenticated' : 'unauthenticated');
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await httpClient.post('/api/auth/logout');
    } catch (err) {
      console.error('Error during logout', err);
    } finally {
      persistUser(null);
    }
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const refresh = useCallback(async () => {
    const data = await fetchCurrentUser();
    persistUser(data);
    setUser(data);
    setStatus(data ? 'authenticated' : 'unauthenticated');
    return data;
  }, []);

  const value = useMemo(() => ({
    user,
    status,
    error,
    login,
    register,
    logout,
    refresh,
  }), [user, status, error, login, register, logout, refresh]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
