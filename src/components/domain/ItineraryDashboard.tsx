import { Text, View } from 'react-native';

import { Badge } from '@/components/ui';
import { SHADOWS } from '@/constants/theme';
import type { ItinerarySummary } from '@/types';
import { formatCurrency } from '@/utils/currency';

export interface ItineraryDashboardProps {
  itinerary: ItinerarySummary;
}

function Line({
  label,
  value,
  sub,
  complete,
}: {
  label: string;
  value: string;
  sub?: string | undefined;
  complete: boolean;
}) {
  return (
    <View className="flex-row items-start justify-between gap-3 border-b border-medical-50 py-3.5">
      <View className="min-w-0 flex-1">
        <Text className="text-xs font-bold uppercase tracking-[1px] text-slate-400">{label}</Text>
        <Text className="mt-0.5 text-base font-bold text-slate-900" numberOfLines={2}>
          {value}
        </Text>
        {sub ? (
          <Text className="mt-0.5 text-sm leading-5 text-slate-500" numberOfLines={3}>
            {sub}
          </Text>
        ) : null}
      </View>
      <Badge label={complete ? 'Done' : 'Pending'} tone={complete ? 'success' : 'warning'} />
    </View>
  );
}

function SubLine({
  label,
  value,
  sub,
  complete,
  last = false,
}: {
  label: string;
  value: string;
  sub?: string | undefined;
  complete: boolean;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-start justify-between gap-3 py-3 ${
        last ? '' : 'border-b border-slate-100'
      }`}
    >
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] font-bold uppercase tracking-[1px] text-slate-400">
          {label}
        </Text>
        <Text className="mt-0.5 text-sm font-bold text-slate-900" numberOfLines={2}>
          {value}
        </Text>
        {sub ? (
          <Text className="mt-0.5 text-xs leading-5 text-slate-500" numberOfLines={2}>
            {sub}
          </Text>
        ) : null}
      </View>
      <Badge label={complete ? 'Done' : 'Pending'} tone={complete ? 'success' : 'warning'} />
    </View>
  );
}

export function ItineraryDashboard({ itinerary }: ItineraryDashboardProps) {
  const ride = itinerary.groundTransit.rideTransport;
  const car = itinerary.groundTransit.carRental;
  // Mutually exclusive: a rental stay hides ride-share, and vice versa.
  const showCar = Boolean(car);
  const showRide = Boolean(ride) && !showCar;
  const groundComplete = showCar || showRide;

  return (
    <View className="rounded-3xl border border-medical-100 bg-white p-5" style={SHADOWS.card}>
      <View className="mb-2 flex-row items-center justify-between">
        <View className="min-w-0 flex-1 pr-2">
          <Text className="text-lg font-bold text-slate-900">Travel Itinerary</Text>
          <Text className="text-sm text-slate-500" numberOfLines={2}>
            {itinerary.facilityName}
          </Text>
        </View>
        <Badge
          label={`${itinerary.completionPercent}%`}
          tone={itinerary.isReadyToConfirm ? 'success' : 'info'}
        />
      </View>

      {itinerary.contractDates ? (
        <Text className="mb-2 text-sm font-medium text-medical-700">
          Contract: {itinerary.contractDates}
        </Text>
      ) : null}

      <Line
        label="Facility"
        value={
          itinerary.facilityName && itinerary.facilityName !== 'No facility selected'
            ? itinerary.facilityName
            : 'Skipped (optional)'
        }
        complete
      />
      <Line
        label="Lodging"
        value={itinerary.lodging?.name ?? 'Not selected'}
        sub={
          itinerary.lodging
            ? `${formatCurrency(itinerary.lodging.nightlyRate)}/night · ${itinerary.lodging.totalNights} nights`
            : undefined
        }
        complete={Boolean(itinerary.lodging)}
      />
      <Line
        label="Flight"
        value={
          itinerary.flight
            ? `${itinerary.flight.airline} ${itinerary.flight.flightNumber}`
            : 'Not selected'
        }
        sub={
          itinerary.flight
            ? `${itinerary.flight.route} · Seat ${itinerary.flight.seat?.label ?? '—'} · ${formatCurrency(itinerary.flight.price + (itinerary.flight.seat?.price ?? 0))}`
            : undefined
        }
        complete={Boolean(itinerary.flight)}
      />
      <Line
        label="Dining picks"
        value={
          itinerary.dining.count > 0 ? `${itinerary.dining.count} saved` : 'Browse City Finder'
        }
        sub={itinerary.dining.names.slice(0, 4).join(', ') || undefined}
        complete={itinerary.dining.count > 0}
      />
      {itinerary.entertainment.count > 0 ? (
        <Line
          label="Entertainment picks"
          value={`${itinerary.entertainment.count} saved`}
          sub={itinerary.entertainment.names.slice(0, 4).join(', ') || undefined}
          complete
        />
      ) : null}

      <View className="border-b border-medical-50 py-3.5">
        <View className="mb-2 flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-xs font-bold uppercase tracking-[1px] text-slate-400">
              Ground transit
            </Text>
            <Text className="mt-0.5 text-base font-bold text-slate-900">
              {showCar ? 'Car rental' : showRide ? 'Ride transport' : 'Not selected'}
            </Text>
          </View>
          <Badge
            label={groundComplete ? 'Done' : 'Pending'}
            tone={groundComplete ? 'success' : 'warning'}
          />
        </View>
        {groundComplete ? (
          <View className="rounded-2xl bg-slate-50 px-3">
            {showRide && ride ? (
              <SubLine
                label="Ride transport"
                value={ride.label}
                sub={`${ride.provider} · est. ${formatCurrency(ride.estimatedCost)}`}
                complete
                last
              />
            ) : null}
            {showCar && car ? (
              <SubLine
                label="Car rental"
                value={car.label}
                sub={`${formatCurrency(car.weeklyRate)}/week in destination city`}
                complete
                last
              />
            ) : null}
          </View>
        ) : null}
      </View>

      <View className="mt-4 rounded-2xl bg-medical-50 p-4">
        <Text className="text-xs font-bold uppercase tracking-[1px] text-medical-700">
          Estimated trip cost
        </Text>
        <Text className="mt-1 text-2xl font-bold text-medical-800">
          {formatCurrency(itinerary.estimatedTotal)}
        </Text>
        <Text className="mt-1 text-xs text-slate-500">
          Lodging (contract) + flight + seat + transit + weekly car
        </Text>
      </View>
    </View>
  );
}
