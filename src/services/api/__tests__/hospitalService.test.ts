import { buildStubSafetyRating } from '../safetyService';
import {
  refineHospitalCoordinates,
  searchHospitals,
  toNppesOrganizationQuery,
} from '../hospitalService';
import type { Hospital } from '@/types';

jest.mock('@/constants/config', () => ({
  APP_CONFIG: {
    googlePlacesApiKey: 'test-key',
    apiBaseUrl: 'https://api.travelnurse.dev/v1',
  },
}));

jest.mock('@/services/api/client', () => ({
  apiGet: jest.fn(() => Promise.reject(new Error('backend unavailable'))),
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn((url: string, config?: { params?: Record<string, unknown> }) => {
      if (String(url).includes('npiregistry')) {
        const orgParam = config?.params?.organization_name;
        const org = typeof orgParam === 'string' ? orgParam : '';
        expect(org.endsWith('*')).toBe(true);

        return Promise.resolve({
          data: {
            result_count: 2,
            results: [
              {
                number: '1234567890',
                basic: { organization_name: 'TEST MEMORIAL HOSPITAL', status: 'A' },
                addresses: [
                  {
                    address_1: '100 Health Way',
                    city: 'Austin',
                    state: 'TX',
                    postal_code: '78701',
                    country_code: 'US',
                    address_purpose: 'LOCATION',
                  },
                ],
                taxonomies: [{ desc: 'General Acute Care Hospital', primary: true }],
              },
              {
                number: '9999999999',
                basic: { organization_name: 'TEST MEMORIAL PHARMACY', status: 'A' },
                addresses: [
                  {
                    address_1: '100 Health Way',
                    city: 'Austin',
                    state: 'TX',
                    postal_code: '78701',
                    country_code: 'US',
                    address_purpose: 'LOCATION',
                  },
                ],
                taxonomies: [{ desc: 'Pharmacy', primary: true }],
              },
            ],
          },
        });
      }
      if (String(url).includes('maps.googleapis.com/maps/api/geocode')) {
        return Promise.resolve({
          data: {
            status: 'OK',
            results: [{ geometry: { location: { lat: 29.7107, lng: -95.3965 } } }],
          },
        });
      }
      return Promise.resolve({
        data: [{ lat: '30.2672', lon: '-97.7431' }],
      });
    }),
  },
}));

describe('hospitalService', () => {
  it('adds a trailing wildcard for NPPES organization queries', () => {
    expect(toNppesOrganizationQuery('Mayo Clinic Hospital')).toBe('Mayo Clinic Hospital*');
    expect(toNppesOrganizationQuery('Mayo*')).toBe('Mayo*');
  });

  it('maps NPPES organizations into Hospital records and drops non-hospital taxonomies', async () => {
    const results: Hospital[] = await searchHospitals({ query: 'Test Memorial', limit: 5 });
    expect(results.length).toBe(1);
    expect(results[0]?.id).toBe('npi-1234567890');
    expect(results[0]?.name).toBe('TEST MEMORIAL HOSPITAL');
    expect(results[0]?.city).toBe('Austin');
    expect(results[0]?.airportCode).toBe('AUS');
  });

  it('refines hospital coordinates to a real geocoded location on select', async () => {
    const rough: Hospital = {
      id: 'npi-1',
      name: 'BAYLOR COLLEGE OF MEDICINE',
      city: 'Houston',
      state: 'TX',
      airportCode: 'IAH',
      address: {
        street: '1 Baylor Plaza',
        city: 'Houston',
        state: 'TX',
        zipCode: '77030',
        country: 'US',
      },
      // Fake zip-hash coords historically placed Houston in the Gulf — must be replaced.
      coordinates: { latitude: 25.72, longitude: -89.85 },
      safety: buildStubSafetyRating({
        facilityId: 'npi-1',
        facilityName: 'BAYLOR COLLEGE OF MEDICINE',
        zipCode: '77030',
      }).data,
    };

    const refined = await refineHospitalCoordinates(rough);
    expect(refined.coordinates.latitude).toBeCloseTo(29.7107, 3);
    expect(refined.coordinates.longitude).toBeCloseTo(-95.3965, 3);
  });
});
