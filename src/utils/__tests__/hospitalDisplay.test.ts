import { buildStubSafetyRating } from '@/services/api/safetyService';
import type { Hospital } from '@/types';
import {
  formatHospitalCampusLine,
  formatHospitalOptionSubtitle,
  formatHospitalOptionTitle,
} from '../hospitalDisplay';

function hospital(overrides: Partial<Hospital> = {}): Hospital {
  const id = overrides.id ?? 'npi-1000000001';
  const name = overrides.name ?? 'BAYLOR COLLEGE OF MEDICINE';
  return {
    id,
    name,
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
    coordinates: { latitude: 29.71, longitude: -95.39 },
    safety: buildStubSafetyRating({
      facilityId: id,
      facilityName: name,
      zipCode: '77030',
    }).data,
    ...overrides,
  };
}

describe('hospitalDisplay', () => {
  it('appends street and zip so identical org names are distinguishable', () => {
    const a = hospital({
      id: 'npi-1',
      address: {
        street: '1 Baylor Plaza',
        city: 'Houston',
        state: 'TX',
        zipCode: '77030',
        country: 'US',
      },
    });
    const b = hospital({
      id: 'npi-2',
      address: {
        street: '7200 Cambridge St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77030',
        country: 'US',
      },
    });

    expect(formatHospitalOptionTitle(a)).toContain('1 Baylor Plaza');
    expect(formatHospitalOptionTitle(b)).toContain('7200 Cambridge St');
    expect(formatHospitalOptionTitle(a)).not.toBe(formatHospitalOptionTitle(b));
    expect(formatHospitalCampusLine(a)).toBe('1 Baylor Plaza, 77030');
    expect(formatHospitalOptionSubtitle(a)).toContain('77030');
  });

  it('falls back to NPI when street/zip are placeholders', () => {
    const h = hospital({
      id: 'npi-9988776655',
      address: {
        street: 'Address TBD',
        city: 'Houston',
        state: 'TX',
        zipCode: '00000',
        country: 'US',
      },
    });
    expect(formatHospitalOptionTitle(h)).toContain('NPI 9988776655');
  });
});
