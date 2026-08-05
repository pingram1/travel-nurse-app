import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Badge } from '@/components/ui';
import type { SeatCell, SeatClass } from '@/types';
import { formatCurrency } from '@/utils/currency';

const CLASS_LABEL: Record<SeatClass, string> = {
  first: 'First',
  premium: 'Premium',
  economy: 'Economy',
};

export interface PlaneSeatMap3DProps {
  seats: SeatCell[];
  selectedSeatId: string | null;
  airline: string;
  aircraft: string;
  isOpenSeating?: boolean;
  onSelectSeat: (seat: SeatCell) => void;
}

function SeatButton({
  seat,
  selected,
  onPress,
}: {
  seat: SeatCell;
  selected: boolean;
  onPress: () => void;
}) {
  if (seat.column === '') {
    return <View className="h-9 w-3" />;
  }

  const occupied = seat.status === 'occupied';
  const tone = selected
    ? 'bg-medical-600 border-medical-700'
    : occupied
      ? 'bg-slate-200 border-slate-300'
      : seat.seatClass === 'first'
        ? 'bg-amber-100 border-amber-300 active:bg-amber-200'
        : seat.seatClass === 'premium'
          ? 'bg-medical-100 border-medical-300 active:bg-medical-200'
          : 'bg-white border-slate-300 active:bg-slate-100';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Seat ${seat.id}`}
      accessibilityState={{ selected, disabled: occupied }}
      disabled={occupied}
      onPress={onPress}
      className={`h-9 w-9 items-center justify-center rounded-md border ${tone}`}
    >
      <Text className={`text-[10px] font-bold ${selected ? 'text-white' : 'text-slate-700'}`}>
        {seat.column}
      </Text>
    </Pressable>
  );
}

export function PlaneSeatMap3D({
  seats,
  selectedSeatId,
  airline,
  aircraft,
  isOpenSeating = false,
  onSelectSeat,
}: PlaneSeatMap3DProps) {
  const rotateY = useSharedValue(-18);
  const rotateX = useSharedValue(12);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedRotateY = useSharedValue(-18);
  const savedRotateX = useSharedValue(12);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      savedRotateY.value = rotateY.value;
      savedRotateX.value = rotateX.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      rotateY.value = savedRotateY.value + e.translationX * 0.15;
      rotateX.value = Math.min(35, Math.max(-5, savedRotateX.value - e.translationY * 0.1));
      translateX.value = savedTranslateX.value + e.translationX * 0.35;
      translateY.value = savedTranslateY.value + e.translationY * 0.25;
    })
    .onEnd(() => {
      rotateY.value = withSpring(rotateY.value);
      rotateX.value = withSpring(rotateX.value);
    });

  const cabinStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  const rows = [...new Set(seats.map((s) => s.row))].sort((a, b) => a - b);

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-bold text-slate-900">{airline}</Text>
          <Text className="text-sm text-slate-500">{aircraft}</Text>
        </View>
        <Badge
          label={isOpenSeating ? 'Open seating — pick zone' : 'Pan to explore cabin'}
          tone="info"
        />
      </View>

      <View className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <Text className="py-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          Front of aircraft
        </Text>
        <GestureDetector gesture={pan}>
          <Animated.View style={cabinStyle} className="px-4 pb-6">
            <View className="rounded-3xl border-2 border-slate-300 bg-white px-3 py-4 shadow-lg">
              {rows.map((row) => {
                const rowSeats = seats.filter((s) => s.row === row);
                const seatClass = rowSeats.find((s) => s.column !== '')?.seatClass ?? 'economy';
                const scale = 1 - (rowSeats[0]?.depth ?? 0) * 0.08;

                return (
                  <View
                    key={row}
                    className="mb-1.5 flex-row items-center justify-center gap-1"
                    style={{ transform: [{ scale }] }}
                  >
                    <Text className="mr-2 w-5 text-xs font-bold text-slate-400">{row}</Text>
                    {rowSeats.map((seat) => (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        selected={selectedSeatId === seat.id}
                        onPress={() => onSelectSeat(seat)}
                      />
                    ))}
                    {row <= 5 ? (
                      <Text className="ml-2 text-[10px] font-medium text-slate-400">
                        {CLASS_LABEL[seatClass]}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </Animated.View>
        </GestureDetector>
        <Text className="py-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          Rear of aircraft
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        <View className="flex-row items-center gap-1.5">
          <View className="h-4 w-4 rounded border border-slate-300 bg-white" />
          <Text className="text-xs text-slate-600">Available</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="h-4 w-4 rounded bg-medical-600" />
          <Text className="text-xs text-slate-600">Your seat</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="h-4 w-4 rounded bg-slate-200" />
          <Text className="text-xs text-slate-600">Occupied</Text>
        </View>
        {!isOpenSeating ? (
          <Text className="text-xs text-slate-500">
            Premium seats from {formatCurrency(42)} · First from {formatCurrency(89)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
