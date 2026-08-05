import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui';
import type { FlightOption } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatTime } from '@/utils/datetime';

export interface FlightCardProps {
  flight: FlightOption;
  selected: boolean;
  onSelect: (flightId: string) => void;
}

export function FlightCard({ flight, selected, onSelect }: FlightCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(flight.id)}
      className={`min-h-[44px] rounded-2xl border-2 p-4 ${
        selected
          ? 'border-medical-600 bg-medical-50'
          : 'border-slate-200 bg-white active:bg-slate-50'
      }`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900">
            {flight.airline} {flight.flightNumber}
          </Text>
          <Text className="mt-0.5 text-sm text-slate-500">
            {flight.departureAirport} {formatTime(flight.departureTime)} → {flight.arrivalAirport}{' '}
            {formatTime(flight.arrivalTime)}
          </Text>
        </View>
        <Text className="text-base font-bold text-medical-700">{formatCurrency(flight.price)}</Text>
      </View>
      <View className="mt-3 flex-row gap-2">
        <Badge
          label={flight.nonstop ? 'Nonstop' : '1 stop'}
          tone={flight.nonstop ? 'success' : 'neutral'}
        />
        {selected ? <Badge label="Selected" tone="info" /> : null}
      </View>
    </Pressable>
  );
}
