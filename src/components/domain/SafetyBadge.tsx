import { Text, View } from 'react-native';

import type { SafetyRating } from '@/types';

const gradeColors: Record<SafetyRating['overallGrade'], { bg: string; text: string }> = {
  A: { bg: 'bg-green-100', text: 'text-green-800' },
  B: { bg: 'bg-lime-100', text: 'text-green-800' },
  C: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  D: { bg: 'bg-orange-100', text: 'text-orange-800' },
  F: { bg: 'bg-red-100', text: 'text-red-800' },
};

export interface SafetyBadgeProps {
  rating: SafetyRating;
}

export function SafetyBadge({ rating }: SafetyBadgeProps) {
  const colors = gradeColors[rating.overallGrade];

  return (
    <View className={`self-start rounded-full px-3 py-1 ${colors.bg}`}>
      <Text className={`text-sm font-bold ${colors.text}`}>
        Safety Grade: {rating.overallGrade}
      </Text>
    </View>
  );
}
