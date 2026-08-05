import { ScrollView, Text, View } from 'react-native';

import { ItineraryDashboard } from '@/components/domain/ItineraryDashboard';
import { Badge, Button, Card } from '@/components/ui';
import { useTrip } from '@/hooks/useTrip';

export default function ItineraryReviewScreen() {
  const trip = useTrip();
  const { itinerary } = trip;

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-clinical-700 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-clinical-100">
          All-in-one dashboard
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">Itinerary Summary</Text>
        <Text className="mt-1 text-sm text-clinical-100">
          Every selection — flight, seat, lodging, food, rides, and car — consolidated for your
          assignment.
        </Text>
      </View>

      {!trip.hospital ? (
        <Card>
          <Text className="text-sm text-slate-600">
            Start in the Trip Hub by choosing your facility. Each step adds to this summary
            automatically.
          </Text>
        </Card>
      ) : (
        <>
          <ItineraryDashboard itinerary={itinerary} />

          <Card>
            <View className="gap-2">
              <Text className="text-base font-semibold text-slate-900">Ready to confirm?</Text>
              <Text className="text-sm text-slate-600">
                Travel nurses typically need lodging, flight + seat, at least one dining option,
                airport transit, and a weekly car for shift commutes. Complete the missing steps
                below.
              </Text>
              <Badge
                label={
                  itinerary.isReadyToConfirm
                    ? 'Itinerary ready — confirm when satisfied'
                    : `${itinerary.completionPercent}% complete — finish remaining steps`
                }
                tone={itinerary.isReadyToConfirm ? 'success' : 'warning'}
              />
            </View>
          </Card>

          <Button
            label={itinerary.isReadyToConfirm ? 'Confirm itinerary (demo)' : 'Complete more steps'}
            variant={itinerary.isReadyToConfirm ? 'success' : 'secondary'}
            disabled={!itinerary.isReadyToConfirm}
            onPress={() => undefined}
          />
        </>
      )}
    </ScrollView>
  );
}
