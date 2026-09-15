import { geocodePlaceQuery } from '@/services/api/hospitalService';
import type { TripDestination } from '@/types';
import { parseCityStateQuery } from '@/utils/destination';
import { resolveAirportCode } from '@/utils/airportLookup';

export async function resolveCityDestination(query: string): Promise<TripDestination | null> {
  const { city, state } = parseCityStateQuery(query);
  if (!city) return null;

  const lookup = state ? `${city}, ${state}, USA` : `${city}, USA`;
  const coordinates = await geocodePlaceQuery(lookup);
  if (!coordinates) return null;

  const airportCode = resolveAirportCode(city, state);
  const slug = `${city}-${state || 'us'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id: `city-${slug}`,
    label: state ? `${city}, ${state}` : city,
    city,
    state,
    airportCode,
    coordinates,
    source: 'city',
  };
}
