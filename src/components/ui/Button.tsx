import { ActivityIndicator, Text, View, type PressableProps, type ViewStyle } from 'react-native';

import { COLORS, SHADOWS, TOUCH_TARGET_MIN } from '@/constants/theme';

import { PressableScale } from './PressableScale';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'soft';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-medical-500',
  secondary: 'bg-white border border-medical-200',
  soft: 'bg-medical-100',
  ghost: 'bg-transparent',
  danger: 'bg-danger-600',
  success: 'bg-clinical-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2.5 min-h-[40px] rounded-2xl',
  md: 'px-5 py-3.5 rounded-2xl',
  lg: 'px-6 py-4 min-h-[56px] rounded-3xl',
};

const sizeMinHeight: Record<ButtonSize, number | undefined> = {
  sm: undefined,
  md: TOUCH_TARGET_MIN,
  lg: undefined,
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-medical-700',
  soft: 'text-medical-700',
  ghost: 'text-medical-600',
  danger: 'text-white',
  success: 'text-white',
};

const spinnerColor: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  secondary: COLORS.medical[700],
  soft: COLORS.medical[700],
  ghost: COLORS.medical[600],
  danger: '#ffffff',
  success: '#ffffff',
};

function shadowFor(variant: ButtonVariant, isDisabled: boolean): ViewStyle | undefined {
  if (isDisabled) return undefined;
  if (variant === 'primary' || variant === 'success') return { ...SHADOWS.featured };
  if (variant === 'secondary' || variant === 'soft') return { ...SHADOWS.soft };
  return undefined;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  const isDisabled = Boolean(disabled || loading);
  const minHeight = sizeMinHeight[size];
  const shadow = shadowFor(variant, isDisabled);
  const style: ViewStyle = {
    ...(minHeight ? { minHeight } : {}),
    ...(shadow ?? {}),
  };

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      scaleTo={0.96}
      style={style}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? 'opacity-45' : ''} ${className ?? ''}`}
      contentClassName="flex-row items-center justify-center gap-2"
      {...props}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color={spinnerColor[variant]} />
          <Text className={`text-base font-bold ${textVariantClasses[variant]}`}>Loading…</Text>
        </View>
      ) : (
        <Text className={`text-base font-bold tracking-wide ${textVariantClasses[variant]}`}>
          {label}
        </Text>
      )}
    </PressableScale>
  );
}
