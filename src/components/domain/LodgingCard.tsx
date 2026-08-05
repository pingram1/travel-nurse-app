import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui';
import type { LodgingListing } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { classifyLodgingVariance } from '@/utils/stipend';

export interface LodgingCardProps {
  listing: LodgingListing;
  dailyStipendRate: number;
  selected: boolean;
  flagged?: boolean;
  onSelect: (lodgingId: string) => void;
}

export function LodgingCard({
  listing,
  dailyStipendRate,
  selected,
  flagged = false,
  onSelect,
}: LodgingCardProps) {
  const { variance, varianceAmount } = classifyLodgingVariance(
    listing.nightlyRate,
    dailyStipendRate,
  );
  const varianceLabel =
    variance === 'over'
      ? `${formatCurrency(varianceAmount)} over stipend`
      : variance === 'at'
        ? 'At stipend'
        : `${formatCurrency(Math.abs(varianceAmount))} under stipend`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(listing.id)}
      className={`min-h-[44px] rounded-2xl border-2 p-4 ${
        selected
          ? 'border-clinical-600 bg-clinical-50'
          : 'border-slate-200 bg-white active:bg-slate-50'
      } ${flagged ? 'opacity-80' : ''}`}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900">{listing.name}</Text>
          <Text className="mt-0.5 text-sm text-slate-500">
            {listing.provider === 'hotel' ? 'Hotel' : 'Airbnb'} · {listing.distanceMiles} mi from
            facility · ★ {listing.guestRating}
          </Text>
        </View>
        <View className="items-end gap-1">
          <Text className="text-base font-bold text-medical-700">
            {formatCurrency(listing.nightlyRate)}
            <Text className="text-xs font-medium text-slate-500">/night</Text>
          </Text>
        </View>
      </View>
      <View className="mt-3 flex-row flex-wrap gap-2">
        <Badge label={varianceLabel} tone={variance === 'over' ? 'danger' : 'success'} />
        <Badge
          label={`Area crime index ${listing.areaCrimeIndex}`}
          tone={flagged ? 'warning' : 'info'}
        />
        {selected ? <Badge label="Selected" tone="success" /> : null}
      </View>
      {flagged ? (
        <Text className="mt-2 text-xs font-medium text-caution-800">
          Outside safety or stipend thresholds — review before booking.
        </Text>
      ) : null}
    </Pressable>
  );
}
