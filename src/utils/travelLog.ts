import type { RentalLog } from '@/types';

export function parseMileageInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export function rentalMileageDriven(log: RentalLog): number | null {
  if (log.startMileage === null || log.endMileage === null) return null;
  if (log.endMileage < log.startMileage) return null;
  return log.endMileage - log.startMileage;
}

export function createEmptyRentalLog(): RentalLog {
  return {
    startMileage: null,
    endMileage: null,
    insuranceOnFile: false,
    insurancePhotoUri: null,
    entries: [],
  };
}
