import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { SHADOWS } from '@/constants/theme';

export interface HeroBannerProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Featured surface for assignment context — solid clinical azure with soft depth.
 */
export function HeroBanner({ eyebrow, title, subtitle, children, className }: HeroBannerProps) {
  return (
    <View
      className={`overflow-hidden rounded-3xl bg-medical-500 p-5 ${className ?? ''}`}
      style={SHADOWS.featured}
    >
      <View className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <View className="absolute -bottom-12 right-10 h-28 w-28 rounded-full bg-medical-700/25" />

      {eyebrow ? (
        <Text className="text-xs font-bold uppercase tracking-[1.5px] text-medical-100">
          {eyebrow}
        </Text>
      ) : null}
      <Text className="mt-1 text-2xl font-bold tracking-tight text-white">{title}</Text>
      {subtitle ? (
        <Text className="mt-1.5 text-sm leading-5 text-medical-50">{subtitle}</Text>
      ) : null}
      {children ? <View className="mt-4">{children}</View> : null}
    </View>
  );
}
