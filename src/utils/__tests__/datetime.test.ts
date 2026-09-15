import { countLodgingNights, formatShortDate } from '../datetime';

describe('countLodgingNights', () => {
  it('counts Aug 14–18 as 4 nights (checkout on the end date)', () => {
    expect(countLodgingNights('2026-08-14T00:00:00.000Z', '2026-08-18T00:00:00.000Z')).toBe(4);
  });

  it('counts Aug 1–Nov 1 as 92 nights via calendar math', () => {
    expect(countLodgingNights('2026-08-01T00:00:00.000Z', '2026-11-01T00:00:00.000Z')).toBe(92);
  });

  it('clamps same-day stays to 1 night when both dates exist', () => {
    expect(countLodgingNights('2026-08-14', '2026-08-14')).toBe(1);
  });

  it('returns 0 when dates are missing', () => {
    expect(countLodgingNights(null, '2026-08-18')).toBe(0);
    expect(countLodgingNights('2026-08-14', null)).toBe(0);
    expect(countLodgingNights(null, null)).toBe(0);
  });

  it('returns 0 when the end date is before the start date', () => {
    expect(countLodgingNights('2026-08-18', '2026-08-14')).toBe(0);
  });
});

describe('formatShortDate', () => {
  it('returns the YYYY-MM-DD prefix', () => {
    expect(formatShortDate('2026-08-14T00:00:00.000Z')).toBe('2026-08-14');
  });
});
