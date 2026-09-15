import { Text, View } from 'react-native';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  className,
}: SectionHeaderProps) {
  return (
    <View className={`mb-1 mt-1 flex-row items-end justify-between gap-3 ${className ?? ''}`}>
      <View className="flex-1">
        <Text className="text-lg font-bold tracking-tight text-slate-900">{title}</Text>
        {subtitle ? (
          <Text className="mt-0.5 text-sm leading-5 text-slate-500">{subtitle}</Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Text
          accessibilityRole="button"
          onPress={onActionPress}
          className="pb-0.5 text-sm font-bold text-medical-600"
        >
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}
