import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';

import { TOUCH_TARGET_MIN } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-medical-600 active:bg-medical-700 shadow-sm',
  secondary: 'bg-medical-50 border border-medical-200 active:bg-medical-100',
  ghost: 'bg-transparent active:bg-medical-50',
  danger: 'bg-danger-600 active:bg-red-700 shadow-sm',
  success: 'bg-clinical-600 active:bg-clinical-700 shadow-sm',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 min-h-[36px] rounded-lg',
  md: 'px-4 py-3 rounded-xl',
  lg: 'px-6 py-4 min-h-[52px] rounded-xl',
};

const sizeMinHeight: Record<ButtonSize, number | undefined> = {
  sm: undefined,
  md: TOUCH_TARGET_MIN,
  lg: undefined,
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-medical-700',
  ghost: 'text-medical-600',
  danger: 'text-white',
  success: 'text-white',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={sizeMinHeight[size] ? { minHeight: sizeMinHeight[size] } : undefined}
      className={`flex-row items-center justify-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      {...props}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator
            size="small"
            color={variant === 'secondary' || variant === 'ghost' ? '#1c5a8d' : '#ffffff'}
          />
          <Text className={`text-base font-semibold ${textVariantClasses[variant]}`}>Loading…</Text>
        </View>
      ) : (
        <Text className={`text-base font-semibold tracking-wide ${textVariantClasses[variant]}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
