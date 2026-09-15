import { buildStubSafetyRating } from '@/services/api/safetyService';
import { selectTripData, useTripStore } from '../tripStore';
import type { FlightOption, Hospital, LodgingListing } from '@/types';

function sampleHospital(overrides: Partial<Hospital> = {}): Hospital {
  const id = overrides.id ?? 'npi-1000000001';
  const name = overrides.name ?? 'Mercy General Hospital';
  return {
    id,
    name,
    city: 'Portland',
    state: 'OR',
    airportCode: 'PDX',
    address: {
      street: '1200 Oak Street',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'US',
    },
    coordinates: { latitude: 45.5152, longitude: -122.6784 },
    safety: buildStubSafetyRating({
      facilityId: id,
      facilityName: name,
      zipCode: '97201',
    }).data,
    ...overrides,
  };
}

function sampleLodging(hospitalId: string): LodgingListing[] {
  return [
    {
      id: 'l1',
      hospitalId,
      name: 'Riverside Extended Stay',
      provider: 'hotel',
      nightlyRate: 92,
      distanceMiles: 1.4,
      guestRating: 4.5,
      safetyPreference: 'preferred',
    },
    {
      id: 'l2',
      hospitalId,
      name: 'Budget Corridor Inn',
      provider: 'hotel',
      nightlyRate: 129,
      distanceMiles: 3.8,
      guestRating: 3.9,
      safetyPreference: 'caution',
    },
    {
      id: 'l3',
      hospitalId,
      name: 'Stipend Stretch Loft',
      provider: 'airbnb',
      nightlyRate: 140,
      distanceMiles: 2.1,
      guestRating: 4.8,
      safetyPreference: 'standard',
    },
  ];
}

function sampleFlights(hospitalId: string): FlightOption[] {
  return [
    {
      id: 'f1',
      hospitalId,
      airline: 'Alaska',
      airlineCode: 'AS',
      flightNumber: 'AS 512',
      departureAirport: 'AUS',
      arrivalAirport: 'PDX',
      departureTime: '2026-08-01T08:15:00Z',
      arrivalTime: '2026-08-01T12:40:00Z',
      price: 248,
      nonstop: true,
      aircraft: 'Boeing 737-900',
      cabinLayout: 'narrow-3-3',
      bookingAppUrl: 'alaskaair://',
      bookingWebUrl: 'https://www.alaskaair.com/search/bookflights',
    },
  ];
}

function tripSlice(overrides: Partial<ReturnType<typeof useTripStore.getState>> = {}) {
  const base = useTripStore.getState();
  return {
    hospitalResults: base.hospitalResults,
    selectedHospital: base.selectedHospital,
    destination: base.destination,
    facilitySkipped: base.facilitySkipped,
    lodgingResults: base.lodgingResults,
    restaurantResults: base.restaurantResults,
    flightResults: base.flightResults,
    selectedLodgingId: base.selectedLodgingId,
    selectedFlightId: base.selectedFlightId,
    selectedSeat: base.selectedSeat,
    selectedRestaurantIds: base.selectedRestaurantIds,
    selectedTransitId: base.selectedTransitId,
    selectedCarRentalId: base.selectedCarRentalId,
    housingFirstEnabled: base.housingFirstEnabled,
    contractStart: base.contractStart,
    contractEnd: base.contractEnd,
    boardingPass: base.boardingPass,
    originAirport: base.originAirport,
    hospitalsLoading: base.hospitalsLoading,
    lodgingLoading: base.lodgingLoading,
    diningLoading: base.diningLoading,
    flightsLoading: base.flightsLoading,
    itineraryConfirmed: base.itineraryConfirmed,
    tripMode: base.tripMode,
    rentalLog: base.rentalLog,
    rideShareLog: base.rideShareLog,
    ...overrides,
  };
}

describe('tripStore', () => {
  beforeEach(() => {
    useTripStore.getState().reset();
  });

  it('selecting a hospital resets lodging, flight, and seat selections', () => {
    const first = sampleHospital({ id: 'npi-1', name: 'Hospital One' });
    const second = sampleHospital({
      id: 'npi-2',
      name: 'Hospital Two',
      city: 'Houston',
      state: 'TX',
      airportCode: 'IAH',
    });

    useTripStore.getState().selectHospital(first);
    useTripStore.getState().setLodgingResults(sampleLodging(first.id));
    useTripStore.getState().setFlightResults(sampleFlights(first.id));
    useTripStore.getState().selectLodging('l1');
    useTripStore.getState().selectFlight('f1');
    useTripStore.getState().selectSeat({
      flightId: 'f1',
      seatId: '8A',
      row: 8,
      column: 'A',
      seatClass: 'economy',
      price: 0,
      label: '8A',
    });

    useTripStore.getState().selectHospital(second);

    const state = useTripStore.getState();
    expect(state.selectedHospital?.id).toBe('npi-2');
    expect(state.selectedLodgingId).toBeNull();
    expect(state.selectedFlightId).toBeNull();
    expect(state.selectedSeat).toBeNull();
    expect(state.lodgingResults).toEqual([]);
    expect(state.flightResults).toEqual([]);
  });

  it('skipping the facility still allows a city destination anchor', () => {
    useTripStore.getState().skipFacility();
    useTripStore.getState().setDestination({
      id: 'city-houston-tx',
      label: 'Houston, TX',
      city: 'Houston',
      state: 'TX',
      airportCode: 'IAH',
      coordinates: { latitude: 29.76, longitude: -95.37 },
      source: 'city',
    });

    const state = useTripStore.getState();
    expect(state.selectedHospital).toBeNull();
    expect(state.facilitySkipped).toBe(true);
    expect(state.destination?.airportCode).toBe('IAH');

    const data = selectTripData(tripSlice({ ...state }), 110);
    expect(data.destination?.label).toBe('Houston, TX');
    expect(data.itinerary.facilityName).toBe('No facility selected');
  });

  it('derives safety rating and scoped lodging/flights from catalogs', () => {
    const hospital = sampleHospital();
    const lodging = sampleLodging(hospital.id);
    const flights = sampleFlights(hospital.id);

    const data = selectTripData(
      tripSlice({
        selectedHospital: hospital,
        hospitalResults: [hospital],
        lodgingResults: lodging,
        flightResults: flights,
      }),
      110,
    );

    expect(data.safety?.facilityName).toBe('Mercy General Hospital');
    expect(data.lodging.every((l) => l.hospitalId === hospital.id)).toBe(true);
    expect(data.flights.every((f) => f.hospitalId === hospital.id)).toBe(true);
  });

  it('recommends only lodging within safety preference and stipend budget', () => {
    const hospital = sampleHospital();
    const lodging = sampleLodging(hospital.id);

    const data = selectTripData(
      tripSlice({
        selectedHospital: hospital,
        lodgingResults: lodging,
      }),
      110,
    );

    for (const listing of data.recommendedLodging) {
      expect(listing.safetyPreference).not.toBe('caution');
      expect(listing.nightlyRate).toBeLessThanOrEqual(110);
    }
    expect(data.flaggedLodging.map((l) => l.id)).toEqual(expect.arrayContaining(['l2', 'l3']));
    expect(data.recommendedLodging.map((l) => l.id)).toEqual(['l1']);
  });

  it('builds itinerary summary from trip selections', () => {
    const hospital = sampleHospital();
    useTripStore.getState().selectHospital(hospital);
    useTripStore.getState().setLodgingResults(sampleLodging(hospital.id));
    useTripStore.getState().setFlightResults(sampleFlights(hospital.id));
    useTripStore.getState().selectLodging('l1');
    useTripStore.getState().selectFlight('f1');
    useTripStore.getState().selectTransit('transit-uber');
    useTripStore.getState().selectCarRental(`car-${hospital.id}-turo-compact-suv`);

    const state = useTripStore.getState();
    const data = selectTripData(tripSlice({ ...state }), 110);

    expect(data.itinerary.lodging?.name).toBe('Riverside Extended Stay');
    expect(data.itinerary.groundTransit.rideTransport?.provider).toBe('uber');
    expect(data.itinerary.groundTransit.carRental?.provider).toBe('turo');
    expect(data.itinerary.estimatedTotal).toBeGreaterThan(0);
  });

  it('maps boarding pass extract onto flight + seat itinerary', () => {
    const hospital = sampleHospital();
    useTripStore.getState().selectHospital(hospital);

    const flight = sampleFlights(hospital.id)[0]!;
    useTripStore.getState().applyBoardingPassToItinerary(
      {
        airline: 'Alaska',
        flightNumber: 'AS 512',
        seatNumber: '8A',
        departureAirport: 'AUS',
        arrivalAirport: 'PDX',
        departureDate: '2026-08-01',
        passengerName: null,
        rawText: 'Alaska AS 512 AUS → PDX Seat 8A',
        confidence: 0.8,
      },
      flight,
      {
        flightId: flight.id,
        seatId: '8A',
        row: 8,
        column: 'A',
        seatClass: 'economy',
        price: 0,
        label: '8A',
      },
    );

    const state = useTripStore.getState();
    expect(state.selectedFlightId).toBe(flight.id);
    expect(state.selectedSeat?.label).toBe('8A');
    expect(state.boardingPass?.flightNumber).toBe('AS 512');
  });

  it('enters travel mode on confirm and returns to planning on edit', () => {
    useTripStore.getState().confirmItinerary();
    expect(useTripStore.getState().tripMode).toBe('travel');
    expect(useTripStore.getState().itineraryConfirmed).toBe(true);

    useTripStore.getState().editItinerary();
    expect(useTripStore.getState().tripMode).toBe('planning');
    expect(useTripStore.getState().itineraryConfirmed).toBe(false);
  });

  it('keeps itinerary selections when returning to planning to edit', () => {
    const hospital = sampleHospital();
    useTripStore.getState().selectHospital(hospital);
    useTripStore.getState().selectLodging('l1');
    useTripStore.getState().confirmItinerary();
    useTripStore.getState().editItinerary();

    const state = useTripStore.getState();
    expect(state.selectedHospital?.id).toBe(hospital.id);
    expect(state.selectedLodgingId).toBe('l1');
    expect(state.tripMode).toBe('planning');
  });

  it('records rental mileage, insurance, and photos', () => {
    useTripStore.getState().setRentalStartMileage(12000);
    useTripStore.getState().setRentalEndMileage(12140);
    useTripStore.getState().setRentalInsuranceOnFile(true);
    useTripStore.getState().addRentalLogEntry({
      photoKind: 'before',
      photoUri: 'file://before.jpg',
    });
    useTripStore.getState().addRentalLogEntry({
      photoKind: 'fuel',
      photoUri: 'file://fuel.jpg',
      fuelLevel: '3/4',
    });

    const log = useTripStore.getState().rentalLog;
    expect(log.startMileage).toBe(12000);
    expect(log.endMileage).toBe(12140);
    expect(log.insuranceOnFile).toBe(true);
    expect(log.entries).toHaveLength(2);
    expect(log.entries[1]?.fuelLevel).toBe('3/4');

    useTripStore.getState().removeRentalLogEntry(log.entries[0]!.id);
    expect(useTripStore.getState().rentalLog.entries).toHaveLength(1);
  });

  it('records and removes ride-share screenshots', () => {
    useTripStore.getState().addRideShareScreenshot('file://ride.jpg', 'Airport drop-off');
    expect(useTripStore.getState().rideShareLog).toHaveLength(1);
    expect(useTripStore.getState().rideShareLog[0]?.notes).toBe('Airport drop-off');

    const id = useTripStore.getState().rideShareLog[0]!.id;
    useTripStore.getState().removeRideShareScreenshot(id);
    expect(useTripStore.getState().rideShareLog).toHaveLength(0);
  });

  it('resets travel mode and logs when the destination changes', () => {
    useTripStore.getState().confirmItinerary();
    useTripStore.getState().setRentalStartMileage(50);
    useTripStore.getState().addRideShareScreenshot('file://ride.jpg');
    useTripStore.getState().skipFacility();

    const state = useTripStore.getState();
    expect(state.tripMode).toBe('planning');
    expect(state.itineraryConfirmed).toBe(false);
    expect(state.rentalLog.startMileage).toBeNull();
    expect(state.rideShareLog).toEqual([]);
  });
});
