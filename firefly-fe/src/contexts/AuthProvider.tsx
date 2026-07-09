import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getMe, login as apiLogin, register as apiRegister, type UserProfile } from '@/api/auth';
import { clearToken, getToken, onUnauthorized, setToken } from '@/api/token';
import { AuthContext } from '@/contexts/AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getMe();
      setUser(response.data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  useEffect(() => onUnauthorized(() => setUser(null)), []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin(email, password);
      setToken(response.data.token);
      await refreshUser();
    },
    [refreshUser],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const response = await apiRegister(email, password, name);
      setToken(response.data.token);
      await refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
