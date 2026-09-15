import { apiGet } from '@/services/api/client';
import type { AirlineCabinLayout, FlightOption, FlightSearchParams } from '@/types';
import { getAirlineBookingLinks } from '@/utils/airlineBooking';

interface CarrierTemplate {
  airline: string;
  code: string;
  aircraft: string;
  cabinLayout: AirlineCabinLayout;
  basePrice: number;
  nonstopBias: number;
}

const CARRIERS: CarrierTemplate[] = [
  {
    airline: 'American',
    code: 'AA',
    aircraft: 'Boeing 737 MAX 8',
    cabinLayout: 'narrow-3-3',
    basePrice: 186,
    nonstopBias: 0.7,
  },
  {
    airline: 'United',
    code: 'UA',
    aircraft: 'Airbus A320',
    cabinLayout: 'narrow-3-3',
    basePrice: 172,
    nonstopBias: 0.65,
  },
  {
    airline: 'Delta',
    code: 'DL',
    aircraft: 'Airbus A321',
    cabinLayout: 'narrow-3-3',
    basePrice: 198,
    nonstopBias: 0.6,
  },
  {
    airline: 'Southwest',
    code: 'WN',
    aircraft: 'Boeing 737-700',
    cabinLayout: 'southwest-open',
    basePrice: 149,
    nonstopBias: 0.8,
  },
  {
    airline: 'Alaska',
    code: 'AS',
    aircraft: 'Boeing 737-900',
    cabinLayout: 'narrow-3-3',
    basePrice: 210,
    nonstopBias: 0.55,
  },
  {
    airline: 'JetBlue',
    code: 'B6',
    aircraft: 'Airbus A220',
    cabinLayout: 'narrow-3-3',
    basePrice: 165,
    nonstopBias: 0.5,
  },
];

function parseDateOnly(value: string): Date {
  const datePart = value.slice(0, 10);
  return new Date(`${datePart}T12:00:00Z`);
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function enumerateSearchDates(start: string, end: string, maxDays = 14): string[] {
  const startDate = parseDateOnly(start);
  const endDate = parseDateOnly(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return [formatDateOnly(new Date())];
  }

  const dates: string[] = [];
  let cursor = startDate <= endDate ? startDate : endDate;
  const last = startDate <= endDate ? endDate : startDate;

  while (cursor <= last && dates.length < maxDays) {
    dates.push(formatDateOnly(cursor));
    cursor = addDays(cursor, 1);
  }

  if (dates.length === 0) {
    dates.push(formatDateOnly(startDate));
  }

  return dates;
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function buildFlightForSlot(
  params: FlightSearchParams,
  carrier: CarrierTemplate,
  date: string,
  slotIndex: number,
): FlightOption {
  const seed = hashSeed(
    `${params.originAirport}-${params.destinationAirport}-${date}-${carrier.code}-${slotIndex}`,
  );
  const departHour = 6 + (seed % 14);
  const departMinute = (seed % 4) * 15;
  const durationHours = 1.5 + (seed % 50) / 10;
  const departure = new Date(
    `${date}T${String(departHour).padStart(2, '0')}:${String(departMinute).padStart(2, '0')}:00Z`,
  );
  const arrival = new Date(departure.getTime() + durationHours * 3_600_000);
  const flightNum = 100 + (seed % 890);
  const priceJitter = (seed % 80) - 20;
  const nonstop = (seed % 100) / 100 < carrier.nonstopBias;

  const links = getAirlineBookingLinks(carrier.airline, `${carrier.code} ${flightNum}`);

  return {
    id: `flt-${params.originAirport}-${params.destinationAirport}-${date}-${carrier.code}-${flightNum}`,
    hospitalId: params.hospitalId,
    airline: carrier.airline,
    airlineCode: carrier.code,
    flightNumber: `${carrier.code} ${flightNum}`,
    departureAirport: params.originAirport,
    arrivalAirport: params.destinationAirport,
    departureTime: departure.toISOString(),
    arrivalTime: arrival.toISOString(),
    price: Math.max(89, carrier.basePrice + priceJitter + (nonstop ? 0 : -25)),
    nonstop,
    aircraft: carrier.aircraft,
    cabinLayout: carrier.cabinLayout,
    bookingAppUrl: links.appUrl,
    bookingWebUrl: links.webUrl,
  };
}

function buildFlightsForDateRange(params: FlightSearchParams): FlightOption[] {
  const dates = enumerateSearchDates(params.departureDateStart, params.departureDateEnd);
  const flights: FlightOption[] = [];

  for (const date of dates) {
    const daySeed = hashSeed(`${params.destinationAirport}-${date}`);
    const carrierCount = 2 + (daySeed % 3);
    for (let i = 0; i < carrierCount; i += 1) {
      const carrier = CARRIERS[(daySeed + i) % CARRIERS.length]!;
      flights.push(buildFlightForSlot(params, carrier, date, i));
    }
  }

  return flights.sort(
    (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
  );
}

function normalizeParams(params: FlightSearchParams): FlightSearchParams {
  const start = params.departureDateStart.slice(0, 10);
  let end = params.departureDateEnd.slice(0, 10);

  // Cap the search window so a full 13-week contract does not flood the UI.
  const startDate = parseDateOnly(start);
  const endDate = parseDateOnly(end);
  const maxEnd = addDays(startDate, 7);
  if (endDate > maxEnd) {
    end = formatDateOnly(maxEnd);
  }

  return {
    ...params,
    originAirport: params.originAirport.toUpperCase(),
    destinationAirport: params.destinationAirport.toUpperCase(),
    departureDateStart: start,
    departureDateEnd: end,
  };
}

/**
 * Search major-airline flights for the contract departure window.
 * Prefers the backend aggregator; falls back to a date-range schedule generator.
 */
export async function searchFlights(params: FlightSearchParams): Promise<FlightOption[]> {
  const normalized = normalizeParams(params);

  if (!normalized.originAirport || !normalized.destinationAirport) {
    return [];
  }

  try {
    const envelope = await Promise.race([
      apiGet<FlightOption[]>('/flights/search', {
        params: {
          hospitalId: normalized.hospitalId,
          origin: normalized.originAirport,
          destination: normalized.destinationAirport,
          departureDateStart: normalized.departureDateStart,
          departureDateEnd: normalized.departureDateEnd,
        },
        timeout: 4_000,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('flight search timeout')), 4_500);
      }),
    ]);
    if (envelope.data?.length) {
      return envelope.data
        .filter(
          (f) =>
            f.departureTime.slice(0, 10) >= normalized.departureDateStart &&
            f.departureTime.slice(0, 10) <= normalized.departureDateEnd,
        )
        .map((f) => {
          const links = getAirlineBookingLinks(f.airline, f.flightNumber);
          return {
            ...f,
            airlineCode: f.airlineCode || links.airlineCode,
            bookingAppUrl: f.bookingAppUrl || links.appUrl,
            bookingWebUrl: f.bookingWebUrl || links.webUrl,
          };
        });
    }
  } catch {
    // Fall through to date-range generator.
  }

  return buildFlightsForDateRange(normalized);
}

/** Build a FlightOption from boarding-pass OCR so it can attach to the itinerary. */
export function flightFromBoardingPass(input: {
  hospitalId: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string | null;
  seatNumber: string | null;
}): FlightOption {
  const date = (input.departureDate ?? new Date().toISOString()).slice(0, 10);
  const departureTime = `${date}T10:00:00Z`;
  const arrivalTime = `${date}T14:00:00Z`;
  const isSouthwest = input.airline.toLowerCase().includes('southwest');
  const links = getAirlineBookingLinks(input.airline, input.flightNumber);

  return {
    id: `ocr-${input.flightNumber.replace(/\s+/g, '').toLowerCase()}-${date}`,
    hospitalId: input.hospitalId,
    airline: input.airline,
    airlineCode: links.airlineCode,
    flightNumber: input.flightNumber,
    departureAirport: input.departureAirport,
    arrivalAirport: input.arrivalAirport,
    departureTime,
    arrivalTime,
    price: 0,
    nonstop: true,
    aircraft: 'Booked aircraft',
    cabinLayout: isSouthwest ? 'southwest-open' : 'narrow-3-3',
    bookingAppUrl: links.appUrl,
    bookingWebUrl: links.webUrl,
  };
}
