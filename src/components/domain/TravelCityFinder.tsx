import { Text, View } from 'react-native';

import { RestaurantCard } from '@/components/domain/RestaurantCard';
import { Card, SectionHeader } from '@/components/ui';
import type { CityPlace } from '@/types';

export interface TravelCityFinderProps {
  savedDining: CityPlace[];
  nearbyGyms: CityPlace[];
  nearbyEntertainment: CityPlace[];
  selectedIds: string[];
  onTogglePlace: (placeId: string) => void;
}

export function TravelCityFinder({
  savedDining,
  nearbyGyms,
  nearbyEntertainment,
  selectedIds,
  onTogglePlace,
}: TravelCityFinderProps) {
  return (
    <View className="gap-5">
      <SectionHeader
        title="Saved dining"
        subtitle="Picks from planning — locked in for this assignment"
      />
      {savedDining.length === 0 ? (
        <Card variant="soft">
          <Text className="text-sm text-slate-600">
            No dining saved yet. Edit itinerary to add restaurants from City Finder.
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {savedDining.map((place) => (
            <RestaurantCard key={place.id} restaurant={place} selected />
          ))}
        </View>
      )}

      <SectionHeader title="Nearby gyms" subtitle="Optional — save spots near lodging" />
      {nearbyGyms.length === 0 ? (
        <Card variant="soft">
          <Text className="text-sm text-slate-600">No gyms found nearby right now.</Text>
        </Card>
      ) : (
        <View className="gap-3">
          {nearbyGyms.map((place) => (
            <RestaurantCard
              key={place.id}
              restaurant={place}
              selected={selectedIds.includes(place.id)}
              onToggle={onTogglePlace}
            />
          ))}
        </View>
      )}

      <SectionHeader
        title="Nearby entertainment"
        subtitle="Optional — museums, parks, and nights out"
      />
      {nearbyEntertainment.length === 0 ? (
        <Card variant="soft">
          <Text className="text-sm text-slate-600">
            No entertainment spots found nearby right now.
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {nearbyEntertainment.map((place) => (
            <RestaurantCard
              key={place.id}
              restaurant={place}
              selected={selectedIds.includes(place.id)}
              onToggle={onTogglePlace}
            />
          ))}
        </View>
      )}
    </View>
  );
}
