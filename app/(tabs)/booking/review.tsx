import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ItineraryDashboard } from '@/components/domain/ItineraryDashboard';
import { Badge, Button, Card } from '@/components/ui';
import { useTrip } from '@/hooks/useTrip';
import { BOOKING_HREF } from '@/utils/booking';

export default function ItineraryReviewScreen() {
  const router = useRouter();
  const trip = useTrip();
  const { itinerary } = trip;
  const isTravel = trip.tripMode === 'travel';

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-clinical-700 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-clinical-100">
          All-in-one dashboard
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">Itinerary Summary</Text>
        <Text className="mt-1 text-sm text-clinical-100">
          Every selection — flight, seat, lodging, dining, entertainment, rides, and car —
          consolidated for your assignment.
        </Text>
      </View>

      {!trip.destination ? (
        <Card>
          <Text className="text-sm text-slate-600">
            Start in the Trip Hub by choosing a facility or destination city. Each step adds to this
            summary automatically.
          </Text>
        </Card>
      ) : (
        <>
          <ItineraryDashboard itinerary={itinerary} />

          <Card>
            <View className="gap-2">
              <Text className="text-base font-semibold text-slate-900">Ready to confirm?</Text>
              <Text className="text-sm text-slate-600">
                Required: lodging, at least one dining pick from City Finder, and ground transport
                (ride-share or rental). Facility, gym, groceries, and entertainment are optional.
                Flights can be booked later on the airline and imported via boarding pass.
              </Text>
              <Badge
                label={
                  isTravel
                    ? 'Travel mode — itinerary confirmed'
                    : trip.itineraryConfirmed
                      ? 'Itinerary confirmed'
                      : itinerary.isReadyToConfirm
                        ? 'Itinerary ready — confirm when satisfied'
                        : `${itinerary.completionPercent}% complete — finish remaining steps`
                }
                tone={isTravel || itinerary.isReadyToConfirm ? 'success' : 'warning'}
              />
            </View>
          </Card>

          {isTravel ? (
            <Button
              label="Edit itinerary"
              variant="soft"
              onPress={() => {
                trip.editItinerary();
                router.replace(BOOKING_HREF.hub);
              }}
            />
          ) : (
            <Button
              label={itinerary.isReadyToConfirm ? 'Confirm itinerary' : 'Complete required steps'}
              variant={itinerary.isReadyToConfirm ? 'success' : 'secondary'}
              disabled={!itinerary.isReadyToConfirm}
              onPress={() => {
                trip.confirmItinerary();
                router.replace(BOOKING_HREF.hub);
              }}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}
