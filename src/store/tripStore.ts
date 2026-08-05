import { create } from 'zustand';

import {
  buildTransitOptions,
  getCarRentalsForHospital,
  getFlightsForHospital,
  getHospitalById,
  getLodgingForHospital,
  getRestaurantsNearHospital,
  HOSPITALS,
} from '@/services/api/tripData';
import type {
  BookingWorkflowStep,
  CarRentalOption,
  FlightOption,
  Hospital,
  ItinerarySummary,
  LodgingListing,
  Restaurant,
  SafetyRating,
  SeatSelection,
  TransitOption,
} from '@/types';
import { resolveWorkflowSteps } from '@/utils/booking';
import { buildItinerarySummary } from '@/utils/itinerary';

/** Lodging in areas above this NIBRS index is flagged instead of recommended. */
export const CRIME_INDEX_SAFE_LIMIT = 45;

interface TripState {
  selectedHospitalId: string | null;
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
  selectHospital: (hospitalId: string) => void;
  selectLodging: (lodgingId: string | null) => void;
  selectFlight: (flightId: string | null) => void;
  selectSeat: (seat: SeatSelection | null) => void;
  toggleRestaurant: (restaurantId: string) => void;
  selectTransit: (transitId: string | null) => void;
  selectCarRental: (carRentalId: string | null) => void;
  setHousingFirstEnabled: (enabled: boolean) => void;
  setActiveStep: (step: BookingWorkflowStep) => void;
  setContractDates: (start: string | null, end: string | null) => void;
  reset: () => void;
}

function initialStep(housingFirst: boolean): BookingWorkflowStep {
  return resolveWorkflowSteps(housingFirst)[0] ?? 'review';
}

export const useTripStore = create<TripState>((set, get) => ({
  selectedHospitalId: null,
  selectedLodgingId: null,
  selectedFlightId: null,
  selectedSeat: null,
  selectedRestaurantIds: [],
  selectedTransitId: null,
  selectedCarRentalId: null,
  housingFirstEnabled: true,
  activeStep: initialStep(true),
  contractStart: null,
  contractEnd: null,
  selectHospital: (hospitalId) =>
    set({
      selectedHospitalId: hospitalId,
      selectedLodgingId: null,
      selectedFlightId: null,
      selectedSeat: null,
      selectedRestaurantIds: [],
      selectedTransitId: null,
      selectedCarRentalId: null,
    }),
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
  reset: () =>
    set({
      selectedHospitalId: null,
      selectedLodgingId: null,
      selectedFlightId: null,
      selectedSeat: null,
      selectedRestaurantIds: [],
      selectedTransitId: null,
      selectedCarRentalId: null,
      housingFirstEnabled: true,
      activeStep: initialStep(true),
      contractStart: null,
      contractEnd: null,
    }),
}));

export interface TripSelectors {
  hospitals: Hospital[];
  hospital: Hospital | null;
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
}

export function selectTripData(
  state: Pick<
    TripState,
    | 'selectedHospitalId'
    | 'selectedLodgingId'
    | 'selectedFlightId'
    | 'selectedSeat'
    | 'selectedRestaurantIds'
    | 'selectedTransitId'
    | 'selectedCarRentalId'
    | 'housingFirstEnabled'
    | 'contractStart'
    | 'contractEnd'
  >,
  dailyStipendRate: number,
): TripSelectors {
  const hospital = state.selectedHospitalId ? getHospitalById(state.selectedHospitalId) : null;
  const lodging = hospital ? getLodgingForHospital(hospital.id) : [];
  const flights = hospital ? getFlightsForHospital(hospital.id) : [];
  const restaurants = hospital ? getRestaurantsNearHospital(hospital.id) : [];
  const carRentals = hospital ? getCarRentalsForHospital(hospital.id) : [];

  const withinBudget = (listing: LodgingListing) =>
    dailyStipendRate <= 0 || listing.nightlyRate <= dailyStipendRate;

  const recommendedLodging = lodging
    .filter((l) => l.areaCrimeIndex <= CRIME_INDEX_SAFE_LIMIT && withinBudget(l))
    .sort((a, b) => a.areaCrimeIndex - b.areaCrimeIndex);

  const flaggedLodging = lodging.filter((l) => !recommendedLodging.includes(l));

  const selectedLodging = lodging.find((l) => l.id === state.selectedLodgingId) ?? null;
  const selectedFlight = flights.find((f) => f.id === state.selectedFlightId) ?? null;
  const transitOptions = buildTransitOptions(selectedLodging, selectedFlight?.arrivalTime ?? null);
  const selectedTransit = transitOptions.find((t) => t.id === state.selectedTransitId) ?? null;
  const selectedCarRental = carRentals.find((c) => c.id === state.selectedCarRentalId) ?? null;
  const selectedRestaurants = restaurants.filter((r) => state.selectedRestaurantIds.includes(r.id));

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
    transitProvider: selectedTransit?.provider ?? null,
    transitLabel: selectedTransit?.label ?? null,
    transitCost: selectedTransit?.estimatedCost ?? null,
    carProvider: selectedCarRental?.provider ?? null,
    carLabel: selectedCarRental?.label ?? null,
    carWeeklyRate: selectedCarRental?.weeklyRate ?? null,
  });

  return {
    hospitals: HOSPITALS,
    hospital,
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
  };
}
