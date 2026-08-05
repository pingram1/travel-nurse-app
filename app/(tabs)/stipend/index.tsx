import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Badge, Card, SectionHeader, Toggle } from '@/components/ui';
import { useStipendCalculator } from '@/hooks/useStipendCalculator';
import { useTrip } from '@/hooks/useTrip';
import { formatCurrency } from '@/utils/currency';

export default function StipendScreen() {
  const stipend = useStipendCalculator();
  const trip = useTrip();

  // Keep the tracker in sync with the lodging market for the selected facility.
  useEffect(() => {
    stipend.setLodgingOptions(
      trip.lodging.map((listing) => ({
        id: listing.id,
        name: listing.name,
        provider: listing.provider,
        nightlyRate: listing.nightlyRate,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.lodging]);

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-medical-700 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-medical-200">
          Contract Finances
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">Stipend Tracker</Text>
        <Text className="mt-1 text-sm text-medical-100">
          {trip.hospital
            ? `Tracking lodging variance for ${trip.hospital.name}`
            : 'Select a facility in the Trip tab to track live lodging variance.'}
        </Text>
      </View>

      <Card title="Contract snapshot">
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600">Gross weekly pay</Text>
            <Text className="text-sm font-semibold text-slate-900">
              {formatCurrency(stipend.contractGrossPay)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600">Daily housing stipend</Text>
            <Text className="text-sm font-semibold text-slate-900">
              {formatCurrency(stipend.dailyHousingStipendRate)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600">Tax home</Text>
            <Text className="text-sm font-semibold text-slate-900">
              {stipend.taxHomeAddress.city}, {stipend.taxHomeAddress.state}
            </Text>
          </View>
          <View className="mt-2 rounded-xl bg-clinical-50 p-3">
            <Text className="text-xs font-semibold uppercase tracking-wide text-clinical-700">
              Estimated take-home
            </Text>
            <Text className="mt-0.5 text-2xl font-bold text-clinical-700">
              {formatCurrency(stipend.estimatedTakeHome)}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <Toggle
          label="Highlight tax deductibility"
          description="Surface professional expenses that may be deductible."
          value={stipend.highlightTaxDeductibility}
          onValueChange={stipend.setHighlightTaxDeductibility}
        />
      </Card>

      {stipend.subscriptionDeductibleNote ? (
        <Card className="border-clinical-200 bg-clinical-50">
          <Text className="text-sm text-clinical-800">{stipend.subscriptionDeductibleNote}</Text>
        </Card>
      ) : null}

      <SectionHeader
        title="Lodging vs. stipend variance"
        subtitle="Options priced over your daily stipend are filtered out"
      />
      {stipend.filteredLodgingOptions.length === 0 ? (
        <Card>
          <Text className="text-sm text-slate-600">
            No lodging market loaded yet — pick a facility in the Trip tab.
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {stipend.filteredLodgingOptions.map((option) => (
            <Card key={option.id}>
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-900">{option.name}</Text>
                  <Text className="mt-0.5 text-sm text-slate-500">
                    {formatCurrency(option.nightlyRate)}/night ·{' '}
                    {option.provider === 'hotel' ? 'Hotel' : 'Airbnb'}
                  </Text>
                </View>
                <Badge
                  label={
                    option.stipendVariance === 'at'
                      ? 'At stipend'
                      : `${formatCurrency(Math.abs(option.varianceAmount))} under`
                  }
                  tone="success"
                />
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
