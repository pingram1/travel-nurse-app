import { useCallback, useState } from 'react';

import {
  parseBoardingPassText,
  pickBoardingPassImage,
  scanBoardingPassImage,
  seatSelectionFromBoardingPass,
  takeBoardingPassPhoto,
} from '@/services/api/boardingPassService';
import { flightFromBoardingPass } from '@/services/api/flightService';
import { useTripStore } from '@/store/tripStore';
import type { BoardingPassExtract } from '@/types';
import { destinationFromHospital } from '@/utils/destination';
import { getUserFacingMessage, normalizeError } from '@/utils/errorHandler';

export interface UseBoardingPassResult {
  extract: BoardingPassExtract | null;
  isScanning: boolean;
  error: string | null;
  pickFromLibrary: () => Promise<BoardingPassExtract | null>;
  capturePhoto: () => Promise<BoardingPassExtract | null>;
  parseText: (text: string) => BoardingPassExtract;
  applyToItinerary: (extract?: BoardingPassExtract | null) => boolean;
  clear: () => void;
}

export function useBoardingPass(): UseBoardingPassResult {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const destination = useTripStore((s) => s.destination);
  const hospital = useTripStore((s) => s.selectedHospital);
  const extract = useTripStore((s) => s.boardingPass);
  const setBoardingPass = useTripStore((s) => s.setBoardingPass);
  const applyBoardingPassToItinerary = useTripStore((s) => s.applyBoardingPassToItinerary);

  const runScan = useCallback(
    async (uri: string | null): Promise<BoardingPassExtract | null> => {
      if (!uri) {
        setError('No image selected.');
        return null;
      }
      setIsScanning(true);
      setError(null);
      try {
        const result = await scanBoardingPassImage(uri);
        setBoardingPass(result);
        if (!result.flightNumber && result.confidence === 0) {
          setError(
            'Could not read the boarding pass automatically. Paste the pass text below or try a clearer photo.',
          );
        }
        return result;
      } catch (err) {
        const appError = normalizeError(err);
        setError(getUserFacingMessage(appError));
        return null;
      } finally {
        setIsScanning(false);
      }
    },
    [setBoardingPass],
  );

  const pickFromLibrary = useCallback(async () => {
    const uri = await pickBoardingPassImage();
    return runScan(uri);
  }, [runScan]);

  const capturePhoto = useCallback(async () => {
    const uri = await takeBoardingPassPhoto();
    return runScan(uri);
  }, [runScan]);

  const parseText = useCallback(
    (text: string) => {
      const parsed = parseBoardingPassText(text);
      setBoardingPass(parsed);
      setError(null);
      return parsed;
    },
    [setBoardingPass],
  );

  const applyToItinerary = useCallback(
    (override?: BoardingPassExtract | null) => {
      const data = override ?? extract;
      if (!data?.airline || !data.flightNumber) {
        setError('Need airline and flight number before adding to your itinerary.');
        return false;
      }
      const tripDestination = destination ?? (hospital ? destinationFromHospital(hospital) : null);
      if (!tripDestination) {
        setError('Set a destination or facility on Trip Hub first.');
        return false;
      }

      const flight = flightFromBoardingPass({
        hospitalId: tripDestination.id,
        airline: data.airline,
        flightNumber: data.flightNumber,
        departureAirport: data.departureAirport ?? 'AUS',
        arrivalAirport: data.arrivalAirport ?? tripDestination.airportCode,
        departureDate: data.departureDate,
        seatNumber: data.seatNumber,
      });
      const seat = data.seatNumber
        ? seatSelectionFromBoardingPass(flight.id, data.seatNumber)
        : null;

      applyBoardingPassToItinerary(data, flight, seat);
      setError(null);
      return true;
    },
    [applyBoardingPassToItinerary, destination, extract, hospital],
  );

  const clear = useCallback(() => {
    setBoardingPass(null);
    setError(null);
  }, [setBoardingPass]);

  return {
    extract,
    isScanning,
    error,
    pickFromLibrary,
    capturePhoto,
    parseText,
    applyToItinerary,
    clear,
  };
}
