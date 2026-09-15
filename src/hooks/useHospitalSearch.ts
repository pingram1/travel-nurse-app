import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import {
  findHospitalByFacilityName,
  refineHospitalCoordinates,
  searchHospitals,
} from '@/services/api/hospitalService';
import { useTripStore } from '@/store/tripStore';
import type { Hospital } from '@/types';

const DEBOUNCE_MS = 320;
const MIN_QUERY_LENGTH = 2;

export interface UseHospitalSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: Hospital[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  /** Manually trigger search (also runs automatically while typing). */
  search: (query: string) => void;
  selectHospital: (hospital: Hospital) => Promise<void>;
  clearResults: () => void;
  resolveFromFacilityName: (facilityName: string) => Promise<Hospital | null>;
}

export function useHospitalSearch(): UseHospitalSearchResult {
  const [query, setQueryState] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const setHospitalResults = useTripStore((s) => s.setHospitalResults);
  const setHospitalsLoading = useTripStore((s) => s.setHospitalsLoading);
  const selectHospitalInStore = useTripStore((s) => s.selectHospital);
  const hospitalResults = useTripStore((s) => s.hospitalResults);

  const searchQuery = useQuery({
    queryKey: ['hospitals', 'search', submittedQuery],
    queryFn: () => searchHospitals({ query: submittedQuery, limit: 15 }),
    enabled: submittedQuery.trim().length >= MIN_QUERY_LENGTH,
    staleTime: 5 * 60_000,
  });

  // Real-time autocomplete: debounce keystrokes into NPPES/backend queries.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSubmittedQuery('');
      setHospitalResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setSubmittedQuery(trimmed);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, setHospitalResults]);

  useEffect(() => {
    setHospitalsLoading(searchQuery.isFetching);
  }, [searchQuery.isFetching, setHospitalsLoading]);

  useEffect(() => {
    if (searchQuery.data) {
      setHospitalResults(searchQuery.data);
    }
  }, [searchQuery.data, setHospitalResults]);

  const setQuery = useCallback((next: string) => {
    setQueryState(next);
  }, []);

  const search = useCallback((next: string) => {
    const trimmed = next.trim();
    setQueryState(next);
    setSubmittedQuery(trimmed.length >= MIN_QUERY_LENGTH ? trimmed : '');
  }, []);

  const selectHospital = useCallback(
    async (hospital: Hospital) => {
      setHospitalsLoading(true);
      try {
        // Autocomplete uses cheap approx coords; refine to a real address before geo APIs run.
        const refined = await refineHospitalCoordinates(hospital);
        selectHospitalInStore(refined);
        setQueryState(refined.name);
        setSubmittedQuery('');
        setHospitalResults([refined]);
      } finally {
        setHospitalsLoading(false);
      }
    },
    [selectHospitalInStore, setHospitalResults, setHospitalsLoading],
  );

  const clearResults = useCallback(() => {
    setHospitalResults([]);
    setSubmittedQuery('');
  }, [setHospitalResults]);

  const resolveFromFacilityName = useCallback(
    async (facilityName: string) => {
      const hospital = await findHospitalByFacilityName(facilityName);
      if (hospital) {
        const refined = await refineHospitalCoordinates(hospital);
        selectHospitalInStore(refined);
        setQueryState(refined.name);
        return refined;
      }
      return hospital;
    },
    [selectHospitalInStore],
  );

  const showLiveResults = query.trim().length >= MIN_QUERY_LENGTH;

  return {
    query,
    setQuery,
    results: showLiveResults ? (searchQuery.data ?? hospitalResults) : [],
    isLoading: searchQuery.isLoading,
    isFetching: searchQuery.isFetching,
    error: searchQuery.error,
    search,
    selectHospital,
    clearResults,
    resolveFromFacilityName,
  };
}
