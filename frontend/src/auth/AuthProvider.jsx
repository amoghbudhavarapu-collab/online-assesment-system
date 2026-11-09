import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAccessToken, clearAccessToken } from './tokenStore';
import { refreshSession } from '../lib/api/client';
import * as authApi from '../lib/api/auth';

const AuthContext = createContext(null);

function extractSession(payload) {
  const data = payload?.user ? payload : payload || {};
  return {
    user: data.user || data,
    accessToken: data.accessToken || data.token
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((payload) => {
    const { user: nextUser, accessToken } = extractSession(payload);
    if (accessToken) setAccessToken(accessToken);
    setUser(nextUser || null);
    return nextUser;
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      const session = await refreshSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        const me = await authApi.getMe();
        setUser(me);
      }
    } catch {
      clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      clearAccessToken();
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const payload = await authApi.login({ email, password });
      return applySession(payload);
    },
    [applySession]
  );

  const register = useCallback(
    async (form) => {
      const payload = await authApi.register(form);
      return applySession(payload);
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* cookie may already be gone */
    }
    clearAccessToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.getMe();
    setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser, setUser }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
