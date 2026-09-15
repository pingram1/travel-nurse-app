/** External airline booking deep links (app preferred, web fallback). */

export interface AirlineBookingLinks {
  airlineCode: string;
  appUrl: string;
  webUrl: string;
}

const AIRLINE_BOOKING: Record<string, AirlineBookingLinks> = {
  AA: {
    airlineCode: 'AA',
    appUrl: 'aa://',
    webUrl: 'https://www.aa.com/booking/find-flights',
  },
  UA: {
    airlineCode: 'UA',
    appUrl: 'united://',
    webUrl: 'https://www.united.com/en/us/flight-search',
  },
  DL: {
    airlineCode: 'DL',
    appUrl: 'delta://',
    webUrl: 'https://www.delta.com/flightsearch/book-a-flight',
  },
  WN: {
    airlineCode: 'WN',
    appUrl: 'southwest://',
    webUrl: 'https://www.southwest.com/air/booking/',
  },
  AS: {
    airlineCode: 'AS',
    appUrl: 'alaskaair://',
    webUrl: 'https://www.alaskaair.com/search/bookflights',
  },
  B6: {
    airlineCode: 'B6',
    appUrl: 'jetblue://',
    webUrl: 'https://www.jetblue.com/booking/flights',
  },
  NK: {
    airlineCode: 'NK',
    appUrl: 'spirit://',
    webUrl: 'https://www.spirit.com/',
  },
  F9: {
    airlineCode: 'F9',
    appUrl: 'frontierair://',
    webUrl: 'https://www.flyfrontier.com/',
  },
};

const NAME_TO_CODE: Array<{ match: RegExp; code: string }> = [
  { match: /american/i, code: 'AA' },
  { match: /united/i, code: 'UA' },
  { match: /delta/i, code: 'DL' },
  { match: /southwest/i, code: 'WN' },
  { match: /alaska/i, code: 'AS' },
  { match: /jetblue/i, code: 'B6' },
  { match: /spirit/i, code: 'NK' },
  { match: /frontier/i, code: 'F9' },
];

export function resolveAirlineCode(airline: string, flightNumber?: string): string {
  const fromFlight = flightNumber?.match(/^([A-Z]{2})\s*\d/i)?.[1]?.toUpperCase();
  if (fromFlight && AIRLINE_BOOKING[fromFlight]) return fromFlight;

  for (const entry of NAME_TO_CODE) {
    if (entry.match.test(airline)) return entry.code;
  }

  return fromFlight ?? 'AA';
}

export function getAirlineBookingLinks(
  airline: string,
  flightNumber?: string,
): AirlineBookingLinks {
  const code = resolveAirlineCode(airline, flightNumber);
  return (
    AIRLINE_BOOKING[code] ?? {
      airlineCode: code,
      appUrl: `https://www.google.com/search?q=${encodeURIComponent(`${airline} book flight`)}`,
      webUrl: `https://www.google.com/search?q=${encodeURIComponent(`${airline} book flight`)}`,
    }
  );
}
