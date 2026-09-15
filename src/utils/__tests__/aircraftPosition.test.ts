import { parseSeatNumber, seatToAircraftPosition } from '../aircraftPosition';

describe('aircraftPosition', () => {
  it('maps forward window seats near the nose', () => {
    const position = seatToAircraftPosition({ row: 2, column: 'A' });
    expect(position.zoneLabel).toBe('Forward');
    expect(position.sideLabel).toBe('Window left');
    expect(position.longitudinal).toBeLessThan(0.2);
  });

  it('maps aft aisle seats toward the tail', () => {
    const position = seatToAircraftPosition({ row: 28, column: 'C' });
    expect(position.zoneLabel).toBe('Aft');
    expect(position.sideLabel).toBe('Aisle left');
  });

  it('parses boarding-pass seat tokens', () => {
    expect(parseSeatNumber('14C')).toEqual({ row: 14, column: 'C' });
    expect(parseSeatNumber('8a')).toEqual({ row: 8, column: 'A' });
    expect(parseSeatNumber('bad')).toBeNull();
  });
});
