import { Text, View } from 'react-native';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  return (
    <View className={`mb-3 mt-2 ${className ?? ''}`}>
      <Text className="text-lg font-bold tracking-tight text-slate-900">{title}</Text>
      {subtitle ? <Text className="mt-0.5 text-sm text-slate-500">{subtitle}</Text> : null}
    </View>
  );
}
