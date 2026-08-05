import { Pressable, ScrollView, Text, View } from 'react-native';

import type { BookingWorkflowStep } from '@/types';
import { STEP_LABELS } from '@/utils/booking';

export interface BookingStepBarProps {
  steps: BookingWorkflowStep[];
  activeStep: BookingWorkflowStep;
  onStepPress: (step: BookingWorkflowStep) => void;
  completionPercent: number;
}

export function BookingStepBar({
  steps,
  activeStep,
  onStepPress,
  completionPercent,
}: BookingStepBarProps) {
  const barWidth: `${number}%` = `${completionPercent}%`;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Booking flow
        </Text>
        <Text className="text-xs font-bold text-medical-600">{completionPercent}% complete</Text>
      </View>
      <View className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <View className="h-1.5 rounded-full bg-clinical-600" style={{ width: barWidth }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        <View className="flex-row gap-2 py-1">
          {steps.map((step) => {
            const active = step === activeStep;
            return (
              <Pressable
                key={step}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onStepPress(step)}
                className={`min-h-[36px] rounded-full px-3 py-2 ${
                  active ? 'bg-medical-600' : 'border border-slate-200 bg-white'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${active ? 'text-white' : 'text-slate-700'}`}
                >
                  {STEP_LABELS[step]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
