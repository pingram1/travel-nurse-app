import type { ItinerarySummary, SeatSelection } from '@/types';
import { countLodgingNights } from '@/utils/datetime';

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
  entertainmentNames: string[];
  transitProvider: string | null;
  transitLabel: string | null;
  transitCost: number | null;
  carProvider: string | null;
  carLabel: string | null;
  carWeeklyRate: number | null;
}

export function buildItinerarySummary(input: ItineraryInput): ItinerarySummary {
  const totalNights = countLodgingNights(input.contractStart, input.contractEnd);
  const lodgingTotal =
    input.lodgingNightlyRate !== null ? input.lodgingNightlyRate * totalNights : 0;
  const flightTotal = (input.flightPrice ?? 0) + (input.seat?.price ?? 0);
  const transitTotal = input.transitCost ?? 0;
  const carTotal = input.carWeeklyRate ?? 0;

  const contractDates =
    input.contractStart && input.contractEnd
      ? `${input.contractStart.slice(0, 10)} — ${input.contractEnd.slice(0, 10)}`
      : null;

  const hasGround = Boolean(input.transitProvider || input.carProvider);

  // Facility, flight, and seat are optional. Seat is a flight detail, not its own step.
  const requiredChecks = [Boolean(input.lodgingName), input.restaurantNames.length > 0, hasGround];
  const requiredDone = requiredChecks.filter(Boolean).length;
  const completionPercent = Math.round((requiredDone / requiredChecks.length) * 100);

  return {
    facilityName: input.facilityName ?? 'No facility selected',
    contractDates,
    lodging: input.lodgingName
      ? {
          name: input.lodgingName,
          nightlyRate: input.lodgingNightlyRate ?? 0,
          totalNights,
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
    entertainment: {
      count: input.entertainmentNames.length,
      names: input.entertainmentNames,
    },
    groundTransit: {
      rideTransport: input.transitProvider
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
    },
    estimatedTotal: lodgingTotal + flightTotal + transitTotal + carTotal,
    completionPercent,
    isReadyToConfirm: requiredDone === requiredChecks.length,
  };
}
