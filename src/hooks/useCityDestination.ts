import { useState } from 'react';

import { resolveCityDestination } from '@/services/api/destinationService';
import { useTripStore } from '@/store/tripStore';

export function useCityDestination() {
  const setDestination = useTripStore((s) => s.setDestination);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveCity = async (query: string): Promise<boolean> => {
    setError(null);
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Enter a city (for example Houston, TX).');
      return false;
    }
    setIsResolving(true);
    try {
      const destination = await resolveCityDestination(trimmed);
      if (!destination) {
        setError('Could not find that city. Try “City, ST”.');
        return false;
      }
      setDestination(destination);
      return true;
    } catch {
      setError('Destination lookup failed. Check your connection and try again.');
      return false;
    } finally {
      setIsResolving(false);
    }
  };

  return { resolveCity, isResolving, error };
}
