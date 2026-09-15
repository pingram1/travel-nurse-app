import { searchCityPlacesNearby } from '@/services/api/cityPlacesService';
import type { GeoPoint, Restaurant } from '@/types';

export interface DiningSearchParams {
  hospitalId: string;
  coordinates: GeoPoint;
  radiusMiles?: number;
}

/** @deprecated Prefer searchCityPlacesNearby({ category: 'dining' }) */
export async function searchDiningNearby(params: DiningSearchParams): Promise<Restaurant[]> {
  const request = {
    hospitalId: params.hospitalId,
    coordinates: params.coordinates,
    category: 'dining' as const,
  };
  return searchCityPlacesNearby(
    params.radiusMiles != null ? { ...request, radiusMiles: params.radiusMiles } : request,
  );
}
