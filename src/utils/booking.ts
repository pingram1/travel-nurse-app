import type { Href } from 'expo-router';

import type { BookingWorkflowStep } from '@/types';

const STANDARD_WORKFLOW: BookingWorkflowStep[] = [
  'flights',
  'housing',
  'dining',
  'ground',
  'review',
];

const HOUSING_FIRST_WORKFLOW: BookingWorkflowStep[] = [
  'housing',
  'flights',
  'dining',
  'ground',
  'review',
];

export const STEP_LABELS: Record<BookingWorkflowStep, string> = {
  housing: 'Lodging',
  flights: 'Flights',
  seats: 'Seat map',
  dining: 'City',
  ground: 'Ground',
  review: 'Summary',
};

/**
 * Absolute Expo Router hrefs — relative `./` paths resolve to `/--/` in Expo Go
 * and produce Unmatched Route errors.
 */
export const BOOKING_HREF = {
  hub: '/(tabs)/booking',
  seats: '/(tabs)/booking/seats',
  dining: '/(tabs)/booking/dining',
  ground: '/(tabs)/booking/ground',
  review: '/(tabs)/booking/review',
  boardingPass: '/(tabs)/booking/boarding-pass',
} as const satisfies Record<string, Href>;

export const STEP_ROUTES: Partial<Record<BookingWorkflowStep, Href>> = {
  seats: BOOKING_HREF.seats,
  dining: BOOKING_HREF.dining,
  ground: BOOKING_HREF.ground,
  review: BOOKING_HREF.review,
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

export function getStepRoute(step: BookingWorkflowStep): Href | null {
  return STEP_ROUTES[step] ?? null;
}

export function getStepProgress(
  steps: BookingWorkflowStep[],
  current: BookingWorkflowStep,
): number {
  const index = steps.indexOf(current);
  if (index < 0) return 0;
  return Math.round(((index + 1) / steps.length) * 100);
}
