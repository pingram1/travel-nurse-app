import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui';
import type { TransitOption, TransitProvider } from '@/types';
import { formatCurrency } from '@/utils/currency';

const providerMeta: Record<
  TransitProvider,
  { name: string; icon: 'car' | 'car-sport' | 'key'; color: string }
> = {
  uber: { name: 'Uber', icon: 'car', color: '#000000' },
  lyft: { name: 'Lyft', icon: 'car-sport', color: '#ea0b8c' },
  turo: { name: 'Turo', icon: 'key', color: '#121214' },
};

export interface TransitCardProps {
  option: TransitOption;
  selected?: boolean;
  onSelect?: (optionId: string) => void;
}

async function openProvider(option: TransitOption): Promise<void> {
  try {
    await Linking.openURL(option.appUrl);
  } catch {
    await Linking.openURL(option.webUrl);
  }
}

export function TransitCard({ option, selected = false, onSelect }: TransitCardProps) {
  const meta = providerMeta[option.provider];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect?.(option.id)}
      className={`rounded-2xl border-2 p-4 ${
        selected
          ? 'border-medical-600 bg-medical-50'
          : 'border-slate-200 bg-white active:bg-slate-50'
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
          <Ionicons name={meta.icon} size={22} color={meta.color} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900">{option.label}</Text>
          <Text className="mt-0.5 text-sm text-slate-500">
            Pickup in ~{option.etaMinutes} min · est. {formatCurrency(option.estimatedCost)}
          </Text>
        </View>
        {selected ? <Badge label="In itinerary" tone="success" /> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => void openProvider(option)}
        className="mt-3 min-h-[44px] items-center justify-center rounded-xl bg-medical-600 px-4 py-3 active:bg-medical-700"
      >
        <Text className="text-base font-semibold text-white">Open {meta.name}</Text>
      </Pressable>
    </Pressable>
  );
}
