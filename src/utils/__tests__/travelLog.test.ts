import { createEmptyRentalLog, parseMileageInput, rentalMileageDriven } from '../travelLog';

describe('travelLog utils', () => {
  it('parses whole-mile odometer values', () => {
    expect(parseMileageInput('12450')).toBe(12450);
    expect(parseMileageInput('  0  ')).toBe(0);
    expect(parseMileageInput('')).toBeNull();
    expect(parseMileageInput('-3')).toBeNull();
    expect(parseMileageInput('abc')).toBeNull();
  });

  it('computes miles driven when end is at or after start', () => {
    const log = createEmptyRentalLog();
    expect(rentalMileageDriven(log)).toBeNull();
    expect(rentalMileageDriven({ ...log, startMileage: 100, endMileage: 140 })).toBe(40);
    expect(rentalMileageDriven({ ...log, startMileage: 100, endMileage: 90 })).toBeNull();
  });
});
