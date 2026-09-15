import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, Input } from '@/components/ui';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import type { AuthSession } from '@/types';
import { getUserFacingMessage, normalizeError } from '@/utils/errorHandler';
import { namesFromEmail } from '@/utils/userDisplay';
import { loginSchema } from '@/utils/validators';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? 'Invalid credentials';
      setError(first);
      return;
    }

    setLoading(true);
    try {
      const mockSession: AuthSession = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
        user: {
          id: 'user-1',
          email: parsed.data.email,
          ...namesFromEmail(parsed.data.email),
          role: 'nurse',
          credentialsVerified: true,
          permissions: ['vault:read', 'vault:write'],
        },
      };
      await signIn(mockSession);
      router.replace('/(tabs)/booking');
    } catch (err) {
      setError(getUserFacingMessage(normalizeError(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-surface-canvas px-6">
      <View className="absolute -left-16 top-16 h-56 w-56 rounded-full bg-medical-100/70" />
      <View className="absolute -right-20 bottom-24 h-64 w-64 rounded-full bg-clinical-100/50" />

      <View className="mb-8 items-center">
        <View
          className="mb-4 h-16 w-16 items-center justify-center rounded-3xl bg-medical-500"
          style={SHADOWS.featured}
        >
          <Ionicons name="medkit" size={30} color="#ffffff" />
        </View>
        <Text className="text-3xl font-bold tracking-tight text-medical-900">Travel Nurse</Text>
        <Text className="mt-1.5 text-center text-base text-slate-500">
          Safety-first logistics for clinicians on assignment
        </Text>
      </View>

      <Card elevated>
        <View className="gap-4">
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@hospital.org"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          {error ? (
            <View className="rounded-2xl bg-danger-50 px-3 py-2">
              <Text className="text-sm font-medium text-danger-600">{error}</Text>
            </View>
          ) : null}
          <Button label="Sign In" onPress={() => void handleLogin()} loading={loading} />
        </View>
      </Card>

      <Link
        href="/(auth)/onboarding"
        className="mt-6 text-center text-base font-bold text-medical-600"
      >
        New here? Complete onboarding
      </Link>

      <View className="mt-8 flex-row items-center justify-center gap-2">
        <Ionicons name="shield-checkmark" size={14} color={COLORS.clinical[600]} />
        <Text className="text-xs font-medium text-slate-500">
          Credentials stay on-device in secure storage
        </Text>
      </View>
    </View>
  );
}
