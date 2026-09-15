import { useMemo } from 'react';

import { useDiningSearch } from '@/hooks/useDiningSearch';
import { useFlightSearch } from '@/hooks/useFlightSearch';
import { useLodgingSearch } from '@/hooks/useLodgingSearch';
import { useStipendStore } from '@/store/stipendStore';
import { selectTripData, useTripStore, type TripSelectors } from '@/store/tripStore';
import type {
  BoardingPassExtract,
  BookingWorkflowStep,
  Hospital,
  SeatSelection,
  TripDestination,
  WorkOrder,
} from '@/types';

export interface UseTripResult extends TripSelectors {
  selectedHospitalId: string | null;
  selectedSeat: SeatSelection | null;
  selectedRestaurantIds: string[];
  housingFirstEnabled: boolean;
  activeStep: BookingWorkflowStep;
  dailyStipendRate: number;
  workOrder: WorkOrder | null;
  contractStart: string | null;
  contractEnd: string | null;
  selectHospital: (hospital: Hospital) => void;
  skipFacility: () => void;
  setDestination: (destination: TripDestination) => void;
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
  confirmItinerary: () => void;
  editItinerary: () => void;
}

export function useTrip(): UseTripResult {
  const trip = useTripStore();
  const dailyStipendRate = useStipendStore((s) => s.dailyHousingStipendRate);

  // Keep lodging + dining + flight catalogs warm while a hospital is selected.
  useLodgingSearch();
  useDiningSearch();
  useFlightSearch();

  const data = useMemo(
    () =>
      selectTripData(
        {
          hospitalResults: trip.hospitalResults,
          selectedHospital: trip.selectedHospital,
          destination: trip.destination,
          facilitySkipped: trip.facilitySkipped,
          lodgingResults: trip.lodgingResults,
          restaurantResults: trip.restaurantResults,
          flightResults: trip.flightResults,
          selectedLodgingId: trip.selectedLodgingId,
          selectedFlightId: trip.selectedFlightId,
          selectedSeat: trip.selectedSeat,
          selectedRestaurantIds: trip.selectedRestaurantIds,
          selectedTransitId: trip.selectedTransitId,
          selectedCarRentalId: trip.selectedCarRentalId,
          housingFirstEnabled: trip.housingFirstEnabled,
          contractStart: trip.contractStart,
          contractEnd: trip.contractEnd,
          boardingPass: trip.boardingPass,
          originAirport: trip.originAirport,
          hospitalsLoading: trip.hospitalsLoading,
          lodgingLoading: trip.lodgingLoading,
          diningLoading: trip.diningLoading,
          flightsLoading: trip.flightsLoading,
          itineraryConfirmed: trip.itineraryConfirmed,
          tripMode: trip.tripMode,
          rentalLog: trip.rentalLog,
          rideShareLog: trip.rideShareLog,
        },
        dailyStipendRate,
      ),
    [
      trip.hospitalResults,
      trip.selectedHospital,
      trip.destination,
      trip.facilitySkipped,
      trip.lodgingResults,
      trip.restaurantResults,
      trip.flightResults,
      trip.selectedLodgingId,
      trip.selectedFlightId,
      trip.selectedSeat,
      trip.selectedRestaurantIds,
      trip.selectedTransitId,
      trip.selectedCarRentalId,
      trip.housingFirstEnabled,
      trip.contractStart,
      trip.contractEnd,
      trip.boardingPass,
      trip.originAirport,
      trip.hospitalsLoading,
      trip.lodgingLoading,
      trip.diningLoading,
      trip.flightsLoading,
      trip.itineraryConfirmed,
      trip.tripMode,
      trip.rentalLog,
      trip.rideShareLog,
      dailyStipendRate,
    ],
  );

  return {
    ...data,
    selectedHospitalId: trip.selectedHospital?.id ?? null,
    selectedSeat: trip.selectedSeat,
    selectedRestaurantIds: trip.selectedRestaurantIds,
    housingFirstEnabled: trip.housingFirstEnabled,
    activeStep: trip.activeStep,
    dailyStipendRate,
    workOrder: trip.workOrder,
    contractStart: trip.contractStart,
    contractEnd: trip.contractEnd,
    selectHospital: trip.selectHospital,
    skipFacility: trip.skipFacility,
    setDestination: trip.setDestination,
    selectLodging: trip.selectLodging,
    selectFlight: trip.selectFlight,
    selectSeat: trip.selectSeat,
    toggleRestaurant: trip.toggleRestaurant,
    selectTransit: trip.selectTransit,
    selectCarRental: trip.selectCarRental,
    setHousingFirstEnabled: trip.setHousingFirstEnabled,
    setActiveStep: trip.setActiveStep,
    setContractDates: trip.setContractDates,
    setOriginAirport: trip.setOriginAirport,
    setWorkOrder: trip.setWorkOrder,
    setBoardingPass: trip.setBoardingPass,
    confirmItinerary: trip.confirmItinerary,
    editItinerary: trip.editItinerary,
  };
}
