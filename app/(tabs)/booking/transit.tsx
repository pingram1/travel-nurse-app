import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { TransitCard } from '@/components/domain/TransitCard';
import { Badge, Button, Card, SectionHeader } from '@/components/ui';
import { useTrip } from '@/hooks/useTrip';
import { formatTime } from '@/utils/datetime';

const PICKUP_BUFFER_MINUTES = 45;

export default function TransitScreen() {
  const router = useRouter();
  const trip = useTrip();

  if (!trip.hospital) {
    return (
      <View className="flex-1 bg-surface-canvas p-4">
        <Card>
          <Text className="text-sm text-slate-600">
            Select a facility in the Trip Hub first — transit options are built from your flight
            arrival and lodging location.
          </Text>
        </Card>
      </View>
    );
  }

  const arrival = trip.selectedFlight?.arrivalTime ?? null;
  const pickupTime = arrival
    ? formatTime(
        new Date(new Date(arrival).getTime() + PICKUP_BUFFER_MINUTES * 60_000).toISOString(),
      )
    : null;

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-medical-800 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-medical-200">
          Ground Transportation
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">Transit Integrator</Text>
        <Text className="mt-1 text-sm text-medical-100">
          Uber, Lyft, and Turo — tap to add to your itinerary, then open the provider to book.
        </Text>
      </View>

      <Card title="Trip context" subtitle="Estimates update with your flight and lodging picks">
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600">Flight arrival</Text>
            <Text className="text-sm font-semibold text-slate-900">
              {arrival
                ? `${formatTime(arrival)} at ${trip.hospital.airportCode}`
                : 'No flight selected'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600">Suggested pickup</Text>
            <Text className="text-sm font-semibold text-slate-900">
              {pickupTime ? `~${pickupTime} (after bags)` : '—'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600">Destination</Text>
            <Text className="text-sm font-semibold text-slate-900">
              {trip.selectedLodging ? trip.selectedLodging.name : trip.hospital.name}
            </Text>
          </View>
          {trip.selectedTransit ? (
            <Badge
              label={`Selected: ${trip.selectedTransit.label}`}
              tone="success"
              className="mt-1"
            />
          ) : (
            <Badge
              label="Tap a provider below to add to itinerary"
              tone="warning"
              className="mt-1"
            />
          )}
        </View>
      </Card>

      <SectionHeader
        title="Available providers"
        subtitle="Airport pickup to your lodging — deep links open native apps"
      />
      <View className="gap-3">
        {trip.transitOptions.map((option) => (
          <TransitCard
            key={option.id}
            option={option}
            selected={trip.selectedTransit?.id === option.id}
            onSelect={trip.selectTransit}
          />
        ))}
      </View>

      <Button
        label="Continue to car rental"
        onPress={() => {
          trip.setActiveStep('cars');
          router.push('./cars');
        }}
      />
    </ScrollView>
  );
}
