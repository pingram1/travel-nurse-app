import { buildItinerarySummary } from '../itinerary';

describe('buildItinerarySummary', () => {
  it('computes estimated total from all selections', () => {
    const summary = buildItinerarySummary({
      facilityName: 'Mercy General',
      contractStart: '2026-08-01T00:00:00.000Z',
      contractEnd: '2026-11-01T00:00:00.000Z',
      lodgingName: 'Riverside Extended Stay',
      lodgingNightlyRate: 92,
      flightAirline: 'Alaska',
      flightNumber: 'AS 512',
      flightRoute: 'AUS → PDX',
      flightPrice: 248,
      seat: {
        flightId: 'f-pdx-1',
        seatId: '12A',
        row: 12,
        column: 'A',
        seatClass: 'economy',
        price: 0,
        label: '12A',
      },
      restaurantNames: ['Verdant Bowl'],
      transitProvider: 'uber',
      transitLabel: 'UberX',
      transitCost: 45,
      carProvider: 'turo',
      carLabel: 'Turo SUV',
      carWeeklyRate: 266,
    });

    expect(summary.estimatedTotal).toBeGreaterThan(0);
    expect(summary.completionPercent).toBe(100);
    expect(summary.isReadyToConfirm).toBe(true);
    expect(summary.flight?.seat?.label).toBe('12A');
  });

  it('reports partial completion when selections are missing', () => {
    const summary = buildItinerarySummary({
      facilityName: 'Mercy General',
      contractStart: null,
      contractEnd: null,
      lodgingName: null,
      lodgingNightlyRate: null,
      flightAirline: null,
      flightNumber: null,
      flightRoute: null,
      flightPrice: null,
      seat: null,
      restaurantNames: [],
      transitProvider: null,
      transitLabel: null,
      transitCost: null,
      carProvider: null,
      carLabel: null,
      carWeeklyRate: null,
    });

    expect(summary.completionPercent).toBeLessThan(50);
    expect(summary.isReadyToConfirm).toBe(false);
  });
});
