import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui';
import type { Restaurant } from '@/types';

export interface RestaurantCardProps {
  restaurant: Restaurant;
  selected?: boolean;
  onToggle?: (restaurantId: string) => void;
}

export function RestaurantCard({ restaurant, selected = false, onToggle }: RestaurantCardProps) {
  const content = (
    <>
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900">{restaurant.name}</Text>
          <Text className="mt-0.5 text-sm text-slate-500">
            {restaurant.cuisine} · {'$'.repeat(restaurant.priceLevel)} · ★ {restaurant.rating}
          </Text>
        </View>
        <Text className="text-sm font-bold text-medical-700">{restaurant.distanceMiles} mi</Text>
      </View>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {restaurant.openLate ? (
          <Badge label="Open late — night shift friendly" tone="success" />
        ) : null}
        {selected ? <Badge label="Saved to itinerary" tone="info" /> : null}
      </View>
    </>
  );

  if (!onToggle) {
    return <View className="rounded-2xl border border-slate-200 bg-white p-4">{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onToggle(restaurant.id)}
      className={`min-h-[44px] rounded-2xl border-2 p-4 ${
        selected
          ? 'border-clinical-600 bg-clinical-50'
          : 'border-slate-200 bg-white active:bg-slate-50'
      }`}
    >
      {content}
    </Pressable>
  );
}
