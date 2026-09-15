import { type ReactNode } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { MOTION } from '@/constants/theme';

export interface PressableScaleProps extends Omit<PressableProps, 'children' | 'style'> {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Soft press-scale micro-interaction for cards and CTAs.
 * Keeps attention without flashy bounce — Material Expressive–inspired.
 */
export function PressableScale({
  children,
  className,
  contentClassName,
  disabled,
  scaleTo = MOTION.pressScale,
  style,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled) {
      scale.value = withSpring(scaleTo, MOTION.spring);
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    scale.value = withSpring(1, MOTION.springSoft);
    onPressOut?.(event);
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={className ?? ''}
      style={style}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View className={contentClassName ?? ''} style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
