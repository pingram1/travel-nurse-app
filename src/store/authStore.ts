import { create } from 'zustand';

import type { AuthSession, User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setSession: (session) =>
    set({
      user: {
        ...session.user,
        permissions: session.user.permissions ?? ['vault:read', 'vault:write'],
      },
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
}));
