import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Card, HeroBanner } from '@/components/ui';
import { COLORS, SHADOWS } from '@/constants/theme';
import { describePasswordPolicy } from '@/utils/validators';

const STEPS = [
  {
    icon: 'lock-closed' as const,
    title: 'Credential Vault',
    body: 'Upload licenses (BLS, ACLS, RN) into hardware-backed storage.',
  },
  {
    icon: 'calculator' as const,
    title: 'Stipend Tracker',
    body: 'Configure housing stipend and tax-home preferences.',
  },
  {
    icon: 'shield-checkmark' as const,
    title: 'Safety routing',
    body: 'Enable OSHA and crime-aware filters for every assignment.',
  },
];

export default function OnboardingScreen() {
  return (
    <View className="flex-1 justify-center bg-surface-canvas px-6">
      <HeroBanner
        eyebrow="Welcome aboard"
        title="Built for 13-week contracts"
        subtitle="One flow for flights, lodging, food, rides, and credentials — with safety first."
      />

      <View className="mt-5 gap-3">
        {STEPS.map((step) => (
          <Card key={step.title} elevated className="flex-row items-start gap-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl bg-medical-100"
              style={SHADOWS.soft}
            >
              <Ionicons name={step.icon} size={20} color={COLORS.medical[600]} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-900">{step.title}</Text>
              <Text className="mt-0.5 text-sm leading-5 text-slate-500">{step.body}</Text>
            </View>
          </Card>
        ))}
      </View>

      <Text className="mt-4 text-center text-xs text-slate-500">{describePasswordPolicy()}</Text>

      <View className="mt-5">
        <Button label="Continue to Sign In" onPress={() => router.replace('/(auth)/login')} />
      </View>
    </View>
  );
}
