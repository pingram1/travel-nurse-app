import { create } from 'zustand';

import type { BookingWorkflowState, BookingWorkflowStep, WorkOrder } from '@/types';
import { resolveWorkflowSteps } from '@/utils/booking';

interface BookingState extends BookingWorkflowState {
  setHousingFirstEnabled: (enabled: boolean) => void;
  setActiveStep: (step: BookingWorkflowStep) => void;
  setWorkOrder: (workOrder: WorkOrder | null) => void;
  setSelectedLodgingId: (id: string | null) => void;
  advanceStep: () => void;
}

function buildState(housingFirstEnabled: boolean): BookingWorkflowState {
  const workflowSteps = resolveWorkflowSteps(housingFirstEnabled);
  return {
    housingFirstEnabled,
    workflowSteps,
    activeStep: workflowSteps[0] ?? 'review',
    workOrder: null,
    selectedLodgingId: null,
  };
}

export const useBookingStore = create<BookingState>((set, get) => ({
  ...buildState(false),
  setHousingFirstEnabled: (housingFirstEnabled) => {
    const workflowSteps = resolveWorkflowSteps(housingFirstEnabled);
    set({
      housingFirstEnabled,
      workflowSteps,
      activeStep: workflowSteps[0] ?? 'review',
    });
  },
  setActiveStep: (activeStep) => set({ activeStep }),
  setWorkOrder: (workOrder) => set({ workOrder }),
  setSelectedLodgingId: (selectedLodgingId) => set({ selectedLodgingId }),
  advanceStep: () => {
    const { workflowSteps, activeStep } = get();
    const index = workflowSteps.indexOf(activeStep);
    const next = workflowSteps[index + 1];
    if (next) {
      set({ activeStep: next });
    }
  },
}));
