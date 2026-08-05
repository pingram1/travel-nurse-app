import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { CarRentalCard } from '@/components/domain/CarRentalCard';
import { Button, Card, SectionHeader } from '@/components/ui';
import { useTrip } from '@/hooks/useTrip';

export default function CarRentalScreen() {
  const router = useRouter();
  const trip = useTrip();

  if (!trip.hospital) {
    return (
      <View className="flex-1 bg-surface-canvas p-4">
        <Card>
          <Text className="text-sm text-slate-600">
            Select a facility in the Trip Hub first — car rentals are scoped to your assignment
            city.
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-medical-700 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-medical-200">
          Destination mobility
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">Car Rental</Text>
        <Text className="mt-1 text-sm text-medical-100">
          Weekly rentals in {trip.hospital.city} — Turo peer-to-peer or traditional agencies. Keeps
          you off ride-share for every shift commute.
        </Text>
      </View>

      <SectionHeader
        title="Available vehicles"
        subtitle="Select one to add to your itinerary — open provider when ready to book"
      />
      <View className="gap-3">
        {trip.carRentals.map((rental) => (
          <CarRentalCard
            key={rental.id}
            rental={rental}
            selected={trip.selectedCarRental?.id === rental.id}
            onSelect={trip.selectCarRental}
          />
        ))}
      </View>

      <Button
        label="Continue to itinerary summary"
        variant={trip.selectedCarRental ? 'success' : 'secondary'}
        onPress={() => {
          trip.setActiveStep('review');
          router.push('./review');
        }}
      />
    </ScrollView>
  );
}
