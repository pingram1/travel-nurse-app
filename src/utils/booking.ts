import type { BookingWorkflowStep } from '@/types';

const STANDARD_WORKFLOW: BookingWorkflowStep[] = ['flights', 'housing', 'transit', 'review'];

const HOUSING_FIRST_WORKFLOW: BookingWorkflowStep[] = ['housing', 'flights', 'transit', 'review'];

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
