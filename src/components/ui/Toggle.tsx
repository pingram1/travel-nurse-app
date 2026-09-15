import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { COLORS, MOTION } from '@/constants/theme';

export interface ToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const TRACK_OFF = COLORS.neutral[200];
const TRACK_ON = COLORS.clinical[600];

export function Toggle({ label, description, value, onValueChange }: ToggleProps) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, MOTION.spring);
  }, [progress, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [TRACK_OFF, TRACK_ON]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 22 }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => onValueChange(!value)}
      className="min-h-[44px] flex-row items-center justify-between gap-4 py-1"
    >
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900">{label}</Text>
        {description ? (
          <Text className="mt-0.5 text-sm leading-5 text-slate-500">{description}</Text>
        ) : null}
      </View>
      <Animated.View className="h-8 w-14 justify-center rounded-full px-1" style={trackStyle}>
        <Animated.View className="h-6 w-6 rounded-full bg-white shadow-sm" style={thumbStyle} />
      </Animated.View>
    </Pressable>
  );
}
