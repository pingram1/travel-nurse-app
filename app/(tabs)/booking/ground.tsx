import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { CarRentalCard } from '@/components/domain/CarRentalCard';
import { TransitCard } from '@/components/domain/TransitCard';
import { Badge, Button, Card, SectionHeader } from '@/components/ui';
import { useTrip } from '@/hooks/useTrip';
import { BOOKING_HREF, getNextStep, resolveWorkflowSteps } from '@/utils/booking';
import { formatTime } from '@/utils/datetime';

const PICKUP_BUFFER_MINUTES = 45;

type GroundMode = 'rideshare' | 'rental';

export default function GroundTransportationScreen() {
  const router = useRouter();
  const trip = useTrip();
  const [mode, setMode] = useState<GroundMode>(
    trip.selectedCarRental && !trip.selectedTransit ? 'rental' : 'rideshare',
  );

  if (!trip.destination) {
    return (
      <View className="flex-1 bg-surface-canvas p-4">
        <Card>
          <Text className="text-sm text-slate-600">
            Choose a facility or set a destination city in the Trip Hub first — ground options use
            your flight arrival and lodging location.
          </Text>
        </Card>
      </View>
    );
  }

  const arrival = trip.selectedFlight?.arrivalTime ?? null;
  const arrivalAirport = trip.selectedFlight?.arrivalAirport ?? trip.destination.airportCode;
  const pickupTime = arrival
    ? formatTime(
        new Date(new Date(arrival).getTime() + PICKUP_BUFFER_MINUTES * 60_000).toISOString(),
      )
    : null;

  const groundComplete = Boolean(
    (mode === 'rideshare' && trip.selectedTransit) || (mode === 'rental' && trip.selectedCarRental),
  );

  const switchMode = (next: GroundMode) => {
    setMode(next);
    // Mutually exclusive for the trip: picking a branch clears the other.
    if (next === 'rideshare') {
      trip.selectCarRental(null);
    } else {
      trip.selectTransit(null);
    }
  };

  const continueToSummary = () => {
    const next = getNextStep(resolveWorkflowSteps(trip.housingFirstEnabled), 'ground');
    if (!next) return;
    trip.setActiveStep(next);
    router.push(BOOKING_HREF.review);
  };

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-medical-800 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-medical-200">
          Ground Transportation
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">Rides & rentals</Text>
        <Text className="mt-1 text-sm text-medical-100">
          Choose ride-share for airport pickup or a weekly rental for shift commuting — one primary
          mode for this trip.
        </Text>
      </View>

      <View className="flex-row gap-2">
        {(
          [
            { id: 'rideshare' as const, label: 'Ride-share' },
            { id: 'rental' as const, label: 'Car rental' },
          ] as const
        ).map((option) => {
          const active = mode === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => switchMode(option.id)}
              className={`min-h-[44px] flex-1 items-center justify-center rounded-2xl px-3 py-3 ${
                active ? 'bg-medical-600' : 'border border-slate-200 bg-white'
              }`}
            >
              <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-700'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card title="Trip context" subtitle="Estimates update with your flight and lodging picks">
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600">Flight arrival</Text>
            <Text className="text-sm font-semibold text-slate-900">
              {arrival ? `${formatTime(arrival)} at ${arrivalAirport}` : 'No flight selected'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600">Suggested pickup</Text>
            <Text className="text-sm font-semibold text-slate-900">
              {pickupTime ? `~${pickupTime} (after bags)` : '—'}
            </Text>
          </View>
          <View className="flex-row items-start justify-between gap-3">
            <Text className="shrink-0 text-sm text-slate-600">Destination</Text>
            <Text
              className="min-w-0 flex-1 text-right text-sm font-semibold text-slate-900"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {trip.selectedLodging ? trip.selectedLodging.name : trip.destination.label}
            </Text>
          </View>
          {groundComplete ? (
            <Badge
              label={
                trip.selectedTransit
                  ? `Ride: ${trip.selectedTransit.label}`
                  : `Rental: ${trip.selectedCarRental?.label ?? 'Selected'}`
              }
              tone="success"
              className="mt-1"
            />
          ) : (
            <Badge
              label={
                mode === 'rideshare'
                  ? 'Select Uber or Lyft for your itinerary'
                  : 'Select a rental for your itinerary'
              }
              tone="warning"
              className="mt-1"
            />
          )}
        </View>
      </Card>

      {mode === 'rideshare' ? (
        <>
          <SectionHeader
            title="Ride-share"
            subtitle="Uber or Lyft for airport pickup — deep links open native apps"
          />
          <View className="gap-3">
            {trip.transitOptions.map((option) => (
              <TransitCard
                key={option.id}
                option={option}
                selected={trip.selectedTransit?.id === option.id}
                onSelect={(id) => {
                  trip.selectTransit(id);
                  trip.selectCarRental(null);
                }}
              />
            ))}
          </View>
        </>
      ) : (
        <>
          <SectionHeader
            title={`Weekly rentals near ${arrivalAirport}`}
            subtitle="Turo vehicle types and agency lots at your arrival airport"
          />
          <View className="gap-3">
            {trip.carRentals.map((rental) => (
              <CarRentalCard
                key={rental.id}
                rental={rental}
                selected={trip.selectedCarRental?.id === rental.id}
                onSelect={(id) => {
                  trip.selectCarRental(id);
                  trip.selectTransit(null);
                }}
              />
            ))}
          </View>
        </>
      )}

      <Button
        label="Continue to itinerary summary"
        variant={groundComplete ? 'success' : 'secondary'}
        onPress={continueToSummary}
      />
    </ScrollView>
  );
}
