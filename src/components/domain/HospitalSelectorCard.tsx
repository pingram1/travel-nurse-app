import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Badge, PressableScale } from '@/components/ui';
import { COLORS, SHADOWS } from '@/constants/theme';
import type { Hospital } from '@/types';

const gradeTone = { A: 'success', B: 'success', C: 'warning', D: 'danger', F: 'danger' } as const;

export interface HospitalSelectorCardProps {
  hospital: Hospital;
  selected: boolean;
  onSelect: (hospitalId: string) => void;
}

export function HospitalSelectorCard({ hospital, selected, onSelect }: HospitalSelectorCardProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(hospital.id)}
      className={`rounded-3xl border-2 p-4 ${
        selected ? 'border-medical-500 bg-medical-50' : 'border-transparent bg-white'
      }`}
      style={selected ? SHADOWS.card : SHADOWS.soft}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`h-12 w-12 items-center justify-center rounded-2xl ${
            selected ? 'bg-medical-500' : 'bg-medical-100'
          }`}
        >
          <Ionicons name="business" size={22} color={selected ? '#ffffff' : COLORS.medical[600]} />
        </View>
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
        <View className="mt-3 flex-row items-center gap-1.5">
          <Ionicons name="checkmark-circle" size={16} color={COLORS.medical[600]} />
          <Text className="text-xs font-semibold text-medical-600">
            Active assignment — safety, lodging, and flights synced
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}
