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
      <Stack.Screen name="seats" options={{ title: 'Seat Locator' }} />
      <Stack.Screen name="dining" options={{ title: 'City Finder' }} />
      <Stack.Screen name="ground" options={{ title: 'Ground Transportation' }} />
      <Stack.Screen name="boarding-pass" options={{ title: 'Boarding Pass' }} />
      <Stack.Screen name="review" options={{ title: 'Itinerary Summary' }} />
      {/* Legacy aliases redirect to ground */}
      <Stack.Screen name="transit" options={{ title: 'Ground Transportation' }} />
      <Stack.Screen name="cars" options={{ title: 'Ground Transportation' }} />
    </Stack>
  );
}
