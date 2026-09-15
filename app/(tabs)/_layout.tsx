import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BRAND, COLORS } from '@/constants/theme';

function TabIcon({
  focused,
  color,
  icon,
  label,
}: {
  focused: boolean;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View className="min-w-[56px] items-center justify-center px-1 py-0.5">
      <View
        className={`min-h-[40px] min-w-[48px] items-center justify-center rounded-xl px-2.5 ${
          focused ? 'bg-medical-100 py-1' : 'bg-transparent py-0.5'
        }`}
      >
        <Ionicons
          name={icon}
          size={focused ? 20 : 22}
          color={focused ? COLORS.medical[600] : color}
        />
        {focused ? (
          <Text
            numberOfLines={1}
            className="mt-0.5 text-center text-[10px] font-bold text-medical-700"
          >
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);
  const tabBarHeight = 64 + bottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.surface.canvas },
        headerTitleStyle: { color: COLORS.medical[900], fontWeight: '700' },
        headerTintColor: BRAND.primary,
        headerShadowVisible: false,
        tabBarActiveTintColor: BRAND.primary,
        tabBarInactiveTintColor: BRAND.tabInactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface.light,
          borderTopColor: COLORS.medical[100],
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: bottomPad,
          overflow: 'visible',
        },
        tabBarItemStyle: {
          overflow: 'visible',
          paddingVertical: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Trip',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon="airplane" label="Trip" />
          ),
        }}
      />
      <Tabs.Screen
        name="safety/index"
        options={{
          title: 'Safety',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon="shield-checkmark" label="Safety" />
          ),
        }}
      />
      <Tabs.Screen
        name="stipend/index"
        options={{
          title: 'Stipend',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon="calculator" label="Stipend" />
          ),
        }}
      />
      <Tabs.Screen
        name="vault/index"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon="lock-closed" label="Vault" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon="person-circle" label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}
