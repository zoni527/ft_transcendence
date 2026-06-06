import React, { useEffect, useState } from 'react';
import type { TFunction } from 'i18next';
import { AuthContext } from './AuthContext';
import { getSession, putHeartbeat } from '../api';
import type { User } from '../types/types';

type Props = {
  children: React.ReactNode;
  t: TFunction;
};

const AuthProvider = ({ children, t }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const hasRole = (roles: string[]) => {
    return user?.roles.some((r) => roles.includes(r)) ?? false;
  };

  useEffect(() => {
    const controller = new AbortController();

    const initAuth = async () => {
      try {
        const me = await getSession(t, controller.signal);
        setUser(me);
      } catch {
        if (controller.signal.aborted) return;
        setUser(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void initAuth();

    return () => {
      controller.abort();
    };
  }, [t]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  // Heartbeat effect
  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    const sendHeartbeat = async () => {
      try {
        await putHeartbeat(t, controller.signal);
      } catch {
        if (controller.signal.aborted) return;
        logout();
      }
    };

    void sendHeartbeat();

    const interval = setInterval(() => {
      if (controller.signal.aborted) return;
      void sendHeartbeat();
    }, 30000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [user, t]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
