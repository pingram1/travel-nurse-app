import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { searchFlights } from '@/services/api/flightService';
import { useTripStore } from '@/store/tripStore';
import type { FlightOption } from '@/types';

function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(`${isoDate.slice(0, 10)}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export interface UseFlightSearchResult {
  flights: FlightOption[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  departureWindow: { start: string; end: string } | null;
  refetch: () => void;
}

/**
 * Queries flights for the contract stay date range (departure window = start → start+7).
 */
export function useFlightSearch(): UseFlightSearchResult {
  const hospital = useTripStore((s) => s.selectedHospital);
  const destination = useTripStore((s) => s.destination);
  const contractStart = useTripStore((s) => s.contractStart);
  const contractEnd = useTripStore((s) => s.contractEnd);
  const originAirport = useTripStore((s) => s.originAirport);
  const setFlightResults = useTripStore((s) => s.setFlightResults);
  const setFlightsLoading = useTripStore((s) => s.setFlightsLoading);
  const flightResults = useTripStore((s) => s.flightResults);

  const start = contractStart?.slice(0, 10) ?? null;
  const endCandidate = contractEnd?.slice(0, 10) ?? null;
  const windowEnd = start ? addDaysIso(start, 7) : null;
  const end =
    start && windowEnd
      ? endCandidate && endCandidate < windowEnd
        ? endCandidate
        : windowEnd
      : null;

  const origin = originAirport.trim().toUpperCase();
  const arrivalAirport = destination?.airportCode ?? hospital?.airportCode ?? '';
  const anchorId = destination?.id ?? hospital?.id ?? '';
  const enabled = Boolean(arrivalAirport && start && end && origin.length === 3);

  const query = useQuery({
    queryKey: ['flights', 'search', anchorId, arrivalAirport, origin, start, end],
    queryFn: () =>
      searchFlights({
        hospitalId: anchorId,
        originAirport: origin,
        destinationAirport: arrivalAirport,
        departureDateStart: start!,
        departureDateEnd: end!,
      }),
    enabled,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    setFlightsLoading(query.isFetching);
  }, [query.isFetching, setFlightsLoading]);

  useEffect(() => {
    if (!enabled) {
      setFlightResults([]);
      return;
    }
    if (query.data) {
      setFlightResults(query.data);
    }
  }, [enabled, query.data, setFlightResults]);

  return {
    flights: enabled ? (query.data ?? flightResults) : [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    departureWindow: enabled && start && end ? { start, end } : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
