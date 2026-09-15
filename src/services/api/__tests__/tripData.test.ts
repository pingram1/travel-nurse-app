import { buildStubSafetyRating } from '../safetyService';
import { buildCarRentalsForHospital, buildTransitOptions } from '../tripData';
import type { Hospital } from '@/types';

function hospital(): Hospital {
  return {
    id: 'npi-1',
    name: 'Test Hospital',
    city: 'Houston',
    state: 'TX',
    airportCode: 'IAH',
    address: {
      street: '1 Main',
      city: 'Houston',
      state: 'TX',
      zipCode: '77030',
      country: 'US',
    },
    coordinates: { latitude: 29.71, longitude: -95.4 },
    safety: buildStubSafetyRating({
      facilityId: 'npi-1',
      facilityName: 'Test Hospital',
      zipCode: '77030',
    }).data,
  };
}

describe('tripData ground catalogs', () => {
  it('keeps Turo under car rental with multiple airport vehicle types', () => {
    const rentals = buildCarRentalsForHospital(hospital());
    const turo = rentals.filter((r) => r.provider === 'turo');

    expect(turo.length).toBeGreaterThanOrEqual(4);
    expect(turo.map((r) => r.vehicleClass)).toEqual(
      expect.arrayContaining(['Sedan', 'SUV', 'Truck', 'Minivan']),
    );
    expect(turo.every((r) => r.pickupLocation.includes('IAH'))).toBe(true);
  });

  it('excludes Turo from ride-share transit options', () => {
    const transit = buildTransitOptions(null, '2026-08-07T13:24:00Z');
    expect(transit.map((t) => t.provider).sort()).toEqual(['lyft', 'uber']);
    expect(transit.some((t) => t.label.toLowerCase().includes('turo'))).toBe(false);
  });
});
