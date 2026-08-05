import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BookingStepBar } from '@/components/domain/BookingStepBar';
import { FlightCard } from '@/components/domain/FlightCard';
import { HospitalSelectorCard } from '@/components/domain/HospitalSelectorCard';
import { ItineraryDashboard } from '@/components/domain/ItineraryDashboard';
import { LodgingCard } from '@/components/domain/LodgingCard';
import { Badge, Button, Card, SectionHeader, Toggle } from '@/components/ui';
import { useBooking } from '@/hooks/useBooking';
import { useTrip } from '@/hooks/useTrip';
import { extractWorkOrderFields } from '@/services/api/parserService';
import type { BookingWorkflowStep, WorkOrder } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/datetime';
import { generateRequestId } from '@/utils/uuid';

const SAMPLE_WORK_ORDER = `Facility Name: Mercy General Hospital
Address: 1200 Oak Street, Portland, OR 97201
Start Date: 2026-08-01
End Date: 2026-11-01`;

const HOSPITAL_BY_FACILITY: Record<string, string> = {
  'mercy general': 'mercy-portland',
  "st. luke's": 'stlukes-houston',
  'unity point': 'unity-chicago',
};

function resolveHospitalId(facilityName: string): string | null {
  const lower = facilityName.toLowerCase();
  for (const [key, id] of Object.entries(HOSPITAL_BY_FACILITY)) {
    if (lower.includes(key)) return id;
  }
  return null;
}

const STEP_ROUTES: Partial<Record<BookingWorkflowStep, `./${string}`>> = {
  dining: './dining',
  transit: './transit',
  cars: './cars',
  review: './review',
  seats: './seats',
};

export default function TripHubScreen() {
  const router = useRouter();
  const trip = useTrip();
  const { workOrder, applyWorkOrder } = useBooking();

  useEffect(() => {
    const fields = extractWorkOrderFields(SAMPLE_WORK_ORDER);
    if (!fields || workOrder) return;

    const order: WorkOrder = {
      id: generateRequestId(),
      source: 'email',
      facilityName: fields.facilityName,
      facilityAddress: fields.facilityAddress,
      contractStartDate: fields.contractStartDate,
      contractEndDate: fields.contractEndDate,
      parsedAt: new Date().toISOString(),
      status: 'parsed',
    };
    applyWorkOrder(order);
    trip.setContractDates(fields.contractStartDate, fields.contractEndDate);

    const hospitalId = resolveHospitalId(fields.facilityName);
    if (hospitalId && !trip.selectedHospitalId) {
      trip.selectHospital(hospitalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyWorkOrder, workOrder]);

  const handleFlightSelect = (flightId: string) => {
    trip.selectFlight(flightId);
    trip.setActiveStep('seats');
    router.push('./seats');
  };

  const handleStepPress = (step: BookingWorkflowStep) => {
    trip.setActiveStep(step);
    const route = STEP_ROUTES[step];
    if (route) router.push(route);
  };

  const lodgingSection = trip.hospital ? (
    <View className="gap-3">
      <SectionHeader
        title="Lodging — safety & stipend filtered"
        subtitle={`Recommended stays under ${formatCurrency(trip.dailyStipendRate)}/night in low-crime areas`}
      />
      {trip.recommendedLodging.map((listing) => (
        <LodgingCard
          key={listing.id}
          listing={listing}
          dailyStipendRate={trip.dailyStipendRate}
          selected={trip.selectedLodging?.id === listing.id}
          onSelect={(id) => {
            trip.selectLodging(id);
            trip.setActiveStep('flights');
          }}
        />
      ))}
      {trip.flaggedLodging.map((listing) => (
        <LodgingCard
          key={listing.id}
          listing={listing}
          dailyStipendRate={trip.dailyStipendRate}
          selected={trip.selectedLodging?.id === listing.id}
          flagged
          onSelect={trip.selectLodging}
        />
      ))}
    </View>
  ) : null;

  const flightSection = trip.hospital ? (
    <View className="gap-3">
      <SectionHeader
        title={`Flights to ${trip.hospital.airportCode}`}
        subtitle="Select a flight to open the 3D seat map"
      />
      {trip.flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          selected={trip.selectedFlight?.id === flight.id}
          onSelect={handleFlightSelect}
        />
      ))}
      {trip.selectedFlight && trip.selectedSeat ? (
        <Card className="border-clinical-200 bg-clinical-50">
          <Text className="text-sm font-semibold text-clinical-800">
            Seat {trip.selectedSeat.label} confirmed on {trip.selectedFlight.airline}{' '}
            {trip.selectedFlight.flightNumber}
          </Text>
        </Card>
      ) : null}
    </View>
  ) : null;

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-medical-700 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-medical-200">
          All-in-One Assignment Logistics
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">Your Trip Hub</Text>
        <Text className="mt-1 text-sm text-medical-100">
          Flight, seat, lodging, food, rides, and car — one flow built for 13-week contracts.
        </Text>
        {workOrder ? (
          <View className="mt-3 rounded-xl bg-medical-800/70 p-3">
            <Text className="text-sm font-semibold text-white">
              Work order: {workOrder.facilityName}
            </Text>
            <Text className="mt-0.5 text-xs text-medical-200">
              Contract {formatShortDate(workOrder.contractStartDate)} —{' '}
              {formatShortDate(workOrder.contractEndDate)}
            </Text>
          </View>
        ) : null}
      </View>

      {trip.hospital ? (
        <BookingStepBar
          steps={trip.workflowSteps}
          activeStep={trip.activeStep}
          onStepPress={handleStepPress}
          completionPercent={trip.itinerary.completionPercent}
        />
      ) : null}

      <SectionHeader
        title="1. Choose your facility"
        subtitle="Safety grade from OSHA + NIBRS + nurse-verified reviews"
      />
      <View className="gap-3">
        {trip.hospitals.map((hospital) => (
          <HospitalSelectorCard
            key={hospital.id}
            hospital={hospital}
            selected={trip.selectedHospitalId === hospital.id}
            onSelect={(id) => {
              trip.selectHospital(id);
              trip.setActiveStep(trip.housingFirstEnabled ? 'housing' : 'flights');
            }}
          />
        ))}
      </View>

      {trip.hospital ? (
        <>
          <Card>
            <Toggle
              label="Housing-First mode"
              description="Lock in lodging before flights to maximize your housing stipend."
              value={trip.housingFirstEnabled}
              onValueChange={trip.setHousingFirstEnabled}
            />
          </Card>

          {trip.housingFirstEnabled ? lodgingSection : flightSection}
          {trip.housingFirstEnabled ? flightSection : lodgingSection}

          <SectionHeader title="Complete your trip" subtitle="Food, rides, car, and summary" />
          <View className="flex-row flex-wrap gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => handleStepPress('dining')}
              className="min-h-[44px] flex-1 min-w-[45%] flex-row items-center justify-center gap-2 rounded-xl bg-clinical-600 px-4 py-3 active:bg-clinical-700"
            >
              <Ionicons name="restaurant" size={18} color="#ffffff" />
              <Text className="text-sm font-semibold text-white">Food</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleStepPress('transit')}
              className="min-h-[44px] flex-1 min-w-[45%] flex-row items-center justify-center gap-2 rounded-xl bg-medical-600 px-4 py-3 active:bg-medical-700"
            >
              <Ionicons name="car" size={18} color="#ffffff" />
              <Text className="text-sm font-semibold text-white">Rides</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleStepPress('cars')}
              className="min-h-[44px] flex-1 min-w-[45%] flex-row items-center justify-center gap-2 rounded-xl bg-medical-700 px-4 py-3 active:bg-medical-800"
            >
              <Ionicons name="key" size={18} color="#ffffff" />
              <Text className="text-sm font-semibold text-white">Car</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleStepPress('review')}
              className="min-h-[44px] flex-1 min-w-[45%] flex-row items-center justify-center gap-2 rounded-xl border-2 border-medical-600 bg-white px-4 py-3 active:bg-medical-50"
            >
              <Ionicons name="document-text" size={18} color="#1c5a8d" />
              <Text className="text-sm font-semibold text-medical-700">Summary</Text>
            </Pressable>
          </View>

          <ItineraryDashboard itinerary={trip.itinerary} />

          <Button
            label="View full itinerary summary"
            variant="secondary"
            onPress={() => handleStepPress('review')}
          />

          <View className="items-center">
            <Badge
              label={
                trip.itinerary.isReadyToConfirm
                  ? 'Ready to confirm'
                  : `${trip.itinerary.completionPercent}% complete`
              }
              tone={trip.itinerary.isReadyToConfirm ? 'success' : 'warning'}
            />
          </View>
        </>
      ) : (
        <Card>
          <Text className="text-sm text-slate-600">
            Select a facility to unlock the full booking flow — flights with 3D seat selection,
            lodging, dining, Uber/Lyft/Turo, and weekly car rental.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}
