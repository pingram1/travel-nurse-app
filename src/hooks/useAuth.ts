import { useCallback } from 'react';

import { useAuthStore } from '@/store/authStore';
import { secureStorage, SECURE_STORAGE_KEYS } from '@/services/secure-storage';
import type { AuthSession } from '@/types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setSession, clearSession } = useAuthStore();

  const signIn = useCallback(
    async (session: AuthSession) => {
      await secureStorage.set(SECURE_STORAGE_KEYS.ACCESS_TOKEN, session.accessToken);
      await secureStorage.set(SECURE_STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken);
      setSession(session);
    },
    [setSession],
  );

  const signOut = useCallback(async () => {
    await secureStorage.clearAuthCredentials();
    clearSession();
  }, [clearSession]);

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
  };
}
