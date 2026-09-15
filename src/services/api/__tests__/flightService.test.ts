import { searchFlights } from '../flightService';

jest.mock('@/services/api/client', () => ({
  apiGet: jest.fn(() => Promise.reject(new Error('backend unavailable'))),
  apiPost: jest.fn(() => Promise.reject(new Error('backend unavailable'))),
}));

describe('flightService', () => {
  it('returns flights inside the requested departure date window', async () => {
    const flights = await searchFlights({
      hospitalId: 'npi-test',
      originAirport: 'AUS',
      destinationAirport: 'PDX',
      departureDateStart: '2026-08-01',
      departureDateEnd: '2026-08-03',
    });

    expect(flights.length).toBeGreaterThan(0);
    for (const flight of flights) {
      const day = flight.departureTime.slice(0, 10);
      expect(day >= '2026-08-01').toBe(true);
      expect(day <= '2026-08-03').toBe(true);
      expect(flight.arrivalAirport).toBe('PDX');
      expect(flight.departureAirport).toBe('AUS');
    }
  });

  it('caps a long contract window to a one-week search horizon', async () => {
    const flights = await searchFlights({
      hospitalId: 'npi-test',
      originAirport: 'AUS',
      destinationAirport: 'ORD',
      departureDateStart: '2026-08-01',
      departureDateEnd: '2026-11-01',
    });

    const days = new Set(flights.map((f) => f.departureTime.slice(0, 10)));
    for (const day of days) {
      expect(day <= '2026-08-08').toBe(true);
    }
  });
});
