import * as platformStorage from './platformStorage';

/**
 * Sensitive credential keys — NEVER persist these via AsyncStorage.
 * Native: Keychain/Keystore via expo-secure-store.
 * Web: sessionStorage fallback (SecureStore is unavailable on web).
 */
export const SECURE_STORAGE_KEYS = {
  ACCESS_TOKEN: 'tn_access_token',
  REFRESH_TOKEN: 'tn_refresh_token',
  MFA_SEED: 'tn_mfa_seed',
  SESSION_ID: 'tn_session_id',
} as const;

export type SecureStorageKey = (typeof SECURE_STORAGE_KEYS)[keyof typeof SECURE_STORAGE_KEYS];

export type DynamicSecureStorageKey = `tn_vault_${string}`;

export type StorageKey = SecureStorageKey | DynamicSecureStorageKey;

export class SecureStorageError extends Error {
  constructor(
    message: string,
    public readonly operation: 'get' | 'set' | 'delete',
    public readonly key: StorageKey,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SecureStorageError';
  }
}

async function withErrorHandling<T>(
  operation: 'get' | 'set' | 'delete',
  key: StorageKey,
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

export async function getSecureItem(key: StorageKey): Promise<string | null> {
  return withErrorHandling('get', key, () => platformStorage.readValue(key));
}

export async function setSecureItem(key: StorageKey, value: string): Promise<void> {
  return withErrorHandling('set', key, () => platformStorage.writeValue(key, value));
}

export async function deleteSecureItem(key: StorageKey): Promise<void> {
  return withErrorHandling('delete', key, () => platformStorage.removeValue(key));
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
