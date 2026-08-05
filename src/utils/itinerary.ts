import type { ItinerarySummary, SeatSelection } from '@/types';

const CONTRACT_NIGHTS = 92;

export interface ItineraryInput {
  facilityName: string | null;
  contractStart: string | null;
  contractEnd: string | null;
  lodgingName: string | null;
  lodgingNightlyRate: number | null;
  flightAirline: string | null;
  flightNumber: string | null;
  flightRoute: string | null;
  flightPrice: number | null;
  seat: SeatSelection | null;
  restaurantNames: string[];
  transitProvider: string | null;
  transitLabel: string | null;
  transitCost: number | null;
  carProvider: string | null;
  carLabel: string | null;
  carWeeklyRate: number | null;
}

export function buildItinerarySummary(input: ItineraryInput): ItinerarySummary {
  const lodgingTotal =
    input.lodgingNightlyRate !== null ? input.lodgingNightlyRate * CONTRACT_NIGHTS : 0;
  const flightTotal = (input.flightPrice ?? 0) + (input.seat?.price ?? 0);
  const transitTotal = input.transitCost ?? 0;
  const carTotal = input.carWeeklyRate ?? 0;

  const contractDates =
    input.contractStart && input.contractEnd
      ? `${input.contractStart.slice(0, 10)} — ${input.contractEnd.slice(0, 10)}`
      : null;

  const checks = [
    Boolean(input.facilityName),
    Boolean(input.lodgingName),
    Boolean(input.flightAirline),
    Boolean(input.seat),
    input.restaurantNames.length > 0,
    Boolean(input.transitProvider),
    Boolean(input.carProvider),
  ];
  const completed = checks.filter(Boolean).length;
  const completionPercent = Math.round((completed / checks.length) * 100);

  return {
    facilityName: input.facilityName ?? 'Assignment pending',
    contractDates,
    lodging: input.lodgingName
      ? {
          name: input.lodgingName,
          nightlyRate: input.lodgingNightlyRate ?? 0,
          totalNights: CONTRACT_NIGHTS,
        }
      : null,
    flight: input.flightAirline
      ? {
          airline: input.flightAirline,
          flightNumber: input.flightNumber ?? '',
          route: input.flightRoute ?? '',
          price: input.flightPrice ?? 0,
          seat: input.seat,
        }
      : null,
    dining: { count: input.restaurantNames.length, names: input.restaurantNames },
    groundTransit: input.transitProvider
      ? {
          provider: input.transitProvider,
          label: input.transitLabel ?? input.transitProvider,
          estimatedCost: transitTotal,
        }
      : null,
    carRental: input.carProvider
      ? {
          provider: input.carProvider,
          label: input.carLabel ?? input.carProvider,
          weeklyRate: carTotal,
        }
      : null,
    estimatedTotal: lodgingTotal + flightTotal + transitTotal + carTotal,
    completionPercent,
    isReadyToConfirm: completed >= 5,
  };
}
