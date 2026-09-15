import axios from 'axios';

import { LODGING_RADIUS_MILES } from '@/utils/safetyRanking';
import { searchLodgingNearby } from '../lodgingService';

jest.mock('@/services/api/client', () => ({
  apiGet: jest.fn(() => Promise.reject(new Error('backend unavailable'))),
  apiPost: jest.fn(() => Promise.reject(new Error('backend unavailable'))),
}));

jest.mock('@/constants/config', () => ({
  APP_CONFIG: {
    googlePlacesApiKey: 'test-places-key',
    lodgingRadiusMiles: 25,
  },
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('lodgingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps Google Places lodging with hotel-site booking URLs (not Maps)', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (String(url).includes('place/details')) {
        return Promise.resolve({
          data: {
            status: 'OK',
            result: { website: 'https://www.marriott.com/en-us/hotels/pdxmc-medical-center' },
          },
        });
      }
      return Promise.resolve({
        data: {
          status: 'OK',
          results: [
            {
              place_id: 'ChIJhotel1',
              name: 'Medical Center Marriott',
              geometry: { location: { lat: 45.52, lng: -122.67 } },
              rating: 4.5,
              types: ['lodging', 'hotel'],
              vicinity: '123 Health Blvd',
              price_level: 2,
            },
          ],
        },
      });
    });

    const listings = await searchLodgingNearby({
      hospitalId: 'npi-test',
      coordinates: { latitude: 45.5152, longitude: -122.6784 },
      radiusMiles: LODGING_RADIUS_MILES,
    });

    expect(listings.length).toBeGreaterThan(0);
    for (const listing of listings) {
      expect(listing.distanceMiles).toBeLessThanOrEqual(LODGING_RADIUS_MILES);
      expect(listing.safetyPreference).toMatch(/preferred|standard|caution/);
      expect(listing).not.toHaveProperty('areaCrimeIndex');
      expect(listing.bookingWebUrl).toBeTruthy();
      expect(listing.bookingWebUrl).not.toMatch(/google\.com\/maps/i);
      expect(listing.bookingAppUrl).toBeUndefined();
      expect(listing.name).not.toMatch(/Travel Nurse Residence|Harborview Loft/);
    }
    expect(listings[0]?.bookingWebUrl).toContain('marriott.com');
  });

  it('returns an empty list when live lodging APIs fail (no mock lattice)', async () => {
    mockedAxios.get.mockRejectedValue(new Error('external map api unavailable'));
    mockedAxios.post.mockRejectedValue(new Error('overpass unavailable'));

    const listings = await searchLodgingNearby({
      hospitalId: 'npi-test',
      coordinates: { latitude: 45.5152, longitude: -122.6784 },
      radiusMiles: LODGING_RADIUS_MILES,
    });

    expect(listings).toEqual([]);
  });
});
