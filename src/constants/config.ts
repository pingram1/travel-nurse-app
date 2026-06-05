import Constants from 'expo-constants';

function requireEnv(key: string, fallback?: string): string {
  const value =
    (Constants.expoConfig?.extra as Record<string, string> | undefined)?.[key] ??
    process.env[key] ??
    fallback;

  if (!value) {
    throw new Error(`Missing required configuration: ${key}`);
  }

  return value;
}

export const APP_CONFIG = {
  apiBaseUrl: requireEnv('EXPO_PUBLIC_API_BASE_URL', 'https://api.travelnurse.dev/v1'),
  apiTimeoutMs: 30_000,
  appName: 'Travel Nurse App',
  company: 'Start Right Tutoring, LLC',
} as const;
