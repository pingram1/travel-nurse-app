import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AircraftLocator3D } from '@/components/domain/AircraftLocator3D';
import { Button, Card, Input } from '@/components/ui';
import { useTrip } from '@/hooks/useTrip';
import { BOOKING_HREF } from '@/utils/booking';
import { parseSeatNumber } from '@/utils/aircraftPosition';
import type { SeatSelection } from '@/types';

export default function SeatLocatorScreen() {
  const router = useRouter();
  const trip = useTrip();
  const [manualSeat, setManualSeat] = useState(trip.selectedSeat?.label ?? '');
  const [error, setError] = useState<string | null>(null);

  const flight = trip.selectedFlight;
  const seat = trip.selectedSeat;

  const applyManualSeat = () => {
    if (!flight) {
      setError('Select a flight and complete airline booking first.');
      return;
    }
    const parsed = parseSeatNumber(manualSeat);
    if (!parsed) {
      setError('Enter a seat like 12C or 8A.');
      return;
    }
    const selection: SeatSelection = {
      flightId: flight.id,
      seatId: `${parsed.row}${parsed.column}`,
      row: parsed.row,
      column: parsed.column,
      seatClass: parsed.row <= 4 ? 'first' : parsed.row <= 8 ? 'premium' : 'economy',
      price: 0,
      label: `${parsed.row}${parsed.column}`,
    };
    trip.selectSeat(selection);
    setError(null);
  };

  if (!flight && !trip.boardingPass) {
    return (
      <View className="flex-1 bg-surface-canvas p-4">
        <Card>
          <Text className="text-sm text-slate-600">
            Book on the airline, then upload or enter your boarding pass. This screen shows where
            your seat sits on a generic aircraft — it is not used for booking.
          </Text>
          <View className="mt-3 gap-2">
            <Button
              label="Import boarding pass"
              onPress={() => router.push(BOOKING_HREF.boardingPass)}
            />
            <Button label="Back to Trip Hub" variant="soft" onPress={() => router.back()} />
          </View>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-medical-800 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-medical-200">
          Seat locator
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">
          {flight ? `${flight.airline} ${flight.flightNumber}` : 'Your booked flight'}
        </Text>
        <Text className="mt-1 text-sm text-medical-100">
          {flight
            ? `${flight.departureAirport} → ${flight.arrivalAirport}`
            : 'Position from boarding pass'}
        </Text>
      </View>

      <AircraftLocator3D
        seat={seat}
        airline={flight?.airline ?? trip.boardingPass?.airline ?? 'Airline'}
        aircraft={flight?.aircraft ?? 'Generic aircraft'}
      />

      <Card title="Seat from boarding pass">
        <View className="gap-3">
          <Text className="text-sm text-slate-600">
            Booking happens on the airline site or app. After you book, import your pass or type the
            seat number to place the glowing marker.
          </Text>
          <Input
            label="Seat number"
            value={manualSeat}
            onChangeText={setManualSeat}
            autoCapitalize="characters"
            placeholder="e.g. 14C"
            hint="Parsed automatically from OCR when available"
          />
          {error ? <Text className="text-sm font-medium text-danger-600">{error}</Text> : null}
          <Button label="Update seat marker" variant="soft" onPress={applyManualSeat} />
          <Button
            label="Upload / scan boarding pass"
            variant="ghost"
            onPress={() => router.push(BOOKING_HREF.boardingPass)}
          />
        </View>
      </Card>

      <Button
        label="Continue to food finder"
        onPress={() => {
          trip.setActiveStep('dining');
          router.push(BOOKING_HREF.dining);
        }}
      />
      <Button
        label="Back to Trip Hub"
        variant="soft"
        onPress={() => router.push(BOOKING_HREF.hub)}
      />
    </ScrollView>
  );
}
