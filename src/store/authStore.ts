import { create } from 'zustand';

import type {
  AuthSession,
  PaymentMethodSummary,
  SubscriptionPlanId,
  SubscriptionStatus,
  User,
} from '@/types';

type ProfilePatch = Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phone' | 'avatarUri'>>;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (patch: ProfilePatch) => void;
  setAvatarUri: (uri: string | null) => void;
  subscribe: (planId: SubscriptionPlanId) => void;
  cancelSubscription: () => void;
  updatePaymentMethod: (method: PaymentMethodSummary) => void;
}

function withUserDefaults(user: User): User {
  return {
    ...user,
    permissions: user.permissions ?? ['vault:read', 'vault:write'],
    phone: user.phone ?? '',
    avatarUri: user.avatarUri ?? null,
    subscriptionPlanId: user.subscriptionPlanId ?? null,
    subscriptionStatus: user.subscriptionStatus ?? 'none',
    paymentMethod: user.paymentMethod ?? null,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setSession: (session) =>
    set({
      user: withUserDefaults(session.user),
      isAuthenticated: true,
      isLoading: false,
    }),
  clearSession: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  updateProfile: (patch) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...patch } : null,
    })),
  setAvatarUri: (avatarUri) =>
    set((state) => ({
      user: state.user ? { ...state.user, avatarUri } : null,
    })),
  subscribe: (planId) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            subscriptionPlanId: planId,
            subscriptionStatus: 'active' as SubscriptionStatus,
          }
        : null,
    })),
  cancelSubscription: () =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            subscriptionPlanId: null,
            subscriptionStatus: 'canceled' as SubscriptionStatus,
          }
        : null,
    })),
  updatePaymentMethod: (paymentMethod) =>
    set((state) => ({
      user: state.user ? { ...state.user, paymentMethod } : null,
    })),
}));
