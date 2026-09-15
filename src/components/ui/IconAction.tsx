import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { COLORS, SHADOWS } from '@/constants/theme';

import { PressableScale } from './PressableScale';

export interface IconActionProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tone?: 'medical' | 'clinical' | 'neutral';
}

const toneMap = {
  medical: { well: 'bg-medical-100', icon: COLORS.medical[600] },
  clinical: { well: 'bg-clinical-100', icon: COLORS.clinical[700] },
  neutral: { well: 'bg-slate-100', icon: COLORS.neutral[700] },
} as const;

/** Circular shortcut action — category wells from premium healthcare UIs. */
export function IconAction({ label, icon, onPress, tone = 'medical' }: IconActionProps) {
  const colors = toneMap[tone];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="min-w-[72px] flex-1 items-center gap-2"
      contentClassName="items-center gap-2"
      scaleTo={0.94}
    >
      <View
        className={`h-14 w-14 items-center justify-center rounded-full ${colors.well}`}
        style={SHADOWS.soft}
      >
        <Ionicons name={icon} size={24} color={colors.icon} />
      </View>
      <Text className="text-center text-xs font-semibold text-slate-700" numberOfLines={2}>
        {label}
      </Text>
    </PressableScale>
  );
}
