import { Ionicons } from '@expo/vector-icons';
import { Linking, Text, View } from 'react-native';

import { Badge, Button, PressableScale } from '@/components/ui';
import { SHADOWS } from '@/constants/theme';
import type { TransitOption, TransitProvider } from '@/types';
import { formatCurrency } from '@/utils/currency';

const providerMeta: Record<
  TransitProvider,
  { name: string; icon: 'car' | 'car-sport'; color: string }
> = {
  uber: { name: 'Uber', icon: 'car', color: '#000000' },
  lyft: { name: 'Lyft', icon: 'car-sport', color: '#ea0b8c' },
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
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect?.(option.id)}
      className={`rounded-3xl border-2 p-4 ${
        selected ? 'border-medical-500 bg-medical-50' : 'border-transparent bg-white'
      }`}
      style={selected ? SHADOWS.card : SHADOWS.soft}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
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
      <View className="mt-3">
        <Button
          label={`Open ${meta.name}`}
          variant="soft"
          size="sm"
          onPress={() => void openProvider(option)}
        />
      </View>
    </PressableScale>
  );
}
