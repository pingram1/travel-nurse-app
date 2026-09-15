import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { APP_CONFIG } from '@/constants/config';
import { searchAllCityPlacesNearby } from '@/services/api/cityPlacesService';
import { useTripStore } from '@/store/tripStore';
import type { CityPlace } from '@/types';

export interface UseDiningSearchResult {
  restaurants: CityPlace[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/** Loads live City Finder places once a destination (facility or city) is set. */
export function useDiningSearch(): UseDiningSearchResult {
  const hospital = useTripStore((s) => s.selectedHospital);
  const destination = useTripStore((s) => s.destination);
  const setRestaurantResults = useTripStore((s) => s.setRestaurantResults);
  const setDiningLoading = useTripStore((s) => s.setDiningLoading);
  const restaurantResults = useTripStore((s) => s.restaurantResults);
  const anchor =
    destination ?? (hospital ? { id: hospital.id, coordinates: hospital.coordinates } : null);

  const query = useQuery({
    queryKey: [
      'city-places',
      'nearby',
      anchor?.id,
      anchor?.coordinates.latitude,
      anchor?.coordinates.longitude,
      Boolean(APP_CONFIG.googlePlacesApiKey),
    ],
    queryFn: () =>
      searchAllCityPlacesNearby({
        hospitalId: anchor!.id,
        coordinates: anchor!.coordinates,
        radiusMiles: 50,
      }),
    enabled: Boolean(anchor),
    staleTime: 5 * 60_000,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    setDiningLoading(query.isFetching);
  }, [query.isFetching, setDiningLoading]);

  useEffect(() => {
    if (query.data) {
      setRestaurantResults(query.data);
    }
  }, [query.data, setRestaurantResults]);

  return {
    restaurants: query.data ?? restaurantResults,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: () => {
      void query.refetch();
    },
  };
}
