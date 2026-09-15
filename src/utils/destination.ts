import type { Hospital, TripDestination } from '@/types';

export function destinationFromHospital(hospital: Hospital): TripDestination {
  return {
    id: hospital.id,
    label: hospital.name,
    city: hospital.city,
    state: hospital.state,
    airportCode: hospital.airportCode,
    coordinates: hospital.coordinates,
    source: 'facility',
  };
}

export function parseCityStateQuery(query: string): { city: string; state: string } {
  const trimmed = query.trim();
  if (!trimmed) return { city: '', state: '' };

  const comma = trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (comma.length >= 2) {
    const stateToken = comma[comma.length - 1] ?? '';
    const stateMatch = /^([A-Za-z]{2})\b/.exec(stateToken);
    const state = stateMatch?.[1]?.toUpperCase() ?? '';
    const city = comma.slice(0, -1).join(' ');
    return { city, state };
  }

  const tokens = trimmed.split(/\s+/);
  const last = tokens[tokens.length - 1] ?? '';
  if (/^[A-Za-z]{2}$/.test(last) && tokens.length > 1) {
    return { city: tokens.slice(0, -1).join(' '), state: last.toUpperCase() };
  }

  return { city: trimmed, state: '' };
}
