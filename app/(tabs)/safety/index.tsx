import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { SafetyBadge } from '@/components/domain/SafetyBadge';
import { Card } from '@/components/ui';
import { buildStubSafetyRating } from '@/services/api/safetyService';
import type { SafetyRating } from '@/types';

export default function SafetyScreen() {
  const [rating, setRating] = useState<SafetyRating | null>(null);

  useEffect(() => {
    const envelope = buildStubSafetyRating({
      facilityId: 'mercy-general-001',
      facilityName: 'Mercy General Hospital',
      zipCode: '97201',
    });
    setRating(envelope.data);
  }, []);

  if (!rating) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-4">
        <Text className="text-slate-600">Loading safety intelligence…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <Text className="mb-4 text-2xl font-bold text-slate-900">Safety Intelligence</Text>
      <Card className="gap-4">
        <SafetyBadge rating={rating} />
        <Text className="text-base text-slate-700">
          BLS OSHA score: {rating.osha.oshaComplianceScore}%
        </Text>
        <Text className="text-base text-slate-700">
          NIBRS crime index: {rating.residential.crimeIndex}
        </Text>
        <Text className="text-base text-slate-700">
          Nurse-verified: {rating.nurseVerified.averageScore}/5 ({rating.nurseVerified.reviewCount}{' '}
          reviews)
        </Text>
      </Card>
    </View>
  );
}
