import { Text, View } from 'react-native';

import { Badge } from '@/components/ui';
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
    <View className="flex-row items-start justify-between gap-3 border-b border-slate-100 py-3">
      <View className="flex-1">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </Text>
        <Text className="mt-0.5 text-base font-bold text-slate-900">{value}</Text>
        {sub ? <Text className="mt-0.5 text-sm text-slate-500">{sub}</Text> : null}
      </View>
      <Badge label={complete ? 'Done' : 'Pending'} tone={complete ? 'success' : 'warning'} />
    </View>
  );
}

export function ItineraryDashboard({ itinerary }: ItineraryDashboardProps) {
  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-slate-900">Travel Itinerary</Text>
          <Text className="text-sm text-slate-500">{itinerary.facilityName}</Text>
        </View>
        <Badge label={`${itinerary.completionPercent}%`} tone="info" />
      </View>

      {itinerary.contractDates ? (
        <Text className="mb-3 text-sm text-medical-700">Contract: {itinerary.contractDates}</Text>
      ) : null}

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
        complete={Boolean(itinerary.flight?.seat)}
      />
      <Line
        label="Dining picks"
        value={
          itinerary.dining.count > 0 ? `${itinerary.dining.count} saved` : 'Browse Food Finder'
        }
        sub={itinerary.dining.names.slice(0, 3).join(', ') || undefined}
        complete={itinerary.dining.count > 0}
      />
      <Line
        label="Ground transit"
        value={itinerary.groundTransit?.label ?? 'Not selected'}
        sub={
          itinerary.groundTransit
            ? `${itinerary.groundTransit.provider} · est. ${formatCurrency(itinerary.groundTransit.estimatedCost)}`
            : undefined
        }
        complete={Boolean(itinerary.groundTransit)}
      />
      <Line
        label="Car rental"
        value={itinerary.carRental?.label ?? 'Not selected'}
        sub={
          itinerary.carRental
            ? `${formatCurrency(itinerary.carRental.weeklyRate)}/week in destination city`
            : undefined
        }
        complete={Boolean(itinerary.carRental)}
      />

      <View className="mt-4 rounded-xl bg-medical-50 p-4">
        <Text className="text-xs font-semibold uppercase tracking-wide text-medical-700">
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
