import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Badge } from '@/components/ui';
import { COLORS } from '@/constants/theme';
import type { SeatSelection } from '@/types';
import { seatToAircraftPosition } from '@/utils/aircraftPosition';

const styles = StyleSheet.create({
  glow: {
    backgroundColor: COLORS.medical[400],
    borderRadius: 14,
    height: 28,
    position: 'absolute',
    width: 28,
  },
  markerAnchor: {
    marginLeft: -14,
    marginTop: -14,
  },
});

export interface AircraftLocator3DProps {
  seat: SeatSelection | null;
  airline?: string;
  aircraft?: string;
}

/**
 * Generic aircraft silhouette with a glowing marker for the boarding-pass seat.
 * Position is approximate (front/mid/aft × window/aisle) — not a bookable seat map.
 */
export function AircraftLocator3D({
  seat,
  airline = 'Your flight',
  aircraft = 'Generic narrow-body',
}: AircraftLocator3DProps) {
  const rotateY = useSharedValue(-14);
  const rotateX = useSharedValue(18);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedRotateY = useSharedValue(-14);
  const savedRotateX = useSharedValue(18);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const pulse = useSharedValue(1);

  pulse.value = withRepeat(
    withTiming(1.35, { duration: 900, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );

  const pan = Gesture.Pan()
    .onStart(() => {
      savedRotateY.value = rotateY.value;
      savedRotateX.value = rotateX.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      rotateY.value = savedRotateY.value + e.translationX * 0.12;
      rotateX.value = Math.min(40, Math.max(0, savedRotateX.value - e.translationY * 0.08));
      translateX.value = savedTranslateX.value + e.translationX * 0.3;
      translateY.value = savedTranslateY.value + e.translationY * 0.2;
    })
    .onEnd(() => {
      rotateY.value = withSpring(rotateY.value);
      rotateX.value = withSpring(rotateX.value);
    });

  const cabinStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.35 + (pulse.value - 1) * 0.8,
  }));

  const position = seat ? seatToAircraftPosition(seat) : null;

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-bold text-slate-900">{airline}</Text>
          <Text className="text-sm text-slate-500">{aircraft}</Text>
        </View>
        <Badge label="Seat locator" tone="info" />
      </View>

      <View className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <Text className="py-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          Nose
        </Text>
        <GestureDetector gesture={pan}>
          <Animated.View style={cabinStyle} className="items-center px-6 pb-6 pt-2">
            {/* Generic fuselage */}
            <View className="relative h-72 w-40 items-center">
              <View className="absolute top-0 h-8 w-16 rounded-t-full bg-medical-200" />
              <View className="absolute top-6 h-56 w-36 rounded-[28px] border-2 border-medical-300 bg-white shadow-lg">
                {/* Cabin windows suggestion */}
                <View className="absolute left-2 top-8 bottom-8 w-1 rounded-full bg-medical-100" />
                <View className="absolute right-2 top-8 bottom-8 w-1 rounded-full bg-medical-100" />
                {/* Wing stubs */}
                <View className="absolute left-[-28px] top-[42%] h-3 w-10 rounded-l-full bg-medical-200" />
                <View className="absolute right-[-28px] top-[42%] h-3 w-10 rounded-r-full bg-medical-200" />

                {position ? (
                  <View
                    className="absolute h-7 w-7 items-center justify-center"
                    style={[
                      styles.markerAnchor,
                      {
                        left: `${position.lateral * 100}%`,
                        top: `${position.longitudinal * 100}%`,
                      },
                    ]}
                  >
                    <Animated.View style={[styles.glow, glowStyle]} />
                    <View className="h-3.5 w-3.5 rounded-full border-2 border-white bg-medical-600" />
                  </View>
                ) : (
                  <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-center text-xs text-slate-500">
                      Add a boarding pass with a seat number to place your marker.
                    </Text>
                  </View>
                )}
              </View>
              <View className="absolute bottom-0 h-10 w-20 rounded-b-2xl bg-medical-300" />
            </View>
          </Animated.View>
        </GestureDetector>
        <Text className="py-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          Tail
        </Text>
      </View>

      {seat && position ? (
        <View className="rounded-2xl bg-medical-50 px-3 py-2.5">
          <Text className="text-sm font-semibold text-medical-800">
            Seat {seat.label} · {position.zoneLabel} · {position.sideLabel}
          </Text>
          <Text className="mt-0.5 text-xs text-medical-700">
            Approximate location on a generic narrow-body cabin — pan to explore.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
