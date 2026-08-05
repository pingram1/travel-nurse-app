import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui';
import type { Hospital } from '@/types';

const gradeTone = { A: 'success', B: 'success', C: 'warning', D: 'danger', F: 'danger' } as const;

export interface HospitalSelectorCardProps {
  hospital: Hospital;
  selected: boolean;
  onSelect: (hospitalId: string) => void;
}

export function HospitalSelectorCard({ hospital, selected, onSelect }: HospitalSelectorCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(hospital.id)}
      className={`min-h-[44px] rounded-2xl border-2 p-4 ${
        selected
          ? 'border-medical-600 bg-medical-50'
          : 'border-slate-200 bg-white active:bg-slate-50'
      }`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900">{hospital.name}</Text>
          <Text className="mt-0.5 text-sm text-slate-500">
            {hospital.city}, {hospital.state} · {hospital.airportCode}
          </Text>
        </View>
        <Badge
          label={`Grade ${hospital.safety.overallGrade}`}
          tone={gradeTone[hospital.safety.overallGrade]}
        />
      </View>
      {selected ? (
        <Text className="mt-2 text-xs font-semibold text-medical-600">
          Active assignment — safety, lodging, and flights synced
        </Text>
      ) : null}
    </Pressable>
  );
}
