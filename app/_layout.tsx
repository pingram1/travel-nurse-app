import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/authStore';
import { secureStorage, SECURE_STORAGE_KEYS } from '@/services/secure-storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60_000,
    },
  },
});

export default function RootLayout() {
  const setLoading = useAuthStore((state) => state.setLoading);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    async function bootstrapSession() {
      try {
        const token = await secureStorage.get(SECURE_STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
          clearSession();
        }
      } finally {
        setLoading(false);
      }
    }

    void bootstrapSession();
  }, [clearSession, setLoading]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
