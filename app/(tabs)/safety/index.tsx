import { ScrollView, Text, View } from 'react-native';

import { SafetyBadge } from '@/components/domain/SafetyBadge';
import { Badge, Card, SectionHeader } from '@/components/ui';
import { useTrip } from '@/hooks/useTrip';

function ScoreBar({
  label,
  value,
  max,
  invert = false,
}: {
  label: string;
  value: number;
  max: number;
  invert?: boolean;
}) {
  const ratio = Math.min(value / max, 1);
  const good = invert ? ratio <= 0.45 : ratio >= 0.8;
  const barWidth: `${number}%` = `${Math.round(ratio * 100)}%`;

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-700">{label}</Text>
        <Text className="text-sm font-bold text-slate-900">{value}</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-slate-100">
        <View
          className={`h-2 rounded-full ${good ? 'bg-clinical-600' : 'bg-caution-600'}`}
          style={{ width: barWidth }}
        />
      </View>
    </View>
  );
}

export default function SafetyScreen() {
  const trip = useTrip();

  if (!trip.hospital || !trip.safety) {
    return (
      <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4">
        <Text className="text-2xl font-bold text-slate-900">Safety Intelligence</Text>
        <Card>
          <Text className="text-sm text-slate-600">
            Select a facility in the Trip tab to view its live safety profile. Grades combine BLS
            OSHA compliance, NIBRS residential crime data, and nurse-verified reviews.
          </Text>
        </Card>
        <SectionHeader title="Facilities at a glance" />
        <View className="gap-3">
          {trip.hospitals.map((hospital) => (
            <Card key={hospital.id}>
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-900">{hospital.name}</Text>
                  <Text className="text-sm text-slate-500">
                    {hospital.city}, {hospital.state}
                  </Text>
                </View>
                <SafetyBadge rating={hospital.safety} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    );
  }

  const { safety, hospital } = trip;

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-medical-700 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-medical-200">
          Safety Intelligence
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">{hospital.name}</Text>
        <Text className="mt-1 text-sm text-medical-100">
          {hospital.address.street}, {hospital.city}, {hospital.state} {hospital.address.zipCode}
        </Text>
        <View className="mt-3">
          <SafetyBadge rating={safety} />
        </View>
      </View>

      <Card title="Composite score breakdown" subtitle="Updated with each facility selection">
        <View className="gap-4">
          <ScoreBar label="BLS OSHA compliance" value={safety.osha.oshaComplianceScore} max={100} />
          <ScoreBar
            label="NIBRS crime index (lower is safer)"
            value={safety.residential.crimeIndex}
            max={100}
            invert
          />
          <ScoreBar
            label={`Nurse-verified rating (${safety.nurseVerified.reviewCount} reviews)`}
            value={safety.nurseVerified.averageScore}
            max={5}
          />
        </View>
      </Card>

      <Card title="How this affects your trip">
        <View className="gap-2">
          <Text className="text-sm text-slate-600">
            Lodging in areas above the crime-index threshold is flagged in the Trip Hub instead of
            recommended.
          </Text>
          <Badge
            label={`${trip.recommendedLodging.length} recommended · ${trip.flaggedLodging.length} flagged stays`}
            tone={trip.flaggedLodging.length > 0 ? 'warning' : 'success'}
          />
        </View>
      </Card>

      <Card title="Data sources">
        <View className="gap-1">
          <Text className="text-sm text-slate-600">· BLS OSHA workplace compliance records</Text>
          <Text className="text-sm text-slate-600">· FBI NIBRS residential crime indices</Text>
          <Text className="text-sm text-slate-600">
            · Verified reviews from credentialed nurses and physicians
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}
