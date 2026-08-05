import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui';
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
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(rental.id)}
      className={`min-h-[44px] rounded-2xl border-2 p-4 ${
        selected
          ? 'border-clinical-600 bg-clinical-50'
          : 'border-slate-200 bg-white active:bg-slate-50'
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
          <Ionicons name={providerIcon[rental.provider]} size={22} color="#1c5a8d" />
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
        <Pressable
          accessibilityRole="button"
          onPress={() => void openRental(rental)}
          className="mt-3 min-h-[44px] items-center justify-center rounded-xl bg-medical-600 px-4 py-3 active:bg-medical-700"
        >
          <Text className="text-base font-semibold text-white">Open {rental.provider}</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}
