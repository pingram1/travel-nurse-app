import {
  computeStealthSafetyScore,
  explainLodgingSafety,
  safetyPreferenceFromIndex,
  sortByStealthSafety,
} from '../safetyRanking';

describe('safetyRanking', () => {
  it('scores safer (lower crime) areas higher', () => {
    const safe = computeStealthSafetyScore({
      areaCrimeIndex: 20,
      distanceMiles: 2,
      guestRating: 4.5,
    });
    const risky = computeStealthSafetyScore({
      areaCrimeIndex: 70,
      distanceMiles: 2,
      guestRating: 4.5,
    });
    expect(safe).toBeGreaterThan(risky);
  });

  it('maps crime indices to opaque preference tiers', () => {
    expect(safetyPreferenceFromIndex(18)).toBe('preferred');
    expect(safetyPreferenceFromIndex(40)).toBe('standard');
    expect(safetyPreferenceFromIndex(60)).toBe('caution');
  });

  it('explains crime-index bands for Pro context', () => {
    const explanation = explainLodgingSafety({
      areaCrimeIndex: 22,
      distanceMiles: 2,
      guestRating: 4.4,
    });
    expect(explanation.preference).toBe('preferred');
    expect(explanation.areaCrimeIndex).toBe(22);
    expect(explanation.summary).toMatch(/Preferred/);
  });

  it('sorts lodging candidates safest-first without exposing indices', () => {
    const ranked = sortByStealthSafety([
      { areaCrimeIndex: 55, distanceMiles: 1, guestRating: 4.9, id: 'risky' },
      { areaCrimeIndex: 22, distanceMiles: 3, guestRating: 4.2, id: 'safe' },
      { areaCrimeIndex: 35, distanceMiles: 2, guestRating: 4.5, id: 'mid' },
    ]);
    expect(ranked.map((r) => r.id)).toEqual(['safe', 'mid', 'risky']);
  });
});
