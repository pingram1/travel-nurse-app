import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { BRAND, COLORS } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.surface.light },
        headerTitleStyle: { color: COLORS.medical[900], fontWeight: '700' },
        headerTintColor: BRAND.primary,
        headerShadowVisible: false,
        tabBarActiveTintColor: BRAND.primary,
        tabBarInactiveTintColor: BRAND.tabInactive,
        tabBarStyle: { backgroundColor: COLORS.surface.light, borderTopColor: COLORS.neutral[200] },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Trip',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="airplane" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="safety/index"
        options={{
          title: 'Safety',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stipend/index"
        options={{
          title: 'Stipend',
          tabBarIcon: ({ color, size }) => <Ionicons name="calculator" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vault/index"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="lock-closed" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
