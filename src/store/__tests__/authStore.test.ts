import { useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true });
  });

  it('sets session on sign-in', () => {
    useAuthStore.getState().setSession({
      accessToken: 'a',
      refreshToken: 'r',
      expiresAt: '2026-12-31T00:00:00.000Z',
      user: {
        id: '1',
        email: 'nurse@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'nurse',
        credentialsVerified: true,
        permissions: ['vault:read', 'vault:write'],
      },
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('nurse@example.com');
  });

  it('clears session on sign-out', () => {
    useAuthStore.getState().clearSession();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
