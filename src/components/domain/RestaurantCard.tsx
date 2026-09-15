import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Badge, PressableScale } from '@/components/ui';
import { COLORS, SHADOWS } from '@/constants/theme';
import type { CityPlace, CityPlaceCategory } from '@/types';

export interface RestaurantCardProps {
  restaurant: CityPlace;
  selected?: boolean;
  onToggle?: (restaurantId: string) => void;
}

function iconFor(category: CityPlaceCategory): keyof typeof Ionicons.glyphMap {
  if (category === 'gym') return 'barbell';
  if (category === 'entertainment') return 'ticket';
  if (category === 'grocery') return 'cart';
  return 'restaurant';
}

function categoryLabel(category: CityPlaceCategory): string {
  if (category === 'gym') return 'Gym';
  if (category === 'entertainment') return 'Entertainment';
  if (category === 'grocery') return 'Groceries';
  return 'Dining';
}

export function RestaurantCard({ restaurant, selected = false, onToggle }: RestaurantCardProps) {
  const category = restaurant.category ?? 'dining';
  const content = (
    <>
      <View className="flex-row items-center gap-3">
        <View
          className={`h-12 w-12 items-center justify-center rounded-2xl ${
            selected ? 'bg-clinical-600' : 'bg-medical-100'
          }`}
        >
          <Ionicons
            name={iconFor(category)}
            size={22}
            color={selected ? '#ffffff' : COLORS.medical[600]}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-slate-900" numberOfLines={2}>
            {restaurant.name}
          </Text>
          <Text className="mt-0.5 text-sm text-slate-500" numberOfLines={1}>
            {categoryLabel(category)} · {restaurant.cuisine} · {'$'.repeat(restaurant.priceLevel)} ·
            ★ {restaurant.rating}
          </Text>
          {restaurant.vicinity ? (
            <Text className="mt-0.5 text-xs text-slate-400" numberOfLines={2}>
              {restaurant.vicinity}
            </Text>
          ) : null}
        </View>
        <Text className="text-sm font-bold text-medical-700">{restaurant.distanceMiles} mi</Text>
      </View>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {restaurant.openLate && category === 'dining' ? (
          <Badge label="Open late — night shift friendly" tone="success" />
        ) : null}
        {selected ? <Badge label="Saved to itinerary" tone="info" /> : null}
      </View>
    </>
  );

  if (!onToggle) {
    return (
      <View className="rounded-3xl border border-transparent bg-white p-4" style={SHADOWS.soft}>
        {content}
      </View>
    );
  }

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onToggle(restaurant.id)}
      className={`rounded-3xl border-2 p-4 ${
        selected ? 'border-clinical-600 bg-clinical-50' : 'border-transparent bg-white'
      }`}
      style={selected ? SHADOWS.card : SHADOWS.soft}
    >
      {content}
    </PressableScale>
  );
}
