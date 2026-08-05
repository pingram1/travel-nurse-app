import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import type { AuthSession } from '@/types';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const mockSession: AuthSession = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
        user: {
          id: 'user-1',
          email,
          firstName: 'Travel',
          lastName: 'Nurse',
          role: 'nurse',
          credentialsVerified: true,
          permissions: ['vault:read', 'vault:write'],
        },
      };
      await signIn(mockSession);
      router.replace('/(tabs)/booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-surface-canvas px-6">
      <View className="mb-8 items-center">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-medical-700">
          <Text className="text-2xl font-bold text-white">+</Text>
        </View>
        <Text className="text-3xl font-bold tracking-tight text-medical-900">Travel Nurse</Text>
        <Text className="mt-1 text-base text-slate-500">Safety-first logistics for clinicians</Text>
      </View>

      <Card>
        <View className="gap-4">
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Button label="Sign In" onPress={() => void handleLogin()} loading={loading} />
        </View>
      </Card>

      <Link href="/(auth)/onboarding" className="mt-6 text-center font-semibold text-medical-600">
        New here? Complete onboarding
      </Link>
    </View>
  );
}
