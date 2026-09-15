import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { RestaurantCard } from '@/components/domain/RestaurantCard';
import { TravelCityFinder } from '@/components/domain/TravelCityFinder';
import { Button, Card, SectionHeader } from '@/components/ui';
import { useTrip } from '@/hooks/useTrip';
import type { CityPlaceCategory } from '@/types';
import { BOOKING_HREF, getNextStep, resolveWorkflowSteps } from '@/utils/booking';

const RADIUS_MILES = 50;

type CityTab = 'all' | CityPlaceCategory;

const TABS: Array<{ id: CityTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'dining', label: 'Dining' },
  { id: 'grocery', label: 'Groceries' },
  { id: 'gym', label: 'Gym' },
  { id: 'entertainment', label: 'Entertainment' },
];

export default function CityFinderScreen() {
  const router = useRouter();
  const trip = useTrip();
  const [tab, setTab] = useState<CityTab>('dining');

  const places = trip.restaurants;

  const visible = useMemo(
    () => (tab === 'all' ? places : places.filter((p) => (p.category ?? 'dining') === tab)),
    [places, tab],
  );

  const savedDining = useMemo(
    () =>
      places.filter(
        (p) => trip.selectedRestaurantIds.includes(p.id) && (p.category ?? 'dining') === 'dining',
      ),
    [places, trip.selectedRestaurantIds],
  );
  const nearbyGyms = useMemo(() => places.filter((p) => p.category === 'gym'), [places]);
  const nearbyEntertainment = useMemo(
    () => places.filter((p) => p.category === 'entertainment'),
    [places],
  );
  const savedCount = useMemo(() => {
    const selected = places.filter((p) => trip.selectedRestaurantIds.includes(p.id));
    if (tab === 'all') return selected.length;
    return selected.filter((p) => (p.category ?? 'dining') === tab).length;
  }, [places, tab, trip.selectedRestaurantIds]);

  if (!trip.destination) {
    return (
      <View className="flex-1 bg-surface-canvas p-4">
        <Card>
          <Text className="text-sm text-slate-600">
            Choose a facility or set a destination city in the Trip Hub first — City Finder anchors
            to that location or your selected lodging.
          </Text>
        </Card>
      </View>
    );
  }

  const anchorName = trip.selectedLodging ? trip.selectedLodging.name : trip.destination.label;

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-clinical-700 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-clinical-100">
          {RADIUS_MILES}-Mile Radius
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">City Finder</Text>
        <Text className="mt-1 text-sm text-clinical-100">
          {trip.tripMode === 'travel'
            ? 'Saved dining plus nearby gyms and entertainment while you are in town.'
            : 'Dining, groceries, gyms, and entertainment near your assignment.'}
        </Text>
        <Text className="mt-2 text-sm text-clinical-200" numberOfLines={2}>
          Near {anchorName}
        </Text>
      </View>

      {trip.diningLoading && places.length === 0 ? (
        <Card variant="soft">
          <View className="flex-row items-center gap-3">
            <ActivityIndicator color="#0f766e" />
            <Text className="text-sm text-slate-600">Finding real places nearby…</Text>
          </View>
        </Card>
      ) : null}

      {trip.tripMode === 'travel' ? (
        <TravelCityFinder
          savedDining={savedDining}
          nearbyGyms={nearbyGyms}
          nearbyEntertainment={nearbyEntertainment}
          selectedIds={trip.selectedRestaurantIds}
          onTogglePlace={trip.toggleRestaurant}
        />
      ) : (
        <>
          <SectionHeader
            title="Explore the city"
            subtitle="Save dining picks for your itinerary — groceries, gyms, and entertainment are optional"
          />
          <View className="flex-row flex-wrap gap-2">
            {TABS.map((option) => {
              const active = tab === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setTab(option.id)}
                  className={`min-h-[36px] rounded-full px-4 py-2 ${
                    active ? 'bg-medical-600' : 'border border-slate-200 bg-white'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-700'}`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <SectionHeader
            title={`${visible.length} spots within ${RADIUS_MILES} miles`}
            subtitle={`${savedCount} saved in this tab · ${trip.selectedRestaurantIds.length} total on itinerary`}
          />
          <View className="gap-3">
            {visible.map((place) => (
              <RestaurantCard
                key={place.id}
                restaurant={place}
                selected={trip.selectedRestaurantIds.includes(place.id)}
                onToggle={trip.toggleRestaurant}
              />
            ))}
          </View>

          {!trip.diningLoading && visible.length === 0 ? (
            <Card variant="soft">
              <Text className="text-sm text-slate-600">
                No live {tab === 'all' ? 'city' : tab} spots found nearby. Check your network or
                Google Places key, then re-select the hospital to refresh location.
              </Text>
            </Card>
          ) : null}

          <Button
            label="Continue to ground transportation"
            onPress={() => {
              const next = getNextStep(resolveWorkflowSteps(trip.housingFirstEnabled), 'dining');
              if (!next) return;
              trip.setActiveStep(next);
              router.push(BOOKING_HREF.ground);
            }}
          />
        </>
      )}
    </ScrollView>
  );
}
