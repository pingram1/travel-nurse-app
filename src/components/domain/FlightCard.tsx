import { Ionicons } from '@expo/vector-icons';
import { Linking, Text, View } from 'react-native';

import { Badge, Button, PressableScale } from '@/components/ui';
import { COLORS, SHADOWS } from '@/constants/theme';
import type { FlightOption } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatTime } from '@/utils/datetime';

export interface FlightCardProps {
  flight: FlightOption;
  selected: boolean;
  onSelect: (flightId: string) => void;
  onBookedExternally: (flightId: string) => void;
}

async function openAirlineBooking(flight: FlightOption): Promise<void> {
  try {
    await Linking.openURL(flight.bookingAppUrl);
  } catch {
    await Linking.openURL(flight.bookingWebUrl);
  }
}

export function FlightCard({ flight, selected, onSelect, onBookedExternally }: FlightCardProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(flight.id)}
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
          <Ionicons name="airplane" size={22} color={selected ? '#ffffff' : COLORS.medical[600]} />
        </View>
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
      <View className="mt-3 flex-row flex-wrap gap-2">
        <Badge
          label={flight.nonstop ? 'Nonstop' : '1 stop'}
          tone={flight.nonstop ? 'success' : 'neutral'}
        />
        <Badge label="Book on airline" tone="info" />
        {selected ? <Badge label="Selected" tone="info" /> : null}
      </View>
      {selected ? (
        <View className="mt-3 gap-2">
          <Button
            label={`Open ${flight.airline} to book`}
            onPress={() => void openAirlineBooking(flight)}
          />
          <Button
            label="I've booked — add boarding pass"
            variant="soft"
            onPress={() => onBookedExternally(flight.id)}
          />
        </View>
      ) : null}
    </PressableScale>
  );
}
