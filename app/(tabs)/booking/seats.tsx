import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { PlaneSeatMap3D } from '@/components/domain/PlaneSeatMap3D';
import { Button, Card } from '@/components/ui';
import { useTrip } from '@/hooks/useTrip';
import { getNextStep, getStepRoute, resolveWorkflowSteps } from '@/utils/booking';
import { formatCurrency } from '@/utils/currency';
import { buildSeatMap, applySeatSelection, toSeatSelection } from '@/utils/seatMap';

export default function SeatSelectionScreen() {
  const router = useRouter();
  const { flightId } = useLocalSearchParams<{ flightId?: string }>();
  const trip = useTrip();
  const [draftSeatId, setDraftSeatId] = useState<string | null>(trip.selectedSeat?.seatId ?? null);

  const flight =
    trip.selectedFlight ??
    (flightId ? (trip.flights.find((f) => f.id === flightId) ?? null) : null);

  const baseSeats = useMemo(
    () => (flight ? buildSeatMap(flight.airline, flight.cabinLayout) : []),
    [flight],
  );

  const seats = useMemo(() => applySeatSelection(baseSeats, draftSeatId), [baseSeats, draftSeatId]);

  const draftSeat = seats.find((s) => s.id === draftSeatId) ?? null;

  if (!flight) {
    return (
      <View className="flex-1 bg-surface-canvas p-4">
        <Card>
          <Text className="text-sm text-slate-600">
            Select a flight in the Trip Hub first, then return here to pick your seat.
          </Text>
        </Card>
      </View>
    );
  }

  const confirmSeat = () => {
    if (!draftSeat || draftSeat.status === 'occupied') return;
    trip.selectSeat(toSeatSelection(flight.id, draftSeat));
    const next = getNextStep(resolveWorkflowSteps(trip.housingFirstEnabled), 'seats');
    if (!next) return;
    trip.setActiveStep(next);
    const route = getStepRoute(next);
    if (route) router.push(route);
  };

  const seatLabel = draftSeat
    ? draftSeat.id.startsWith('zone')
      ? draftSeat.id.replace(/-/g, ' ').toUpperCase()
      : `${draftSeat.row}${draftSeat.column}`
    : null;
  const seatPriceNote =
    draftSeat && draftSeat.price > 0 ? ` · +${formatCurrency(draftSeat.price)}` : ' · Included';

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-medical-800 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-medical-200">
          3D Seat Selection
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">
          {flight.airline} {flight.flightNumber}
        </Text>
        <Text className="mt-1 text-sm text-medical-100">
          {flight.departureAirport} → {flight.arrivalAirport} · {flight.aircraft}
        </Text>
      </View>

      <PlaneSeatMap3D
        seats={seats}
        selectedSeatId={draftSeatId}
        airline={flight.airline}
        aircraft={flight.aircraft}
        isOpenSeating={flight.cabinLayout === 'southwest-open'}
        onSelectSeat={(seat) => {
          if (seat.status !== 'occupied') setDraftSeatId(seat.id);
        }}
      />

      <Card title="Selection">
        <Text className="text-sm text-slate-600">
          {seatLabel
            ? `Seat ${seatLabel}${seatPriceNote}`
            : 'Pan the cabin and tap an available seat.'}
        </Text>
      </Card>

      <Button
        label={draftSeat ? 'Confirm seat & continue to food' : 'Select a seat to continue'}
        disabled={!draftSeat}
        onPress={confirmSeat}
      />
    </ScrollView>
  );
}
