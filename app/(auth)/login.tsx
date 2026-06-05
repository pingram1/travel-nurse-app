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
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <Text className="mb-2 text-3xl font-bold text-slate-900">Travel Nurse App</Text>
      <Text className="mb-8 text-base text-slate-600">Safety-first logistics for clinicians</Text>

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

      <Link href="/(auth)/onboarding" className="mt-6 text-center text-brand-600">
        New here? Complete onboarding
      </Link>
    </View>
  );
}
