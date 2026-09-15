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

function optionalEnv(key: string): string | undefined {
  const value =
    (Constants.expoConfig?.extra as Record<string, string> | undefined)?.[key] ?? process.env[key];
  return value || undefined;
}

export const APP_CONFIG = {
  apiBaseUrl: requireEnv('EXPO_PUBLIC_API_BASE_URL', 'https://api.travelnurse.dev/v1'),
  apiTimeoutMs: 30_000,
  appName: 'Travel Nurse App',
  company: 'Start Right Tutoring, LLC',
  /** Optional — prefer server-side Places key via /lodging/nearby in production. */
  googlePlacesApiKey: optionalEnv('EXPO_PUBLIC_GOOGLE_PLACES_API_KEY'),
  lodgingRadiusMiles: 25,
  defaultOriginAirport: optionalEnv('EXPO_PUBLIC_DEFAULT_ORIGIN_AIRPORT') ?? 'AUS',
} as const;
