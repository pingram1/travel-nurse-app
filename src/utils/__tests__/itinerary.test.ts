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
      entertainmentNames: ['City Museum'],
      transitProvider: 'uber',
      transitLabel: 'UberX',
      transitCost: 45,
      carProvider: 'turo',
      carLabel: 'Turo SUV',
      carWeeklyRate: 266,
    });

    expect(summary.lodging?.totalNights).toBe(92);
    expect(summary.estimatedTotal).toBe(92 * 92 + 248 + 45 + 266);
    expect(summary.completionPercent).toBe(100);
    expect(summary.isReadyToConfirm).toBe(true);
    expect(summary.flight?.seat?.label).toBe('12A');
    expect(summary.entertainment.names).toEqual(['City Museum']);
    expect(summary.groundTransit.rideTransport?.provider).toBe('uber');
    expect(summary.groundTransit.carRental?.provider).toBe('turo');
  });

  it('allows confirming without a flight when lodging, dining, and ground are set', () => {
    const summary = buildItinerarySummary({
      facilityName: 'Mercy General',
      contractStart: '2026-08-01T00:00:00.000Z',
      contractEnd: '2026-11-01T00:00:00.000Z',
      lodgingName: 'Riverside Extended Stay',
      lodgingNightlyRate: 92,
      flightAirline: null,
      flightNumber: null,
      flightRoute: null,
      flightPrice: null,
      seat: null,
      restaurantNames: ['Verdant Bowl'],
      entertainmentNames: [],
      transitProvider: 'uber',
      transitLabel: 'UberX',
      transitCost: 45,
      carProvider: null,
      carLabel: null,
      carWeeklyRate: null,
    });

    expect(summary.isReadyToConfirm).toBe(true);
    expect(summary.completionPercent).toBe(100);
  });

  it('reports incomplete when required ground transport is missing', () => {
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
      entertainmentNames: [],
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

  it('allows confirming without gym or entertainment when dining is saved', () => {
    const summary = buildItinerarySummary({
      facilityName: 'Mercy General',
      contractStart: '2026-08-01T00:00:00.000Z',
      contractEnd: '2026-11-01T00:00:00.000Z',
      lodgingName: 'Stay',
      lodgingNightlyRate: 90,
      flightAirline: null,
      flightNumber: null,
      flightRoute: null,
      flightPrice: null,
      seat: null,
      restaurantNames: ['Real Tacos'],
      entertainmentNames: [],
      transitProvider: null,
      transitLabel: null,
      transitCost: null,
      carProvider: 'turo',
      carLabel: 'Turo Sedan',
      carWeeklyRate: 245,
    });

    expect(summary.isReadyToConfirm).toBe(true);
    expect(summary.entertainment.count).toBe(0);
    expect(summary.groundTransit.rideTransport).toBeNull();
    expect(summary.groundTransit.carRental?.label).toBe('Turo Sedan');
  });

  it('allows confirming without a medical facility when lodging, dining, and ground are set', () => {
    const summary = buildItinerarySummary({
      facilityName: null,
      contractStart: '2026-08-01T00:00:00.000Z',
      contractEnd: '2026-11-01T00:00:00.000Z',
      lodgingName: 'Galleria Suites',
      lodgingNightlyRate: 152,
      flightAirline: null,
      flightNumber: null,
      flightRoute: null,
      flightPrice: null,
      seat: null,
      restaurantNames: ['Real Tacos'],
      entertainmentNames: [],
      transitProvider: null,
      transitLabel: null,
      transitCost: null,
      carProvider: 'turo',
      carLabel: 'Turo Sedan',
      carWeeklyRate: 245,
    });

    expect(summary.isReadyToConfirm).toBe(true);
    expect(summary.facilityName).toBe('No facility selected');
    expect(summary.lodging?.totalNights).toBe(92);
  });

  it('uses saved contract dates for lodging nights and cost (Aug 14–18 → 4 nights)', () => {
    const summary = buildItinerarySummary({
      facilityName: null,
      contractStart: '2026-08-14T00:00:00.000Z',
      contractEnd: '2026-08-18T00:00:00.000Z',
      lodgingName: 'Galleria Suites',
      lodgingNightlyRate: 152,
      flightAirline: null,
      flightNumber: null,
      flightRoute: null,
      flightPrice: null,
      seat: null,
      restaurantNames: ['Real Tacos'],
      entertainmentNames: [],
      transitProvider: null,
      transitLabel: null,
      transitCost: null,
      carProvider: 'turo',
      carLabel: 'Turo Sedan',
      carWeeklyRate: 245,
    });

    expect(summary.lodging?.totalNights).toBe(4);
    expect(summary.estimatedTotal).toBe(152 * 4 + 245);
  });

  it('reaches 100% and is confirmable with a flight even when no seat is chosen', () => {
    const summary = buildItinerarySummary({
      facilityName: null,
      contractStart: '2026-08-14T00:00:00.000Z',
      contractEnd: '2026-08-21T00:00:00.000Z',
      lodgingName: 'The Standard Spa, Miami Beach',
      lodgingNightlyRate: 149,
      flightAirline: 'Southwest',
      flightNumber: 'WN 254',
      flightRoute: 'DFW → MIA',
      flightPrice: 173,
      seat: null,
      restaurantNames: ['Hard Rock Cafe'],
      entertainmentNames: [],
      transitProvider: null,
      transitLabel: null,
      transitCost: null,
      carProvider: 'turo',
      carLabel: 'Turo Sedan',
      carWeeklyRate: 245,
    });

    expect(summary.completionPercent).toBe(100);
    expect(summary.isReadyToConfirm).toBe(true);
    expect(summary.flight?.seat).toBeNull();
  });
});
