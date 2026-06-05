import * as SecureStore from 'expo-secure-store';

/**
 * Sensitive credential keys — NEVER persist these via AsyncStorage.
 * All session tokens, refresh tokens, MFA seeds, and passwords
 * must flow through this module only.
 */
export const SECURE_STORAGE_KEYS = {
  ACCESS_TOKEN: 'tn_access_token',
  REFRESH_TOKEN: 'tn_refresh_token',
  MFA_SEED: 'tn_mfa_seed',
  SESSION_ID: 'tn_session_id',
} as const;

export type SecureStorageKey = (typeof SECURE_STORAGE_KEYS)[keyof typeof SECURE_STORAGE_KEYS];

export type DynamicSecureStorageKey = `tn_vault_${string}`;

export class SecureStorageError extends Error {
  constructor(
    message: string,
    public readonly operation: 'get' | 'set' | 'delete',
    public readonly key: SecureStorageKey,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SecureStorageError';
  }
}

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

async function withErrorHandling<T>(
  operation: 'get' | 'set' | 'delete',
  key: SecureStorageKey,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw new SecureStorageError(
      `Secure storage ${operation} failed for key "${key}"`,
      operation,
      key,
      error,
    );
  }
}

type StorageKey = SecureStorageKey | DynamicSecureStorageKey;

export async function getSecureItem(key: StorageKey): Promise<string | null> {
  return withErrorHandling('get', key as SecureStorageKey, () =>
    SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS),
  );
}

export async function setSecureItem(key: StorageKey, value: string): Promise<void> {
  return withErrorHandling('set', key as SecureStorageKey, () =>
    SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS),
  );
}

export async function deleteSecureItem(key: StorageKey): Promise<void> {
  return withErrorHandling('delete', key as SecureStorageKey, () =>
    SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS),
  );
}

export async function clearAuthCredentials(): Promise<void> {
  await Promise.all([
    deleteSecureItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN),
    deleteSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN),
    deleteSecureItem(SECURE_STORAGE_KEYS.MFA_SEED),
    deleteSecureItem(SECURE_STORAGE_KEYS.SESSION_ID),
  ]);
}

export const secureStorage = {
  get: getSecureItem,
  set: setSecureItem,
  delete: deleteSecureItem,
  clearAuthCredentials,
  keys: SECURE_STORAGE_KEYS,
} as const;
