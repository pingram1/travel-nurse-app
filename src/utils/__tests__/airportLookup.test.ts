import { resolveAirportCode } from '../airportLookup';

describe('airportLookup', () => {
  it('resolves major cities to primary airports', () => {
    expect(resolveAirportCode('Portland', 'OR')).toBe('PDX');
    expect(resolveAirportCode('Houston', 'TX')).toBe('IAH');
    expect(resolveAirportCode('Chicago', 'IL')).toBe('ORD');
  });

  it('falls back to state default airports', () => {
    expect(resolveAirportCode('Smallville', 'OR')).toBe('PDX');
    expect(resolveAirportCode('Nowhere', 'NY')).toBe('JFK');
  });
});
