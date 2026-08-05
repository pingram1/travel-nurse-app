import { Pressable, Text, View } from 'react-native';

export interface ToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ label, description, value, onValueChange }: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => onValueChange(!value)}
      className="min-h-[44px] flex-row items-center justify-between gap-4 py-1"
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-slate-900">{label}</Text>
        {description ? <Text className="mt-0.5 text-sm text-slate-500">{description}</Text> : null}
      </View>
      <View
        className={`h-8 w-14 justify-center rounded-full px-1 ${value ? 'bg-clinical-600' : 'bg-slate-300'}`}
      >
        <View
          className={`h-6 w-6 rounded-full bg-white shadow ${value ? 'self-end' : 'self-start'}`}
        />
      </View>
    </Pressable>
  );
}
