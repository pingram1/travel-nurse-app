import { Text, View } from 'react-native';

import type { SafetyRating } from '@/types';

const gradeColors: Record<SafetyRating['overallGrade'], { bg: string; text: string }> = {
  A: { bg: 'bg-clinical-100', text: 'text-clinical-700' },
  B: { bg: 'bg-clinical-50', text: 'text-clinical-700' },
  C: { bg: 'bg-caution-100', text: 'text-caution-800' },
  D: { bg: 'bg-caution-100', text: 'text-caution-800' },
  F: { bg: 'bg-danger-100', text: 'text-danger-800' },
};

export interface SafetyBadgeProps {
  rating: SafetyRating;
}

export function SafetyBadge({ rating }: SafetyBadgeProps) {
  const colors = gradeColors[rating.overallGrade];

  return (
    <View className={`self-start rounded-full px-3.5 py-1.5 ${colors.bg}`}>
      <Text className={`text-sm font-bold ${colors.text}`}>
        Safety Grade: {rating.overallGrade}
      </Text>
    </View>
  );
}
