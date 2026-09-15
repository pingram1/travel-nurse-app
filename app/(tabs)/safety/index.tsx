import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SafetyBadge } from '@/components/domain/SafetyBadge';
import { Badge, Button, Card, HeroBanner, SectionHeader } from '@/components/ui';
import { MOTION } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useTrip } from '@/hooks/useTrip';

function ScoreBar({
  label,
  value,
  max,
  invert = false,
}: {
  label: string;
  value: number;
  max: number;
  invert?: boolean;
}) {
  const ratio = Math.min(value / max, 1);
  const good = invert ? ratio <= 0.45 : ratio >= 0.8;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(ratio * 100, MOTION.springSoft);
  }, [progress, ratio]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, progress.value))}%`,
  }));

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-slate-700">{label}</Text>
        <Text className="text-sm font-bold text-slate-900">{value}</Text>
      </View>
      <View className="h-2.5 overflow-hidden rounded-full bg-medical-100">
        <Animated.View
          className={`h-2.5 rounded-full ${good ? 'bg-clinical-600' : 'bg-caution-600'}`}
          style={barStyle}
        />
      </View>
    </View>
  );
}

export default function SafetyScreen() {
  const router = useRouter();
  const trip = useTrip();
  const { isPro } = useAuth();

  if (!trip.hospital || !trip.safety) {
    return (
      <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-10">
        <HeroBanner
          eyebrow="Safety Intelligence"
          title="Pick a facility to unlock grades"
          subtitle="Grades combine BLS OSHA compliance, NIBRS residential crime data, and nurse-verified reviews."
        />
        <SectionHeader title="Facilities at a glance" />
        <View className="gap-3">
          {trip.hospitals.length === 0 ? (
            <Card variant="soft">
              <Text className="text-sm text-slate-600">
                Search for a hospital on the Trip Hub to load safety grades here.
              </Text>
            </Card>
          ) : (
            trip.hospitals.map((hospital) => (
              <Card key={hospital.id}>
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900">{hospital.name}</Text>
                    <Text className="text-sm text-slate-500">
                      {hospital.city}, {hospital.state}
                    </Text>
                  </View>
                  <SafetyBadge rating={hospital.safety} />
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  const { safety, hospital } = trip;

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-10">
      <HeroBanner
        eyebrow="Safety Intelligence"
        title={hospital.name}
        subtitle={`${hospital.address.street}, ${hospital.city}, ${hospital.state} ${hospital.address.zipCode}`}
      >
        <SafetyBadge rating={safety} />
      </HeroBanner>

      <Card title="Composite score breakdown" subtitle="Updated with each facility selection">
        {isPro ? (
          <View className="gap-4">
            <ScoreBar
              label="BLS OSHA compliance"
              value={safety.osha.oshaComplianceScore}
              max={100}
            />
            <ScoreBar
              label="NIBRS crime index (lower is safer)"
              value={safety.residential.crimeIndex}
              max={100}
              invert
            />
            <ScoreBar
              label={`Nurse-verified rating (${safety.nurseVerified.reviewCount} reviews)`}
              value={safety.nurseVerified.averageScore}
              max={5}
            />
          </View>
        ) : (
          <View className="gap-3">
            <Text className="text-sm leading-5 text-slate-600">
              Basic includes overall safety grade. Pro unlocks OSHA scores, the NIBRS crime index,
              and nurse-verified rating detail.
            </Text>
            <Button
              label="Upgrade to Pro"
              variant="soft"
              onPress={() => router.push('/(tabs)/profile')}
            />
          </View>
        )}
      </Card>

      <Card title="How this affects your trip">
        <View className="gap-2">
          <Text className="text-sm leading-5 text-slate-600">
            Lodging is ranked for everyone as preferred, standard, or review. Pro shows the crime
            index and weights behind those labels on each lodging card.
          </Text>
          <Badge
            label={`${trip.recommendedLodging.length} recommended · ${trip.flaggedLodging.length} flagged stays`}
            tone={trip.flaggedLodging.length > 0 ? 'warning' : 'success'}
          />
        </View>
      </Card>

      <Card title="Data sources" variant="soft">
        <View className="gap-1.5">
          <Text className="text-sm text-slate-600">· BLS OSHA workplace compliance records</Text>
          <Text className="text-sm text-slate-600">· FBI NIBRS residential crime indices</Text>
          <Text className="text-sm text-slate-600">
            · Verified reviews from credentialed nurses and physicians
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}
