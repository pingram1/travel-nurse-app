import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { COLORS, SHADOWS, TOUCH_TARGET_MIN } from '@/constants/theme';

export interface InputProps extends TextInputProps {
  label: string;
  error?: string | undefined;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className,
  onFocus,
  onBlur,
  ...props
}: InputProps & { className?: string }) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-slate-700">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        className={`rounded-2xl border-2 bg-white px-4 py-3.5 text-base text-slate-900 ${
          error
            ? 'border-danger-600'
            : focused
              ? 'border-medical-500 bg-medical-50/40'
              : 'border-medical-100'
        } ${className ?? ''}`}
        style={[{ minHeight: TOUCH_TARGET_MIN }, focused && !error ? SHADOWS.soft : undefined]}
        placeholderTextColor={COLORS.neutral[400]}
        {...props}
      />
      {error ? <Text className="text-sm font-medium text-danger-600">{error}</Text> : null}
      {!error && hint ? <Text className="text-xs text-slate-500">{hint}</Text> : null}
    </View>
  );
}
