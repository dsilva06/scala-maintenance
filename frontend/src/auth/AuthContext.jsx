import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { httpClient } from '@/api/httpClient';

const AuthContext = createContext(null);

async function fetchCurrentUser() {
  try {
    return await httpClient.get('/api/user');
  } catch (error) {
    if (error.status === 401) {
      return null;
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
    await httpClient.post('/api/login', credentials);
    const data = await fetchCurrentUser();
    setUser(data);
    setStatus('authenticated');
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    setError(null);
    await httpClient.post('/api/register', payload);
    const data = await fetchCurrentUser();
    setUser(data);
    setStatus('authenticated');
    return data;
  }, []);

  const logout = useCallback(async () => {
    await httpClient.post('/api/logout');
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const refresh = useCallback(async () => {
    const data = await fetchCurrentUser();
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

