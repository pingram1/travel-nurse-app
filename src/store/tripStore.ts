import { create } from 'zustand';

import { buildCarRentalsForHospital, buildTransitOptions } from '@/services/api/tripData';
import type {
  BoardingPassExtract,
  BookingWorkflowStep,
  CarRentalOption,
  FlightOption,
  Hospital,
  ItinerarySummary,
  LodgingListing,
  RentalLog,
  RentalLogEntry,
  RentalPhotoKind,
  Restaurant,
  RideShareLogEntry,
  SafetyRating,
  SeatSelection,
  TransitOption,
  TripDestination,
  TripMode,
  WorkOrder,
} from '@/types';
import { resolveWorkflowSteps } from '@/utils/booking';
import { destinationFromHospital } from '@/utils/destination';
import { buildItinerarySummary } from '@/utils/itinerary';
import { createEmptyRentalLog } from '@/utils/travelLog';
import { generateRequestId } from '@/utils/uuid';

interface TripState {
  hospitalResults: Hospital[];
  selectedHospital: Hospital | null;
  destination: TripDestination | null;
  facilitySkipped: boolean;
  lodgingResults: LodgingListing[];
  restaurantResults: Restaurant[];
  flightResults: FlightOption[];
  selectedLodgingId: string | null;
  selectedFlightId: string | null;
  selectedSeat: SeatSelection | null;
  selectedRestaurantIds: string[];
  selectedTransitId: string | null;
  selectedCarRentalId: string | null;
  housingFirstEnabled: boolean;
  activeStep: BookingWorkflowStep;
  contractStart: string | null;
  contractEnd: string | null;
  originAirport: string;
  workOrder: WorkOrder | null;
  boardingPass: BoardingPassExtract | null;
  hospitalsLoading: boolean;
  lodgingLoading: boolean;
  diningLoading: boolean;
  flightsLoading: boolean;
  itineraryConfirmed: boolean;
  tripMode: TripMode;
  rentalLog: RentalLog;
  rideShareLog: RideShareLogEntry[];
  setHospitalResults: (hospitals: Hospital[]) => void;
  setHospitalsLoading: (loading: boolean) => void;
  selectHospital: (hospital: Hospital) => void;
  skipFacility: () => void;
  setDestination: (destination: TripDestination) => void;
  setLodgingResults: (lodging: LodgingListing[]) => void;
  setLodgingLoading: (loading: boolean) => void;
  setRestaurantResults: (restaurants: Restaurant[]) => void;
  setDiningLoading: (loading: boolean) => void;
  setFlightResults: (flights: FlightOption[]) => void;
  setFlightsLoading: (loading: boolean) => void;
  selectLodging: (lodgingId: string | null) => void;
  selectFlight: (flightId: string | null) => void;
  selectSeat: (seat: SeatSelection | null) => void;
  toggleRestaurant: (restaurantId: string) => void;
  selectTransit: (transitId: string | null) => void;
  selectCarRental: (carRentalId: string | null) => void;
  setHousingFirstEnabled: (enabled: boolean) => void;
  setActiveStep: (step: BookingWorkflowStep) => void;
  setContractDates: (start: string | null, end: string | null) => void;
  setOriginAirport: (airport: string) => void;
  setWorkOrder: (workOrder: WorkOrder | null) => void;
  setBoardingPass: (extract: BoardingPassExtract | null) => void;
  applyBoardingPassToItinerary: (
    extract: BoardingPassExtract,
    flight: FlightOption,
    seat: SeatSelection | null,
  ) => void;
  confirmItinerary: () => void;
  editItinerary: () => void;
  setRentalStartMileage: (miles: number | null) => void;
  setRentalEndMileage: (miles: number | null) => void;
  setRentalInsuranceOnFile: (onFile: boolean) => void;
  setRentalInsurancePhoto: (uri: string | null) => void;
  addRentalLogEntry: (input: {
    photoKind: RentalPhotoKind;
    photoUri: string | null;
    odometerMiles?: number | null;
    fuelLevel?: string | null;
    notes?: string | null;
  }) => void;
  removeRentalLogEntry: (entryId: string) => void;
  addRideShareScreenshot: (screenshotUri: string, notes?: string | null) => void;
  removeRideShareScreenshot: (entryId: string) => void;
  reset: () => void;
}

function initialStep(housingFirst: boolean): BookingWorkflowStep {
  return resolveWorkflowSteps(housingFirst)[0] ?? 'review';
}

const initialState = {
  hospitalResults: [] as Hospital[],
  selectedHospital: null as Hospital | null,
  destination: null as TripDestination | null,
  facilitySkipped: false,
  lodgingResults: [] as LodgingListing[],
  restaurantResults: [] as Restaurant[],
  flightResults: [] as FlightOption[],
  selectedLodgingId: null as string | null,
  selectedFlightId: null as string | null,
  selectedSeat: null as SeatSelection | null,
  selectedRestaurantIds: [] as string[],
  selectedTransitId: null as string | null,
  selectedCarRentalId: null as string | null,
  housingFirstEnabled: true,
  activeStep: initialStep(true),
  contractStart: null as string | null,
  contractEnd: null as string | null,
  originAirport: '',
  workOrder: null as WorkOrder | null,
  boardingPass: null as BoardingPassExtract | null,
  hospitalsLoading: false,
  lodgingLoading: false,
  diningLoading: false,
  flightsLoading: false,
  itineraryConfirmed: false,
  tripMode: 'planning' as TripMode,
  rentalLog: createEmptyRentalLog(),
  rideShareLog: [] as RideShareLogEntry[],
};

function destinationChangeReset() {
  return {
    lodgingResults: [] as LodgingListing[],
    restaurantResults: [] as Restaurant[],
    flightResults: [] as FlightOption[],
    selectedLodgingId: null as string | null,
    selectedFlightId: null as string | null,
    selectedSeat: null as SeatSelection | null,
    selectedRestaurantIds: [] as string[],
    selectedTransitId: null as string | null,
    selectedCarRentalId: null as string | null,
    boardingPass: null as BoardingPassExtract | null,
    diningLoading: false,
    itineraryConfirmed: false,
    tripMode: 'planning' as TripMode,
    rentalLog: createEmptyRentalLog(),
    rideShareLog: [] as RideShareLogEntry[],
  };
}

export const useTripStore = create<TripState>((set, get) => ({
  ...initialState,
  setHospitalResults: (hospitalResults) => set({ hospitalResults }),
  setHospitalsLoading: (hospitalsLoading) => set({ hospitalsLoading }),
  selectHospital: (hospital) =>
    set({
      selectedHospital: hospital,
      destination: destinationFromHospital(hospital),
      facilitySkipped: false,
      hospitalResults: mergeHospital(get().hospitalResults, hospital),
      ...destinationChangeReset(),
    }),
  skipFacility: () =>
    set({
      selectedHospital: null,
      destination: null,
      facilitySkipped: true,
      ...destinationChangeReset(),
    }),
  setDestination: (destination) =>
    set({
      selectedHospital: null,
      destination,
      facilitySkipped: true,
      ...destinationChangeReset(),
    }),
  setLodgingResults: (lodgingResults) => set({ lodgingResults }),
  setLodgingLoading: (lodgingLoading) => set({ lodgingLoading }),
  setRestaurantResults: (restaurantResults) => set({ restaurantResults }),
  setDiningLoading: (diningLoading) => set({ diningLoading }),
  setFlightResults: (flightResults) => set({ flightResults }),
  setFlightsLoading: (flightsLoading) => set({ flightsLoading }),
  selectLodging: (selectedLodgingId) => set({ selectedLodgingId }),
  selectFlight: (selectedFlightId) => set({ selectedFlightId, selectedSeat: null }),
  selectSeat: (selectedSeat) => set({ selectedSeat }),
  toggleRestaurant: (restaurantId) => {
    const current = get().selectedRestaurantIds;
    const next = current.includes(restaurantId)
      ? current.filter((id) => id !== restaurantId)
      : [...current, restaurantId];
    set({ selectedRestaurantIds: next });
  },
  selectTransit: (selectedTransitId) => set({ selectedTransitId }),
  selectCarRental: (selectedCarRentalId) => set({ selectedCarRentalId }),
  setHousingFirstEnabled: (housingFirstEnabled) =>
    set({ housingFirstEnabled, activeStep: initialStep(housingFirstEnabled) }),
  setActiveStep: (activeStep) => set({ activeStep }),
  setContractDates: (contractStart, contractEnd) => set({ contractStart, contractEnd }),
  setOriginAirport: (originAirport) => set({ originAirport: originAirport.toUpperCase() }),
  setWorkOrder: (workOrder) => set({ workOrder }),
  setBoardingPass: (boardingPass) => set({ boardingPass }),
  applyBoardingPassToItinerary: (extract, flight, seat) => {
    const existing = get().flightResults;
    const mergedFlights = existing.some((f) => f.id === flight.id)
      ? existing
      : [flight, ...existing];
    set({
      boardingPass: extract,
      flightResults: mergedFlights,
      selectedFlightId: flight.id,
      selectedSeat: seat,
      activeStep: seat ? 'dining' : 'seats',
    });
  },
  confirmItinerary: () => set({ itineraryConfirmed: true, tripMode: 'travel' }),
  editItinerary: () => set({ itineraryConfirmed: false, tripMode: 'planning' }),
  setRentalStartMileage: (startMileage) => set({ rentalLog: { ...get().rentalLog, startMileage } }),
  setRentalEndMileage: (endMileage) => set({ rentalLog: { ...get().rentalLog, endMileage } }),
  setRentalInsuranceOnFile: (insuranceOnFile) =>
    set({ rentalLog: { ...get().rentalLog, insuranceOnFile } }),
  setRentalInsurancePhoto: (insurancePhotoUri) =>
    set({
      rentalLog: {
        ...get().rentalLog,
        insurancePhotoUri,
        insuranceOnFile: insurancePhotoUri ? true : get().rentalLog.insuranceOnFile,
      },
    }),
  addRentalLogEntry: (input) => {
    const entry: RentalLogEntry = {
      id: generateRequestId(),
      recordedAt: new Date().toISOString(),
      odometerMiles: input.odometerMiles ?? null,
      fuelLevel: input.fuelLevel ?? null,
      notes: input.notes ?? null,
      photoKind: input.photoKind,
      photoUri: input.photoUri,
    };
    const log = get().rentalLog;
    set({ rentalLog: { ...log, entries: [...log.entries, entry] } });
  },
  removeRentalLogEntry: (entryId) => {
    const log = get().rentalLog;
    set({ rentalLog: { ...log, entries: log.entries.filter((item) => item.id !== entryId) } });
  },
  addRideShareScreenshot: (screenshotUri, notes) => {
    const entry: RideShareLogEntry = {
      id: generateRequestId(),
      recordedAt: new Date().toISOString(),
      screenshotUri,
      notes: notes ?? null,
    };
    set({ rideShareLog: [entry, ...get().rideShareLog] });
  },
  removeRideShareScreenshot: (entryId) =>
    set({ rideShareLog: get().rideShareLog.filter((item) => item.id !== entryId) }),
  reset: () =>
    set({
      ...initialState,
      activeStep: initialStep(true),
      rentalLog: createEmptyRentalLog(),
      rideShareLog: [],
    }),
}));

function mergeHospital(list: Hospital[], hospital: Hospital): Hospital[] {
  if (list.some((h) => h.id === hospital.id)) {
    return list.map((h) => (h.id === hospital.id ? hospital : h));
  }
  return [hospital, ...list];
}

export interface TripSelectors {
  hospitals: Hospital[];
  hospital: Hospital | null;
  destination: TripDestination | null;
  facilitySkipped: boolean;
  safety: SafetyRating | null;
  lodging: LodgingListing[];
  recommendedLodging: LodgingListing[];
  flaggedLodging: LodgingListing[];
  selectedLodging: LodgingListing | null;
  flights: FlightOption[];
  selectedFlight: FlightOption | null;
  restaurants: Restaurant[];
  selectedRestaurants: Restaurant[];
  transitOptions: TransitOption[];
  selectedTransit: TransitOption | null;
  carRentals: CarRentalOption[];
  selectedCarRental: CarRentalOption | null;
  workflowSteps: BookingWorkflowStep[];
  itinerary: ItinerarySummary;
  boardingPass: BoardingPassExtract | null;
  originAirport: string;
  hospitalsLoading: boolean;
  lodgingLoading: boolean;
  diningLoading: boolean;
  flightsLoading: boolean;
  itineraryConfirmed: boolean;
  tripMode: TripMode;
  rentalLog: RentalLog;
  rideShareLog: RideShareLogEntry[];
}

export function selectTripData(
  state: Pick<
    TripState,
    | 'hospitalResults'
    | 'selectedHospital'
    | 'destination'
    | 'facilitySkipped'
    | 'lodgingResults'
    | 'restaurantResults'
    | 'flightResults'
    | 'selectedLodgingId'
    | 'selectedFlightId'
    | 'selectedSeat'
    | 'selectedRestaurantIds'
    | 'selectedTransitId'
    | 'selectedCarRentalId'
    | 'housingFirstEnabled'
    | 'contractStart'
    | 'contractEnd'
    | 'boardingPass'
    | 'originAirport'
    | 'hospitalsLoading'
    | 'lodgingLoading'
    | 'diningLoading'
    | 'flightsLoading'
    | 'itineraryConfirmed'
    | 'tripMode'
    | 'rentalLog'
    | 'rideShareLog'
  >,
  dailyStipendRate: number,
): TripSelectors {
  const hospital = state.selectedHospital;
  const destination = state.destination ?? (hospital ? destinationFromHospital(hospital) : null);
  const lodging = state.lodgingResults;
  const flights = state.flightResults;
  const restaurants = state.restaurantResults;
  const carRentals = destination
    ? buildCarRentalsForHospital({ id: destination.id, airportCode: destination.airportCode })
    : [];

  const withinBudget = (listing: LodgingListing) =>
    dailyStipendRate <= 0 || listing.nightlyRate <= dailyStipendRate;

  const recommendedLodging = lodging
    .filter((l) => l.safetyPreference !== 'caution' && withinBudget(l))
    .sort((a, b) => preferenceRank(a.safetyPreference) - preferenceRank(b.safetyPreference));

  const flaggedLodging = lodging.filter((l) => !recommendedLodging.includes(l));

  const selectedLodging = lodging.find((l) => l.id === state.selectedLodgingId) ?? null;
  const selectedFlight = flights.find((f) => f.id === state.selectedFlightId) ?? null;
  const transitOptions = buildTransitOptions(
    selectedLodging,
    selectedFlight?.arrivalTime ?? null,
    destination?.coordinates ?? hospital?.coordinates,
  );
  const selectedTransit = transitOptions.find((t) => t.id === state.selectedTransitId) ?? null;
  const selectedCarRental = carRentals.find((c) => c.id === state.selectedCarRentalId) ?? null;
  const selectedPlaces = restaurants.filter((r) => state.selectedRestaurantIds.includes(r.id));
  const selectedRestaurants = selectedPlaces.filter((r) => (r.category ?? 'dining') === 'dining');
  const selectedEntertainment = selectedPlaces.filter((r) => r.category === 'entertainment');

  const itinerary = buildItinerarySummary({
    facilityName: hospital?.name ?? null,
    contractStart: state.contractStart,
    contractEnd: state.contractEnd,
    lodgingName: selectedLodging?.name ?? null,
    lodgingNightlyRate: selectedLodging?.nightlyRate ?? null,
    flightAirline: selectedFlight?.airline ?? null,
    flightNumber: selectedFlight?.flightNumber ?? null,
    flightRoute: selectedFlight
      ? `${selectedFlight.departureAirport} → ${selectedFlight.arrivalAirport}`
      : null,
    flightPrice: selectedFlight?.price ?? null,
    seat: state.selectedSeat,
    restaurantNames: selectedRestaurants.map((r) => r.name),
    entertainmentNames: selectedEntertainment.map((r) => r.name),
    transitProvider: selectedTransit?.provider ?? null,
    transitLabel: selectedTransit?.label ?? null,
    transitCost: selectedTransit?.estimatedCost ?? null,
    carProvider: selectedCarRental?.provider ?? null,
    carLabel: selectedCarRental?.label ?? null,
    carWeeklyRate: selectedCarRental?.weeklyRate ?? null,
  });

  return {
    hospitals: state.hospitalResults,
    hospital,
    destination,
    facilitySkipped: state.facilitySkipped,
    safety: hospital?.safety ?? null,
    lodging,
    recommendedLodging,
    flaggedLodging,
    selectedLodging,
    flights,
    selectedFlight,
    restaurants,
    selectedRestaurants,
    transitOptions,
    selectedTransit,
    carRentals,
    selectedCarRental,
    workflowSteps: resolveWorkflowSteps(state.housingFirstEnabled),
    itinerary,
    boardingPass: state.boardingPass,
    originAirport: state.originAirport,
    hospitalsLoading: state.hospitalsLoading,
    lodgingLoading: state.lodgingLoading,
    diningLoading: state.diningLoading,
    flightsLoading: state.flightsLoading,
    itineraryConfirmed: state.itineraryConfirmed,
    tripMode: state.tripMode,
    rentalLog: state.rentalLog,
    rideShareLog: state.rideShareLog,
  };
}

function preferenceRank(preference: LodgingListing['safetyPreference']): number {
  if (preference === 'preferred') return 0;
  if (preference === 'standard') return 1;
  return 2;
}
