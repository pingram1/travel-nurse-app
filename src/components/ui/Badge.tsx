import { Text, View } from 'react-native';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, { bg: string; text: string }> = {
  success: { bg: 'bg-clinical-100', text: 'text-clinical-700' },
  warning: { bg: 'bg-caution-100', text: 'text-caution-800' },
  danger: { bg: 'bg-danger-100', text: 'text-danger-800' },
  info: { bg: 'bg-medical-100', text: 'text-medical-700' },
  neutral: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export function Badge({ label, tone = 'neutral', className }: BadgeProps) {
  const colors = toneClasses[tone];

  return (
    <View className={`self-start rounded-full px-3 py-1.5 ${colors.bg} ${className ?? ''}`}>
      <Text className={`text-xs font-bold tracking-wide ${colors.text}`}>{label}</Text>
    </View>
  );
}
