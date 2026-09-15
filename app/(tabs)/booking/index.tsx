import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';

import { BookingStepBar } from '@/components/domain/BookingStepBar';
import { ContractDateRangePicker } from '@/components/domain/ContractDateRangePicker';
import { FlightCard } from '@/components/domain/FlightCard';
import { HospitalSearchField } from '@/components/domain/HospitalSearchField';
import { HospitalSelectorCard } from '@/components/domain/HospitalSelectorCard';
import { ItineraryDashboard } from '@/components/domain/ItineraryDashboard';
import { LodgingCard } from '@/components/domain/LodgingCard';
import { RentalLogPanel } from '@/components/domain/RentalLogPanel';
import { RideShareLogPanel } from '@/components/domain/RideShareLogPanel';
import {
  Badge,
  Button,
  Card,
  HeroBanner,
  IconAction,
  Input,
  SectionHeader,
  Toggle,
} from '@/components/ui';
import { APP_CONFIG } from '@/constants/config';
import { useAuth } from '@/hooks/useAuth';
import { useCityDestination } from '@/hooks/useCityDestination';
import { useFlightSearch } from '@/hooks/useFlightSearch';
import { useHospitalSearch } from '@/hooks/useHospitalSearch';
import { useTrip } from '@/hooks/useTrip';
import { useTravelLog } from '@/hooks/useTravelLog';
import { useStipendStore } from '@/store/stipendStore';

import type { BookingWorkflowStep, Hospital } from '@/types';
import { resolveAirportCode } from '@/utils/airportLookup';
import { BOOKING_HREF, getStepRoute } from '@/utils/booking';
import { formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/datetime';
import { greetingFirstName, userInitials } from '@/utils/userDisplay';

function toIsoDateStart(dateOnly: string): string {
  return `${dateOnly}T00:00:00.000Z`;
}

function taxHomeAirportCode(city: string, state: string): string | null {
  if (!city.trim() || state.trim().length !== 2) return null;
  return resolveAirportCode(city, state);
}

export default function TripHubScreen() {
  const router = useRouter();
  const { user, isPro } = useAuth();
  const trip = useTrip();
  const travelLog = useTravelLog();
  const firstName = greetingFirstName(user);
  const initials = userInitials(user);
  const cityDestination = useCityDestination();
  const [cityDraft, setCityDraft] = useState('');
  const [fuelDraft, setFuelDraft] = useState('');

  const hospitalSearch = useHospitalSearch();
  const flightSearch = useFlightSearch();
  const taxHome = useStipendStore((s) => s.taxHomeAddress);
  const suggestedOrigin = useMemo(
    () => taxHomeAirportCode(taxHome.city, taxHome.state),
    [taxHome.city, taxHome.state],
  );
  const [originDraft, setOriginDraft] = useState(trip.originAirport);
  const [dateError, setDateError] = useState<string | null>(null);

  const setOriginAirport = trip.setOriginAirport;
  const storedOrigin = trip.originAirport;

  // Prefill departure airport from tax home when set; never hardcode AUS.
  useEffect(() => {
    if (storedOrigin) {
      setOriginDraft(storedOrigin);
      return;
    }
    if (suggestedOrigin) {
      setOriginDraft(suggestedOrigin);
      setOriginAirport(suggestedOrigin);
      return;
    }
    setOriginDraft('');
  }, [suggestedOrigin, storedOrigin, setOriginAirport]);

  const handleSelectHospital = (hospital: Hospital) => {
    void hospitalSearch.selectHospital(hospital).then(() => {
      trip.setActiveStep(trip.housingFirstEnabled ? 'housing' : 'flights');
    });
  };

  const handleSkipFacility = () => {
    trip.skipFacility();
    trip.setActiveStep(trip.housingFirstEnabled ? 'housing' : 'flights');
  };

  const handleSetCityDestination = () => {
    void cityDestination.resolveCity(cityDraft).then((ok) => {
      if (ok) trip.setActiveStep(trip.housingFirstEnabled ? 'housing' : 'flights');
    });
  };

  const handleSaveContractDates = (start: string, end: string) => {
    if (end < start) {
      setDateError('Contract end must be on or after the start date.');
      return;
    }
    setDateError(null);
    trip.setContractDates(toIsoDateStart(start), toIsoDateStart(end));
  };

  const handleFlightSelect = (flightId: string) => {
    trip.selectFlight(flightId);
    trip.setActiveStep('flights');
  };

  const handleBookedExternally = (flightId: string) => {
    trip.selectFlight(flightId);
    trip.setActiveStep('flights');
    router.push(BOOKING_HREF.boardingPass);
  };

  const handleSkipFlights = () => {
    trip.setActiveStep(trip.housingFirstEnabled ? 'dining' : 'housing');
    router.push(BOOKING_HREF.dining);
  };

  const handleStepPress = (step: BookingWorkflowStep) => {
    trip.setActiveStep(step);
    const route = getStepRoute(step);
    if (route) router.push(route);
  };

  const hasContractDates = Boolean(trip.contractStart && trip.contractEnd);
  const hasAnchor = Boolean(trip.destination);
  const openProfile = () => router.push('/(tabs)/profile');

  if (trip.tripMode === 'travel' && hasAnchor) {
    const destinationTitle = trip.hospital?.name ?? trip.destination?.label ?? 'Your assignment';
    const travelSubtitle = hasContractDates
      ? `Contract ${formatShortDate(trip.contractStart!)} — ${formatShortDate(trip.contractEnd!)}`
      : 'Confirmed itinerary';

    return (
      <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-5 p-4 pb-10">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-medical-600">
              {firstName ? `Hello, ${firstName}` : 'Hello'}
            </Text>
            <Text className="text-2xl font-bold tracking-tight text-slate-900">Your Trip Hub</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            onPress={openProfile}
            className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-medical-500"
          >
            {user?.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} className="h-12 w-12" />
            ) : (
              <Text className="text-base font-bold text-white">{initials}</Text>
            )}
          </Pressable>
        </View>

        <HeroBanner eyebrow="Travel mode" title={destinationTitle} subtitle={travelSubtitle} />

        <View className="items-start">
          <Badge label="Traveling" tone="success" />
        </View>

        <ItineraryDashboard itinerary={trip.itinerary} />

        <Button label="Edit itinerary" variant="soft" onPress={trip.editItinerary} />

        {trip.selectedCarRental ? (
          <RentalLogPanel
            vehicleLabel={trip.selectedCarRental.label}
            weeklyRate={trip.selectedCarRental.weeklyRate}
            log={travelLog.rentalLog}
            fuelDraft={fuelDraft}
            isPicking={travelLog.isPicking}
            error={travelLog.error}
            onFuelDraftChange={setFuelDraft}
            onStartMileageChange={travelLog.setStartMileage}
            onEndMileageChange={travelLog.setEndMileage}
            onInsuranceChange={travelLog.setInsuranceOnFile}
            onPickInsurancePhoto={() => {
              void travelLog.pickInsurancePhoto();
            }}
            onAddPhoto={(kind) => {
              void travelLog.addRentalPhoto(kind, kind === 'fuel' ? fuelDraft : null);
            }}
            onRemoveEntry={travelLog.removeRentalEntry}
          />
        ) : trip.selectedTransit ? (
          <RideShareLogPanel
            providerLabel={trip.selectedTransit.label}
            entries={travelLog.rideShareLog}
            isPicking={travelLog.isPicking}
            error={travelLog.error}
            onAddFromLibrary={() => {
              void travelLog.addRideScreenshot();
            }}
            onCapturePhoto={() => {
              void travelLog.captureRideScreenshot();
            }}
            onRemove={travelLog.removeRideScreenshot}
          />
        ) : null}

        <SectionHeader
          title="While you are there"
          subtitle="Saved dining plus nearby gyms and entertainment"
        />
        <Card elevated className="!p-4">
          <View className="flex-row gap-2">
            <IconAction
              label="City Finder"
              icon="map"
              tone="clinical"
              onPress={() => router.push(BOOKING_HREF.dining)}
            />
            <IconAction
              label="Summary"
              icon="document-text"
              tone="neutral"
              onPress={() => router.push(BOOKING_HREF.review)}
            />
          </View>
        </Card>
      </ScrollView>
    );
  }

  const lodgingSection = hasAnchor ? (
    <View className="gap-3">
      <SectionHeader
        title={`Lodging within ${APP_CONFIG.lodgingRadiusMiles} mi`}
        subtitle={`Safest options first · under ${formatCurrency(trip.dailyStipendRate)}/night stipend filter`}
      />
      {trip.lodgingLoading ? (
        <Card variant="soft">
          <View className="flex-row items-center gap-3">
            <ActivityIndicator color="#0f766e" />
            <Text className="text-sm text-slate-600">
              Mapping hotels & short-term stays near {trip.destination?.label}…
            </Text>
          </View>
        </Card>
      ) : null}
      {trip.recommendedLodging.map((listing) => (
        <LodgingCard
          key={listing.id}
          listing={listing}
          dailyStipendRate={trip.dailyStipendRate}
          selected={trip.selectedLodging?.id === listing.id}
          isPro={isPro}
          onUnlockPro={openProfile}
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
          isPro={isPro}
          onUnlockPro={openProfile}
          onSelect={trip.selectLodging}
        />
      ))}
      {!trip.lodgingLoading && trip.lodging.length === 0 ? (
        <Card variant="soft">
          <Text className="text-sm text-slate-600">
            {APP_CONFIG.googlePlacesApiKey
              ? `No lodging found within ${APP_CONFIG.lodgingRadiusMiles} miles of this destination. Refresh location or try another city.`
              : `No live lodging found within ${APP_CONFIG.lodgingRadiusMiles} miles. Set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY and restart Expo for Google Places coverage.`}
          </Text>
        </Card>
      ) : null}
    </View>
  ) : null;

  const flightSection = hasAnchor ? (
    <View className="gap-3">
      <SectionHeader
        title={`Flights to ${trip.destination?.airportCode ?? ''}`}
        subtitle={
          flightSearch.departureWindow && trip.originAirport
            ? `${trip.originAirport} → ${trip.destination?.airportCode} · ${flightSearch.departureWindow.start} – ${flightSearch.departureWindow.end}`
            : 'Enter departure airport and contract dates to load flights'
        }
      />
      <Card>
        <View className="gap-3">
          <Input
            label="Departure airport"
            value={originDraft}
            placeholder="e.g. DFW"
            autoCapitalize="characters"
            maxLength={3}
            onChangeText={setOriginDraft}
            onBlur={() => {
              const code = originDraft.trim().toUpperCase();
              if (code.length === 3) {
                trip.setOriginAirport(code);
              } else if (!code) {
                trip.setOriginAirport('');
              }
            }}
            hint={
              suggestedOrigin
                ? `Suggested from tax home: ${suggestedOrigin}`
                : 'Enter your tax-home airport (3-letter code) — left blank until you set tax home or type a code'
            }
          />
          <Button
            label="Update flight search"
            variant="soft"
            disabled={!hasContractDates || originDraft.trim().length !== 3}
            onPress={() => {
              if (originDraft.trim().length === 3) {
                trip.setOriginAirport(originDraft.trim());
              }
              flightSearch.refetch();
            }}
          />
        </View>
      </Card>
      {!hasContractDates || originDraft.trim().length !== 3 ? (
        <Card variant="soft">
          <Text className="text-sm text-slate-600">
            {!hasContractDates
              ? 'Flights stay locked until you enter your contract start and end dates.'
              : 'Enter a 3-letter departure airport to search flights. Tax home on the Stipend tab can autofill this.'}
          </Text>
        </Card>
      ) : null}
      {trip.flightsLoading ? (
        <Card variant="soft">
          <View className="flex-row items-center gap-3">
            <ActivityIndicator color="#0f766e" />
            <Text className="text-sm text-slate-600">Searching major airlines for your dates…</Text>
          </View>
        </Card>
      ) : null}
      <Card variant="soft">
        <Text className="text-sm leading-5 text-slate-600">
          Tap a flight to select it, then book on the airline app or website. When you are done,
          import your boarding pass — seat booking is not completed inside this app.
        </Text>
      </Card>
      {trip.flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          selected={trip.selectedFlight?.id === flight.id}
          onSelect={handleFlightSelect}
          onBookedExternally={handleBookedExternally}
        />
      ))}
      {hasContractDates && !trip.flightsLoading && trip.flights.length === 0 ? (
        <Card variant="soft">
          <Text className="text-sm text-slate-600">
            No flights in this window. Adjust your departure airport or contract dates.
          </Text>
        </Card>
      ) : null}
      {trip.boardingPass?.flightNumber ? (
        <Card variant="success">
          <Text className="text-sm font-semibold text-clinical-800">
            Boarding pass linked · {trip.boardingPass.airline} {trip.boardingPass.flightNumber}
            {trip.boardingPass.seatNumber ? ` · Seat ${trip.boardingPass.seatNumber}` : ''}
          </Text>
          <View className="mt-3">
            <Button
              label="View seat on aircraft map"
              variant="soft"
              onPress={() => router.push(BOOKING_HREF.seats)}
            />
          </View>
        </Card>
      ) : null}
      <Button label="Skip flights for now" variant="ghost" onPress={handleSkipFlights} />
      <Button
        label="Import boarding pass / update flight later"
        variant="soft"
        onPress={() => router.push(BOOKING_HREF.boardingPass)}
      />
    </View>
  ) : null;

  const heroSubtitle =
    hasAnchor && hasContractDates
      ? `Contract ${formatShortDate(trip.contractStart!)} — ${formatShortDate(trip.contractEnd!)}`
      : hasAnchor
        ? 'Next: enter your contract start and end dates.'
        : 'Search a hospital or skip the facility and plan by city.';

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-5 p-4 pb-10">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-semibold text-medical-600">
            {firstName ? `Hello, ${firstName}` : 'Hello'}
          </Text>
          <Text className="text-2xl font-bold tracking-tight text-slate-900">Your Trip Hub</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={openProfile}
          className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-medical-500"
        >
          {user?.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} className="h-12 w-12" />
          ) : (
            <Text className="text-base font-bold text-white">{initials}</Text>
          )}
        </Pressable>
      </View>

      <HeroBanner
        eyebrow="All-in-one assignment logistics"
        title={trip.hospital?.name ?? trip.destination?.label ?? 'Ready for your next contract'}
        subtitle={heroSubtitle}
      />

      {hasAnchor ? (
        <BookingStepBar
          steps={trip.workflowSteps}
          activeStep={trip.activeStep}
          onStepPress={handleStepPress}
          completionPercent={trip.itinerary.completionPercent}
        />
      ) : null}

      <SectionHeader
        title="1. Facility (optional)"
        subtitle="Search a hospital, or skip and plan lodging around a city"
      />
      <Card>
        <HospitalSearchField
          query={hospitalSearch.query}
          onQueryChange={hospitalSearch.setQuery}
          results={hospitalSearch.results}
          isFetching={hospitalSearch.isFetching}
          selectedHospitalId={trip.selectedHospitalId}
          onSelect={handleSelectHospital}
          errorMessage={
            hospitalSearch.error
              ? 'Hospital search is temporarily unavailable. Check your connection and try again.'
              : null
          }
        />
        <View className="mt-3">
          <Button
            label="Skip facility — plan by city"
            variant="ghost"
            onPress={handleSkipFacility}
          />
        </View>
      </Card>

      {trip.hospital ? (
        <HospitalSelectorCard
          hospital={trip.hospital}
          selected
          onSelect={() => {
            /* already selected */
          }}
        />
      ) : trip.destination ? (
        <Card variant="soft">
          <Text className="text-base font-bold text-slate-900">{trip.destination.label}</Text>
          <Text className="mt-1 text-sm text-slate-500">
            City trip · {trip.destination.airportCode} · facility skipped
          </Text>
        </Card>
      ) : trip.facilitySkipped ? (
        <Card>
          <View className="gap-3">
            <Text className="text-sm leading-5 text-slate-600">
              Enter the city you are traveling to. Lodging, City Finder, flights, and ground
              transport will use this destination.
            </Text>
            <Input
              label="Destination city"
              value={cityDraft}
              onChangeText={setCityDraft}
              placeholder="Houston, TX"
              autoCapitalize="words"
              error={cityDestination.error ?? undefined}
            />
            <Button
              label={cityDestination.isResolving ? 'Finding city…' : 'Set destination'}
              loading={cityDestination.isResolving}
              onPress={handleSetCityDestination}
            />
          </View>
        </Card>
      ) : (
        <Card variant="soft">
          <Text className="text-sm leading-5 text-slate-600">
            Select a facility, or skip and enter a city to unlock lodging within{' '}
            {APP_CONFIG.lodgingRadiusMiles} miles, dated flights, City Finder, rides, and car
            rental.
          </Text>
        </Card>
      )}

      {hasAnchor ? (
        <>
          <SectionHeader
            title="2. Contract dates"
            subtitle="Required before flight search — tap start, then end on the calendar"
          />
          <Card>
            <ContractDateRangePicker
              startDate={trip.contractStart?.slice(0, 10) ?? null}
              endDate={trip.contractEnd?.slice(0, 10) ?? null}
              onSave={handleSaveContractDates}
              error={dateError}
            />
            {hasContractDates ? (
              <Text className="mt-3 text-xs text-clinical-700">
                Saved {formatShortDate(trip.contractStart!)} — {formatShortDate(trip.contractEnd!)}
              </Text>
            ) : null}
          </Card>

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

          <SectionHeader
            title="Complete your trip"
            subtitle="City Finder, ground transportation, boarding pass, summary"
          />
          <Card elevated className="!p-4">
            <View className="flex-row gap-2">
              <IconAction
                label="City Finder"
                icon="map"
                tone="clinical"
                onPress={() => handleStepPress('dining')}
              />
              <IconAction label="Ground" icon="car" onPress={() => handleStepPress('ground')} />
              <IconAction
                label="Pass"
                icon="barcode"
                tone="neutral"
                onPress={() => router.push(BOOKING_HREF.boardingPass)}
              />
              <IconAction
                label="Summary"
                icon="document-text"
                tone="neutral"
                onPress={() => handleStepPress('review')}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleStepPress('review')}
              className="mt-3 min-h-[44px] items-center justify-center rounded-2xl bg-medical-50"
            >
              <Text className="text-sm font-semibold text-medical-700">Open itinerary summary</Text>
            </Pressable>
          </Card>

          <ItineraryDashboard itinerary={trip.itinerary} />

          <Button
            label="Scan boarding pass into itinerary"
            variant="soft"
            onPress={() => router.push(BOOKING_HREF.boardingPass)}
          />

          <Button
            label="View full itinerary summary"
            variant="soft"
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
      ) : null}
    </ScrollView>
  );
}
