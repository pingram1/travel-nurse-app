import type { BookingWorkflowStep } from '@/types';

const STANDARD_WORKFLOW: BookingWorkflowStep[] = [
  'flights',
  'seats',
  'housing',
  'dining',
  'transit',
  'cars',
  'review',
];

const HOUSING_FIRST_WORKFLOW: BookingWorkflowStep[] = [
  'housing',
  'flights',
  'seats',
  'dining',
  'transit',
  'cars',
  'review',
];

export const STEP_LABELS: Record<BookingWorkflowStep, string> = {
  housing: 'Lodging',
  flights: 'Flights',
  seats: 'Seats',
  dining: 'Food',
  transit: 'Rides',
  cars: 'Car',
  review: 'Summary',
};

export function resolveWorkflowSteps(housingFirstEnabled: boolean): BookingWorkflowStep[] {
  return housingFirstEnabled ? HOUSING_FIRST_WORKFLOW : STANDARD_WORKFLOW;
}

export function getNextStep(
  steps: BookingWorkflowStep[],
  current: BookingWorkflowStep,
): BookingWorkflowStep | null {
  const index = steps.indexOf(current);
  if (index < 0 || index >= steps.length - 1) {
    return null;
  }
  return steps[index + 1] ?? null;
}

export function getStepProgress(
  steps: BookingWorkflowStep[],
  current: BookingWorkflowStep,
): number {
  const index = steps.indexOf(current);
  if (index < 0) return 0;
  return Math.round(((index + 1) / steps.length) * 100);
}
