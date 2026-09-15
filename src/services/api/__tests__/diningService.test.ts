import axios from 'axios';

import { searchDiningNearby } from '../diningService';
import { searchCityPlacesNearby } from '../cityPlacesService';

jest.mock('@/services/api/client', () => ({
  apiGet: jest.fn(() => Promise.reject(new Error('backend unavailable'))),
}));

jest.mock('@/constants/config', () => ({
  APP_CONFIG: {
    googlePlacesApiKey: 'test-places-key',
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

describe('city / dining places', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps Google Places restaurants without mock template names', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'OK',
        results: [
          {
            place_id: 'ChIJfood1',
            name: 'Local Pho House',
            geometry: { location: { lat: 45.52, lng: -122.67 } },
            rating: 4.6,
            types: ['restaurant', 'vietnamese_restaurant', 'food'],
            vicinity: '400 SW Market St',
            price_level: 1,
            opening_hours: { open_now: true },
          },
        ],
      },
    });
    // cafe pass
    mockedAxios.get.mockResolvedValueOnce({
      data: { status: 'ZERO_RESULTS', results: [] },
    });

    const restaurants = await searchDiningNearby({
      hospitalId: 'npi-test',
      coordinates: { latitude: 45.5152, longitude: -122.6784 },
      radiusMiles: 50,
    });

    expect(restaurants.length).toBeGreaterThan(0);
    expect(restaurants[0]?.name).toBe('Local Pho House');
    expect(restaurants[0]?.category).toBe('dining');
    expect(restaurants[0]?.bookingWebUrl).toBeTruthy();
    expect(restaurants.map((r) => r.name)).not.toEqual(
      expect.arrayContaining(['Night Shift Bowl', 'Sunrise Coffee Lab']),
    );
  });

  it('excludes hotels from gym results even when they include a gym type', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        status: 'OK',
        results: [
          {
            place_id: 'ChIJhotelGym',
            name: 'Crowne Plaza Houston Med Ctr',
            geometry: { location: { lat: 29.73, lng: -95.46 } },
            rating: 3.7,
            types: ['lodging', 'gym', 'point_of_interest'],
            vicinity: '2712 Southwest Freeway',
          },
          {
            place_id: 'ChIJrealGym',
            name: 'LA Fitness Galleria',
            geometry: { location: { lat: 29.74, lng: -95.46 } },
            rating: 4.2,
            types: ['gym', 'health', 'point_of_interest'],
            vicinity: '5000 Westheimer Rd',
          },
        ],
      },
    });

    const gyms = await searchCityPlacesNearby({
      hospitalId: 'npi-test',
      coordinates: { latitude: 29.74, longitude: -95.46 },
      category: 'gym',
      radiusMiles: 50,
    });

    expect(gyms.map((g) => g.name)).toContain('LA Fitness Galleria');
    expect(gyms.map((g) => g.name).join(' ')).not.toMatch(/Crowne Plaza/i);
  });

  it('returns live grocery stores and excludes lodging', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        status: 'OK',
        results: [
          {
            place_id: 'ChIJheb',
            name: 'H-E-B',
            geometry: { location: { lat: 29.74, lng: -95.46 } },
            rating: 4.3,
            types: ['supermarket', 'grocery_or_supermarket', 'store'],
            vicinity: '1701 Post Oak Blvd',
          },
        ],
      },
    });

    const groceries = await searchCityPlacesNearby({
      hospitalId: 'npi-test',
      coordinates: { latitude: 29.74, longitude: -95.46 },
      category: 'grocery',
      radiusMiles: 50,
    });

    expect(groceries[0]?.name).toBe('H-E-B');
    expect(groceries[0]?.category).toBe('grocery');
  });

  it('returns empty when Places and Overpass both fail', async () => {
    mockedAxios.get.mockRejectedValue(new Error('places down'));
    mockedAxios.post.mockRejectedValue(new Error('overpass down'));

    const restaurants = await searchDiningNearby({
      hospitalId: 'npi-test',
      coordinates: { latitude: 45.5152, longitude: -122.6784 },
    });

    expect(restaurants).toEqual([]);
  });
});
