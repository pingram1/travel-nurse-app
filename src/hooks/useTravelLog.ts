import { useCallback, useState } from 'react';

import { capturePhoto, pickImageFromLibrary } from '@/services/media/pickImage';
import { useTripStore } from '@/store/tripStore';
import type { RentalLog, RentalPhotoKind, RideShareLogEntry } from '@/types';

export interface UseTravelLogResult {
  rentalLog: RentalLog;
  rideShareLog: RideShareLogEntry[];
  isPicking: boolean;
  error: string | null;
  setStartMileage: (miles: number | null) => void;
  setEndMileage: (miles: number | null) => void;
  setInsuranceOnFile: (onFile: boolean) => void;
  pickInsurancePhoto: () => Promise<void>;
  addRentalPhoto: (kind: RentalPhotoKind, fuelLevel?: string | null) => Promise<void>;
  removeRentalEntry: (entryId: string) => void;
  addRideScreenshot: () => Promise<void>;
  captureRideScreenshot: () => Promise<void>;
  removeRideScreenshot: (entryId: string) => void;
}

export function useTravelLog(): UseTravelLogResult {
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rentalLog = useTripStore((s) => s.rentalLog);
  const rideShareLog = useTripStore((s) => s.rideShareLog);
  const setRentalStartMileage = useTripStore((s) => s.setRentalStartMileage);
  const setRentalEndMileage = useTripStore((s) => s.setRentalEndMileage);
  const setRentalInsuranceOnFile = useTripStore((s) => s.setRentalInsuranceOnFile);
  const setRentalInsurancePhoto = useTripStore((s) => s.setRentalInsurancePhoto);
  const addRentalLogEntry = useTripStore((s) => s.addRentalLogEntry);
  const removeRentalLogEntry = useTripStore((s) => s.removeRentalLogEntry);
  const addRideShareScreenshot = useTripStore((s) => s.addRideShareScreenshot);
  const removeRideShareScreenshot = useTripStore((s) => s.removeRideShareScreenshot);

  const runPick = useCallback(async (source: 'library' | 'camera'): Promise<string | null> => {
    setIsPicking(true);
    setError(null);
    try {
      const uri = source === 'camera' ? await capturePhoto() : await pickImageFromLibrary();
      return uri;
    } catch {
      setError('Could not open the camera or photo library.');
      return null;
    } finally {
      setIsPicking(false);
    }
  }, []);

  const pickInsurancePhoto = useCallback(async () => {
    const uri = await runPick('library');
    if (uri) setRentalInsurancePhoto(uri);
  }, [runPick, setRentalInsurancePhoto]);

  const addRentalPhoto = useCallback(
    async (kind: RentalPhotoKind, fuelLevel?: string | null) => {
      const uri = await runPick('library');
      if (!uri) return;
      addRentalLogEntry({
        photoKind: kind,
        photoUri: uri,
        fuelLevel: fuelLevel?.trim() ? fuelLevel.trim() : null,
      });
    },
    [addRentalLogEntry, runPick],
  );

  const addRideScreenshot = useCallback(async () => {
    const uri = await runPick('library');
    if (uri) addRideShareScreenshot(uri);
  }, [addRideShareScreenshot, runPick]);

  const captureRideScreenshot = useCallback(async () => {
    const uri = await runPick('camera');
    if (uri) addRideShareScreenshot(uri);
  }, [addRideShareScreenshot, runPick]);

  return {
    rentalLog,
    rideShareLog,
    isPicking,
    error,
    setStartMileage: setRentalStartMileage,
    setEndMileage: setRentalEndMileage,
    setInsuranceOnFile: setRentalInsuranceOnFile,
    pickInsurancePhoto,
    addRentalPhoto,
    removeRentalEntry: removeRentalLogEntry,
    addRideScreenshot,
    captureRideScreenshot,
    removeRideScreenshot: removeRideShareScreenshot,
  };
}
