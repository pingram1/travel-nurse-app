import { Text, TextInput, View, type TextInputProps } from 'react-native';

export interface InputProps extends TextInputProps {
  label: string;
  error?: string | undefined;
}

export function Input({ label, error, className, ...props }: InputProps & { className?: string }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-slate-700">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        className={`min-h-[44px] rounded-lg border px-4 py-3 text-base text-slate-900 ${error ? 'border-red-500' : 'border-slate-300'} ${className ?? ''}`}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
