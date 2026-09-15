import { Ionicons } from '@expo/vector-icons';
import { Linking, Text, View } from 'react-native';

import { Badge, Button, PressableScale } from '@/components/ui';
import { COLORS, SHADOWS } from '@/constants/theme';
import type { CarRentalOption } from '@/types';
import { formatCurrency } from '@/utils/currency';

const providerIcon: Record<CarRentalOption['provider'], keyof typeof Ionicons.glyphMap> = {
  turo: 'key',
  enterprise: 'business',
  hertz: 'car-sport',
};

export interface CarRentalCardProps {
  rental: CarRentalOption;
  selected: boolean;
  onSelect: (rentalId: string) => void;
}

async function openRental(rental: CarRentalOption): Promise<void> {
  try {
    await Linking.openURL(rental.appUrl);
  } catch {
    await Linking.openURL(rental.webUrl);
  }
}

export function CarRentalCard({ rental, selected, onSelect }: CarRentalCardProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(rental.id)}
      className={`rounded-3xl border-2 p-4 ${
        selected ? 'border-clinical-600 bg-clinical-50' : 'border-transparent bg-white'
      }`}
      style={selected ? SHADOWS.card : SHADOWS.soft}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`h-12 w-12 items-center justify-center rounded-2xl ${
            selected ? 'bg-clinical-600' : 'bg-medical-100'
          }`}
        >
          <Ionicons
            name={providerIcon[rental.provider]}
            size={22}
            color={selected ? '#ffffff' : COLORS.medical[600]}
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900">{rental.label}</Text>
          <Text className="mt-0.5 text-sm text-slate-500">
            {rental.vehicleClass} · {rental.pickupLocation}
          </Text>
        </View>
        <Text className="text-base font-bold text-medical-700">
          {formatCurrency(rental.weeklyRate)}
          <Text className="text-xs font-medium text-slate-500">/wk</Text>
        </Text>
      </View>
      <View className="mt-3 flex-row flex-wrap gap-2">
        <Badge label={`${formatCurrency(rental.dailyRate)}/day`} tone="info" />
        {rental.includesInsurance ? (
          <Badge label="Insurance included" tone="success" />
        ) : (
          <Badge label="Add insurance at pickup" tone="neutral" />
        )}
        {selected ? <Badge label="Selected for itinerary" tone="success" /> : null}
      </View>
      {selected ? (
        <View className="mt-3">
          <Button
            label={`Open ${rental.provider}`}
            variant="soft"
            size="sm"
            onPress={() => void openRental(rental)}
          />
        </View>
      ) : null}
    </PressableScale>
  );
}
