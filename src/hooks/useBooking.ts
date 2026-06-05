import { useCallback } from 'react';

import { useBookingStore } from '@/store/bookingStore';
import type { BookingWorkflowStep, WorkOrder } from '@/types';
import { getNextStep } from '@/utils/booking';

export function useBooking() {
  const state = useBookingStore();

  const toggleHousingFirst = useCallback(
    (enabled: boolean) => {
      state.setHousingFirstEnabled(enabled);
    },
    [state],
  );

  const applyWorkOrder = useCallback(
    (workOrder: WorkOrder) => {
      state.setWorkOrder(workOrder);
      if (state.housingFirstEnabled) {
        state.setActiveStep('housing');
      }
    },
    [state],
  );

  const selectLodging = useCallback(
    (lodgingId: string) => {
      state.setSelectedLodgingId(lodgingId);
      const next = getNextStep(state.workflowSteps, 'housing');
      if (next && state.housingFirstEnabled) {
        state.setActiveStep(next);
      }
    },
    [state],
  );

  const goToStep = useCallback(
    (step: BookingWorkflowStep) => {
      state.setActiveStep(step);
    },
    [state],
  );

  return {
    housingFirstEnabled: state.housingFirstEnabled,
    workflowSteps: state.workflowSteps,
    activeStep: state.activeStep,
    workOrder: state.workOrder,
    selectedLodgingId: state.selectedLodgingId,
    toggleHousingFirst,
    applyWorkOrder,
    selectLodging,
    goToStep,
    advanceStep: state.advanceStep,
  };
}
