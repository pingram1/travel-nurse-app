import { parseCityStateQuery } from '../destination';

describe('parseCityStateQuery', () => {
  it('parses City, ST', () => {
    expect(parseCityStateQuery('Houston, TX')).toEqual({ city: 'Houston', state: 'TX' });
  });

  it('parses a bare city name', () => {
    expect(parseCityStateQuery('Portland')).toEqual({ city: 'Portland', state: '' });
  });
});
