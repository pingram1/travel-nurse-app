/**
 * Lodging safety ranking.
 * Labels (Preferred / Standard / Review) are shown to every user.
 * Raw crime-index reasoning is attached for Pro UI only.
 */

export const LODGING_RADIUS_MILES = 25;

/** Internal threshold: indices above this are marked caution. */
export const SAFETY_INDEX_CAUTION_LIMIT = 45;

export const SAFETY_SCORE_WEIGHTS = {
  crime: 0.55,
  proximity: 0.25,
  rating: 0.2,
} as const;

export type LodgingSafetyPreference = 'preferred' | 'standard' | 'caution';

export interface SafetyRankInput {
  /** Lower is safer (NIBRS-style 0–100). */
  areaCrimeIndex: number;
  distanceMiles: number;
  guestRating: number;
}

export interface LodgingSafetyExplanation {
  areaCrimeIndex: number;
  preference: LodgingSafetyPreference;
  distanceMiles: number;
  guestRating: number;
  compositeScore: number;
  weights: typeof SAFETY_SCORE_WEIGHTS;
  summary: string;
}

/**
 * Composite score used only for sort order (higher = safer / better).
 * Weights favor low crime, then proximity, then guest rating.
 */
export function computeStealthSafetyScore(input: SafetyRankInput): number {
  const crimeSafety = Math.max(0, 100 - input.areaCrimeIndex);
  const proximity = Math.max(0, 100 - (input.distanceMiles / LODGING_RADIUS_MILES) * 100);
  const rating = Math.min(100, (input.guestRating / 5) * 100);
  return (
    crimeSafety * SAFETY_SCORE_WEIGHTS.crime +
    proximity * SAFETY_SCORE_WEIGHTS.proximity +
    rating * SAFETY_SCORE_WEIGHTS.rating
  );
}

export function safetyPreferenceFromIndex(areaCrimeIndex: number): LodgingSafetyPreference {
  if (areaCrimeIndex <= 30) return 'preferred';
  if (areaCrimeIndex <= SAFETY_INDEX_CAUTION_LIMIT) return 'standard';
  return 'caution';
}

/** Deterministic pseudo crime index from coordinates (stable per location). */
export function deriveAreaCrimeIndex(latitude: number, longitude: number): number {
  const seed = Math.abs(Math.sin(latitude * 12.9898 + longitude * 78.233) * 43758.5453);
  const fractional = seed - Math.floor(seed);
  return Math.round(12 + fractional * 70);
}

export function explainLodgingSafety(input: SafetyRankInput): LodgingSafetyExplanation {
  const preference = safetyPreferenceFromIndex(input.areaCrimeIndex);
  const band =
    preference === 'preferred'
      ? 'Crime index is 30 or below, so this area is labeled Preferred.'
      : preference === 'standard'
        ? 'Crime index is 31–45, so this area is labeled Standard.'
        : 'Crime index is above 45, so this area is labeled Review.';

  return {
    areaCrimeIndex: input.areaCrimeIndex,
    preference,
    distanceMiles: input.distanceMiles,
    guestRating: input.guestRating,
    compositeScore: Math.round(computeStealthSafetyScore(input)),
    weights: SAFETY_SCORE_WEIGHTS,
    summary: `${band} Rank score is ${Math.round(SAFETY_SCORE_WEIGHTS.crime * 100)}% crime index (lower is safer), ${Math.round(SAFETY_SCORE_WEIGHTS.proximity * 100)}% proximity to your destination, and ${Math.round(SAFETY_SCORE_WEIGHTS.rating * 100)}% guest rating.`,
  };
}

export function sortByStealthSafety<T extends SafetyRankInput>(items: T[]): T[] {
  return [...items].sort((a, b) => computeStealthSafetyScore(b) - computeStealthSafetyScore(a));
}
