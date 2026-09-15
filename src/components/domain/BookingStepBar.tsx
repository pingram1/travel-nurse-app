import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { PressableScale } from '@/components/ui';
import { MOTION, SHADOWS } from '@/constants/theme';
import type { BookingWorkflowStep } from '@/types';
import { STEP_LABELS, getStepProgress } from '@/utils/booking';

export interface BookingStepBarProps {
  steps: BookingWorkflowStep[];
  activeStep: BookingWorkflowStep;
  onStepPress: (step: BookingWorkflowStep) => void;
  /** Overall itinerary completion (selections). Step position is derived separately. */
  completionPercent: number;
}

export function BookingStepBar({
  steps,
  activeStep,
  onStepPress,
  completionPercent,
}: BookingStepBarProps) {
  const stepProgress = getStepProgress(steps, activeStep);
  const stepIndex = Math.max(0, steps.indexOf(activeStep)) + 1;
  const width = useSharedValue(completionPercent);

  useEffect(() => {
    width.value = withSpring(completionPercent, MOTION.springSoft);
  }, [completionPercent, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, width.value))}%`,
  }));

  return (
    <View className="gap-3 rounded-3xl border border-medical-100 bg-white p-4" style={SHADOWS.soft}>
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-[1.2px] text-slate-500">
          Booking flow · Step {stepIndex}/{steps.length} ({stepProgress}%)
        </Text>
        <Text className="text-xs font-bold text-medical-600">Itinerary {completionPercent}%</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-medical-100">
        <Animated.View className="h-2 rounded-full bg-clinical-600" style={barStyle} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 py-1">
          {steps.map((step) => {
            const active = step === activeStep;
            return (
              <PressableScale
                key={step}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onStepPress(step)}
                scaleTo={0.95}
                className={`min-h-[40px] rounded-full px-4 py-2.5 ${
                  active ? 'bg-medical-500' : 'bg-medical-50'
                }`}
                style={active ? SHADOWS.soft : undefined}
                contentClassName="items-center justify-center"
              >
                <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-medical-700'}`}>
                  {STEP_LABELS[step]}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
