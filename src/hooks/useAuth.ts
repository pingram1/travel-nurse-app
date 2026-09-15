import { useCallback } from 'react';

import { useAuthStore } from '@/store/authStore';
import { secureStorage, SECURE_STORAGE_KEYS } from '@/services/secure-storage';
import type { AuthSession, PaymentMethodSummary, SubscriptionPlanId, User } from '@/types';
import { isProUser } from '@/utils/subscription';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    setSession,
    clearSession,
    updateProfile,
    setAvatarUri,
    subscribe,
    cancelSubscription,
    updatePaymentMethod,
  } = useAuthStore();

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
    isPro: isProUser(user),
    signIn,
    signOut,
    updateProfile: (patch: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'>>) =>
      updateProfile(patch),
    setAvatarUri,
    subscribe: (planId: SubscriptionPlanId) => subscribe(planId),
    cancelSubscription,
    updatePaymentMethod: (method: PaymentMethodSummary) => updatePaymentMethod(method),
  };
}
