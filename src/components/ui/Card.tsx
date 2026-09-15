import { Text, View, type ViewProps } from 'react-native';

import { SHADOWS } from '@/constants/theme';

import { PressableScale } from './PressableScale';

export type CardVariant = 'default' | 'featured' | 'soft' | 'selected' | 'success' | 'warning';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  title?: string;
  subtitle?: string;
  variant?: CardVariant;
  selected?: boolean;
  onPress?: () => void;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white border border-medical-100/80',
  featured: 'bg-medical-500 border border-medical-500',
  soft: 'bg-medical-50 border border-medical-100',
  selected: 'bg-medical-50 border-2 border-medical-500',
  success: 'bg-clinical-50 border border-clinical-200',
  warning: 'bg-caution-50 border border-caution-100',
};

function titleClass(variant: CardVariant) {
  return variant === 'featured' ? 'text-white' : 'text-slate-900';
}

function subtitleClass(variant: CardVariant) {
  return variant === 'featured' ? 'text-medical-100' : 'text-slate-500';
}

export function Card({
  elevated = true,
  title,
  subtitle,
  variant = 'default',
  selected = false,
  onPress,
  className,
  children,
  style,
  ...props
}: CardProps & { className?: string }) {
  const resolvedVariant: CardVariant = selected && variant === 'default' ? 'selected' : variant;
  const shadow =
    elevated === false
      ? undefined
      : resolvedVariant === 'featured'
        ? SHADOWS.featured
        : SHADOWS.card;

  const body = (
    <>
      {title ? (
        <View className="mb-3">
          <Text className={`text-base font-bold ${titleClass(resolvedVariant)}`}>{title}</Text>
          {subtitle ? (
            <Text className={`mt-0.5 text-sm ${subtitleClass(resolvedVariant)}`}>{subtitle}</Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </>
  );

  const sharedClass = `rounded-3xl p-5 ${variantClasses[resolvedVariant]} ${className ?? ''}`;

  if (onPress) {
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        className={sharedClass}
        style={[shadow, style]}
        {...props}
      >
        {body}
      </PressableScale>
    );
  }

  return (
    <View className={sharedClass} style={[shadow, style]} {...props}>
      {body}
    </View>
  );
}
