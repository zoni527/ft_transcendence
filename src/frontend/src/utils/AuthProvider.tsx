import React, { useEffect, useState } from 'react';
import type { TFunction } from 'i18next';
import { AuthContext } from './AuthContext';
import { getSession, putHeartbeat } from '../api';
import { useNotification } from './NotifContext';
import type { User } from '../types/types';

type Props = {
  children: React.ReactNode;
  t: TFunction;
};

const AuthProvider = ({ children, t }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const hasRole = (roles: string[]) => {
    return user?.roles.some((r) => roles.includes(r)) ?? false;
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const me = await getSession(t);

        if (isMounted) {
          setUser(me);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void initAuth();

    return () => {
      isMounted = false;
    };
  }, [t]);

  // Heartbeat effect
  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      try {
        await putHeartbeat(t);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      }
    };

    void sendHeartbeat();

    const interval = setInterval(() => {
      void sendHeartbeat();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, t, showNotification]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
