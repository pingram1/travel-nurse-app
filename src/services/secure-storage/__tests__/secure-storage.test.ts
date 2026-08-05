import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  clearAuthCredentials,
  deleteSecureItem,
  getSecureItem,
  SECURE_STORAGE_KEYS,
  SecureStorageError,
  setSecureItem,
} from '../index';
import * as platformStorage from '../platformStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
}));

describe('secure-storage', () => {
  const sessionStore = new Map<string, string>();

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
    sessionStore.clear();

    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => sessionStore.get(key) ?? null,
        setItem: (key: string, value: string) => {
          sessionStore.set(key, value);
        },
        removeItem: (key: string) => {
          sessionStore.delete(key);
        },
        clear: () => {
          sessionStore.clear();
        },
      },
    });
  });

  it('stores tokens with device-only keychain accessibility on native', async () => {
    await setSecureItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN, 'token-abc');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      SECURE_STORAGE_KEYS.ACCESS_TOKEN,
      'token-abc',
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
  });

  it('uses sessionStorage on web', async () => {
    Platform.OS = 'web';
    await setSecureItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN, 'token-web');

    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(sessionStore.get('tn_secure__tn_access_token')).toBe('token-web');
  });

  it('retrieves stored values on native', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('token-abc');

    const result = await getSecureItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN);

    expect(result).toBe('token-abc');
  });

  it('retrieves stored values on web', async () => {
    Platform.OS = 'web';
    sessionStore.set('tn_secure__tn_access_token', 'token-web');

    const result = await getSecureItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN);

    expect(result).toBe('token-web');
  });

  it('wraps native errors in SecureStorageError', async () => {
    (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('Keychain unavailable'));

    await expect(setSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN, 'x')).rejects.toBeInstanceOf(
      SecureStorageError,
    );
  });

  it('clears all auth credentials on sign-out', async () => {
    await clearAuthCredentials();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(4);
  });

  it('deletes a single secure item', async () => {
    await deleteSecureItem(SECURE_STORAGE_KEYS.MFA_SEED);

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      SECURE_STORAGE_KEYS.MFA_SEED,
      expect.any(Object),
    );
  });

  it('reports native secure store availability by platform', () => {
    Platform.OS = 'ios';
    expect(platformStorage.isNativeSecureStoreAvailable()).toBe(true);

    Platform.OS = 'web';
    expect(platformStorage.isNativeSecureStoreAvailable()).toBe(false);
  });
});
