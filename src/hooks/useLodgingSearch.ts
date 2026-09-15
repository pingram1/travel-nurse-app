import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { APP_CONFIG } from '@/constants/config';
import { searchLodgingNearby } from '@/services/api/lodgingService';
import { useTripStore } from '@/store/tripStore';
import type { LodgingListing } from '@/types';

export interface UseLodgingSearchResult {
  lodging: LodgingListing[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/** Loads lodging within the configured radius once a destination (facility or city) is set. */
export function useLodgingSearch(): UseLodgingSearchResult {
  const hospital = useTripStore((s) => s.selectedHospital);
  const destination = useTripStore((s) => s.destination);
  const setLodgingResults = useTripStore((s) => s.setLodgingResults);
  const setLodgingLoading = useTripStore((s) => s.setLodgingLoading);
  const lodgingResults = useTripStore((s) => s.lodgingResults);

  const placesKeyPresent = Boolean(APP_CONFIG.googlePlacesApiKey);
  const anchor =
    destination ?? (hospital ? { id: hospital.id, coordinates: hospital.coordinates } : null);

  const query = useQuery({
    queryKey: [
      'lodging',
      'nearby',
      anchor?.id,
      anchor?.coordinates.latitude,
      anchor?.coordinates.longitude,
      placesKeyPresent,
    ],
    queryFn: () =>
      searchLodgingNearby({
        hospitalId: anchor!.id,
        coordinates: anchor!.coordinates,
        radiusMiles: APP_CONFIG.lodgingRadiusMiles,
      }),
    enabled: Boolean(anchor),
    staleTime: 5 * 60_000,
    // Re-run after env/key changes or hospital geocode refine — empty caches were sticky.
    refetchOnMount: 'always',
  });

  useEffect(() => {
    setLodgingLoading(query.isFetching);
  }, [query.isFetching, setLodgingLoading]);

  useEffect(() => {
    if (query.data) {
      setLodgingResults(query.data);
    }
  }, [query.data, setLodgingResults]);

  return {
    lodging: query.data ?? lodgingResults,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: () => {
      void query.refetch();
    },
  };
}
