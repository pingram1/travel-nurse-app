import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const WEB_STORAGE_PREFIX = 'tn_secure__';

export function isNativeSecureStoreAvailable(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export async function readValue(key: string): Promise<string | null> {
  if (isNativeSecureStoreAvailable()) {
    return SecureStore.getItemAsync(key, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  if (typeof sessionStorage === 'undefined') {
    return null;
  }

  return sessionStorage.getItem(`${WEB_STORAGE_PREFIX}${key}`);
}

export async function writeValue(key: string, value: string): Promise<void> {
  if (isNativeSecureStoreAvailable()) {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return;
  }

  if (typeof sessionStorage === 'undefined') {
    throw new Error('Session storage is unavailable in this environment');
  }

  sessionStorage.setItem(`${WEB_STORAGE_PREFIX}${key}`, value);
}

export async function removeValue(key: string): Promise<void> {
  if (isNativeSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync(key, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return;
  }

  if (typeof sessionStorage === 'undefined') {
    return;
  }

  sessionStorage.removeItem(`${WEB_STORAGE_PREFIX}${key}`);
}
