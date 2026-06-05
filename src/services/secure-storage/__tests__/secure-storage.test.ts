import * as SecureStore from 'expo-secure-store';

import {
  clearAuthCredentials,
  deleteSecureItem,
  getSecureItem,
  SECURE_STORAGE_KEYS,
  SecureStorageError,
  setSecureItem,
} from '../index';

describe('secure-storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores tokens with device-only keychain accessibility', async () => {
    await setSecureItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN, 'token-abc');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      SECURE_STORAGE_KEYS.ACCESS_TOKEN,
      'token-abc',
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
  });

  it('retrieves stored values', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('token-abc');

    const result = await getSecureItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN);

    expect(result).toBe('token-abc');
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
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      SECURE_STORAGE_KEYS.ACCESS_TOKEN,
      expect.any(Object),
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      SECURE_STORAGE_KEYS.REFRESH_TOKEN,
      expect.any(Object),
    );
  });

  it('deletes a single secure item', async () => {
    await deleteSecureItem(SECURE_STORAGE_KEYS.MFA_SEED);

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      SECURE_STORAGE_KEYS.MFA_SEED,
      expect.any(Object),
    );
  });
});
