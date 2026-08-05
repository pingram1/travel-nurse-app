import { Stack } from 'expo-router';

import { BRAND, COLORS } from '@/constants/theme';

export default function BookingStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface.light },
        headerTitleStyle: { color: COLORS.medical[900], fontWeight: '700' },
        headerTintColor: BRAND.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Trip Hub' }} />
      <Stack.Screen name="seats" options={{ title: 'Select Seat' }} />
      <Stack.Screen name="dining" options={{ title: 'Food Finder' }} />
      <Stack.Screen name="transit" options={{ title: 'Ground Transit' }} />
      <Stack.Screen name="cars" options={{ title: 'Car Rental' }} />
      <Stack.Screen name="review" options={{ title: 'Itinerary Summary' }} />
    </Stack>
  );
}
