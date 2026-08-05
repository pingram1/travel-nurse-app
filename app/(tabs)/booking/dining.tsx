import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { RestaurantCard } from '@/components/domain/RestaurantCard';
import { Button, Card, SectionHeader } from '@/components/ui';
import { useTrip } from '@/hooks/useTrip';
import { getNextStep, getStepRoute, resolveWorkflowSteps } from '@/utils/booking';

const RADIUS_MILES = 50;
const ALL_CUISINES = 'All';

export default function DiningScreen() {
  const router = useRouter();
  const trip = useTrip();
  const [cuisineFilter, setCuisineFilter] = useState(ALL_CUISINES);

  const cuisines = useMemo(
    () => [ALL_CUISINES, ...new Set(trip.restaurants.map((r) => r.cuisine))],
    [trip.restaurants],
  );

  const visible = useMemo(
    () =>
      cuisineFilter === ALL_CUISINES
        ? trip.restaurants
        : trip.restaurants.filter((r) => r.cuisine === cuisineFilter),
    [trip.restaurants, cuisineFilter],
  );

  if (!trip.hospital) {
    return (
      <View className="flex-1 bg-surface-canvas p-4">
        <Card>
          <Text className="text-sm text-slate-600">
            Select a facility in the Trip Hub first — dining suggestions anchor to your hospital or
            selected lodging.
          </Text>
        </Card>
      </View>
    );
  }

  const anchorName = trip.selectedLodging ? trip.selectedLodging.name : trip.hospital.name;

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-clinical-700 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-clinical-100">
          {RADIUS_MILES}-Mile Radius
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">Food Finder</Text>
        <Text className="mt-1 text-sm text-clinical-100">
          Tap restaurants to save them to your itinerary — no more switching between Yelp and your
          notes app between shifts.
        </Text>
        <Text className="mt-2 text-sm text-clinical-200">Near {anchorName}</Text>
      </View>

      <SectionHeader title="Filter by cuisine" />
      <View className="flex-row flex-wrap gap-2">
        {cuisines.map((cuisine) => {
          const active = cuisineFilter === cuisine;
          return (
            <Pressable
              key={cuisine}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setCuisineFilter(cuisine)}
              className={`min-h-[36px] rounded-full px-4 py-2 ${
                active ? 'bg-medical-600' : 'bg-white border border-slate-200'
              }`}
            >
              <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-700'}`}>
                {cuisine}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader
        title={`${visible.length} spots within ${RADIUS_MILES} miles`}
        subtitle={`${trip.selectedRestaurants.length} saved to itinerary`}
      />
      <View className="gap-3">
        {visible.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            selected={trip.selectedRestaurantIds.includes(restaurant.id)}
            onToggle={trip.toggleRestaurant}
          />
        ))}
      </View>

      <Button
        label="Continue to ground transit"
        onPress={() => {
          const next = getNextStep(resolveWorkflowSteps(trip.housingFirstEnabled), 'dining');
          if (!next) return;
          trip.setActiveStep(next);
          const route = getStepRoute(next);
          if (route) router.push(route);
        }}
      />
    </ScrollView>
  );
}
