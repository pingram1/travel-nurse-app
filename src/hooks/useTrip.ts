import { useMemo } from 'react';

import { useStipendStore } from '@/store/stipendStore';
import { selectTripData, useTripStore, type TripSelectors } from '@/store/tripStore';
import type { BookingWorkflowStep, SeatSelection, WorkOrder } from '@/types';

export interface UseTripResult extends TripSelectors {
  selectedHospitalId: string | null;
  selectedSeat: SeatSelection | null;
  selectedRestaurantIds: string[];
  housingFirstEnabled: boolean;
  activeStep: BookingWorkflowStep;
  dailyStipendRate: number;
  workOrder: WorkOrder | null;
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
  setWorkOrder: (workOrder: WorkOrder | null) => void;
}

export function useTrip(): UseTripResult {
  const trip = useTripStore();
  const dailyStipendRate = useStipendStore((s) => s.dailyHousingStipendRate);

  const data = useMemo(
    () =>
      selectTripData(
        {
          selectedHospitalId: trip.selectedHospitalId,
          selectedLodgingId: trip.selectedLodgingId,
          selectedFlightId: trip.selectedFlightId,
          selectedSeat: trip.selectedSeat,
          selectedRestaurantIds: trip.selectedRestaurantIds,
          selectedTransitId: trip.selectedTransitId,
          selectedCarRentalId: trip.selectedCarRentalId,
          housingFirstEnabled: trip.housingFirstEnabled,
          contractStart: trip.contractStart,
          contractEnd: trip.contractEnd,
        },
        dailyStipendRate,
      ),
    [
      trip.selectedHospitalId,
      trip.selectedLodgingId,
      trip.selectedFlightId,
      trip.selectedSeat,
      trip.selectedRestaurantIds,
      trip.selectedTransitId,
      trip.selectedCarRentalId,
      trip.housingFirstEnabled,
      trip.contractStart,
      trip.contractEnd,
      dailyStipendRate,
    ],
  );

  return {
    ...data,
    selectedHospitalId: trip.selectedHospitalId,
    selectedSeat: trip.selectedSeat,
    selectedRestaurantIds: trip.selectedRestaurantIds,
    housingFirstEnabled: trip.housingFirstEnabled,
    activeStep: trip.activeStep,
    dailyStipendRate,
    workOrder: trip.workOrder,
    selectHospital: trip.selectHospital,
    selectLodging: trip.selectLodging,
    selectFlight: trip.selectFlight,
    selectSeat: trip.selectSeat,
    toggleRestaurant: trip.toggleRestaurant,
    selectTransit: trip.selectTransit,
    selectCarRental: trip.selectCarRental,
    setHousingFirstEnabled: trip.setHousingFirstEnabled,
    setActiveStep: trip.setActiveStep,
    setContractDates: trip.setContractDates,
    setWorkOrder: trip.setWorkOrder,
  };
}
