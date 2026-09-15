import type { SeatSelection } from '@/types';

/** Normalized cabin coordinates for the generic aircraft locator (0–1). */
export interface AircraftSeatPosition {
  /** 0 = nose / front, 1 = tail / rear */
  longitudinal: number;
  /** 0 = left window, 0.5 = aisle center, 1 = right window */
  lateral: number;
  zoneLabel: 'Forward' | 'Mid-cabin' | 'Aft';
  sideLabel: 'Window left' | 'Aisle left' | 'Aisle right' | 'Window right' | 'Center';
}

const COLUMN_LATERAL: Record<string, number> = {
  A: 0.12,
  B: 0.28,
  C: 0.4,
  D: 0.6,
  E: 0.72,
  F: 0.88,
};

const DEFAULT_TOTAL_ROWS = 30;

export function seatToAircraftPosition(
  seat: Pick<SeatSelection, 'row' | 'column'> | { row: number; column: string },
  totalRows = DEFAULT_TOTAL_ROWS,
): AircraftSeatPosition {
  const row = Math.max(1, Math.min(seat.row, totalRows));
  const longitudinal = Math.min(0.92, Math.max(0.08, row / totalRows));
  const lateral = COLUMN_LATERAL[seat.column.toUpperCase()] ?? 0.5;

  const zoneLabel: AircraftSeatPosition['zoneLabel'] =
    longitudinal < 0.33 ? 'Forward' : longitudinal < 0.66 ? 'Mid-cabin' : 'Aft';

  let sideLabel: AircraftSeatPosition['sideLabel'] = 'Center';
  if (lateral <= 0.2) sideLabel = 'Window left';
  else if (lateral <= 0.45) sideLabel = 'Aisle left';
  else if (lateral >= 0.8) sideLabel = 'Window right';
  else if (lateral >= 0.55) sideLabel = 'Aisle right';

  return { longitudinal, lateral, zoneLabel, sideLabel };
}

export function parseSeatNumber(seatNumber: string): { row: number; column: string } | null {
  const match = seatNumber
    .trim()
    .toUpperCase()
    .match(/^(\d{1,2})\s*([A-F])$/);
  if (!match) return null;
  return { row: Number(match[1]), column: match[2]! };
}
