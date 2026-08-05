import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { describePasswordPolicy } from '@/utils/validators';

export default function OnboardingScreen() {
  return (
    <View
      className="flex-1 justify-center bg-surface-canvas px-6"
      style={{ paddingVertical: SPACING.xl }}
    >
      <Text className="mb-2 font-bold text-slate-900" style={{ fontSize: TYPOGRAPHY['2xl'] }}>
        Welcome aboard
      </Text>
      <Text className="mb-8 text-slate-600" style={{ fontSize: TYPOGRAPHY.base }}>
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
          <Text className="text-sm text-slate-500">{describePasswordPolicy()}</Text>
          <Button label="Continue to Sign In" onPress={() => router.replace('/(auth)/login')} />
        </View>
      </Card>
    </View>
  );
}
