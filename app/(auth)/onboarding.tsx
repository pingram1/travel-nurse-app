import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';

export default function OnboardingScreen() {
  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <Text className="mb-2 text-2xl font-bold text-slate-900">Welcome aboard</Text>
      <Text className="mb-8 text-base text-slate-600">
        Set up your credential vault, stipend tracker, and safety-first booking preferences.
      </Text>

      <Card>
        <View className="gap-4">
          <Text className="text-base text-slate-700">
            1. Upload licenses (BLS, ACLS, RN) to your Credential Vault
          </Text>
          <Text className="text-base text-slate-700">
            2. Configure stipend and housing preferences
          </Text>
          <Text className="text-base text-slate-700">
            3. Enable OSHA and crime-aware routing for every assignment
          </Text>
          <Button label="Continue to Sign In" onPress={() => router.replace('/(auth)/login')} />
        </View>
      </Card>
    </View>
  );
}
