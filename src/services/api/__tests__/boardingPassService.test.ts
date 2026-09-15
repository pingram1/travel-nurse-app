import { parseBoardingPassText, seatSelectionFromBoardingPass } from '../boardingPassService';

describe('boardingPassService', () => {
  it('parses airline, flight number, seat, and route from pass text', () => {
    const extract = parseBoardingPassText(
      'UNITED AIRLINES  Flight UA 619  AUS → ORD  Seat 12C  Passenger: JANE DOE  2026-08-01',
    );

    expect(extract.airline).toBe('United');
    expect(extract.flightNumber).toBe('UA 619');
    expect(extract.seatNumber).toBe('12C');
    expect(extract.departureAirport).toBe('AUS');
    expect(extract.arrivalAirport).toBe('ORD');
    expect(extract.departureDate).toBe('2026-08-01');
    expect(extract.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('handles Southwest compact flight tokens', () => {
    const extract = parseBoardingPassText('Southwest WN 881 HOU to AUS 14F');
    expect(extract.airline).toBe('Southwest');
    expect(extract.flightNumber).toBe('WN 881');
    expect(extract.seatNumber).toBe('14F');
  });

  it('builds a seat selection from a parsed seat number', () => {
    const seat = seatSelectionFromBoardingPass('flt-1', '8A');
    expect(seat).toEqual(
      expect.objectContaining({
        flightId: 'flt-1',
        row: 8,
        column: 'A',
        label: '8A',
        seatClass: 'premium',
        seatId: '8A',
        price: 0,
      }),
    );
  });
});
