import axios from 'axios';

import { APP_CONFIG } from '@/constants/config';
import { apiGet } from '@/services/api/client';
import { buildStubSafetyRating } from '@/services/api/safetyService';
import type { GeoPoint, Hospital, HospitalSearchParams, PhysicalAddress } from '@/types';
import { resolveAirportCode } from '@/utils/airportLookup';
import { generateRequestId } from '@/utils/uuid';

const NPPES_BASE = 'https://npiregistry.cms.hhs.gov/api/';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const GOOGLE_GEOCODE_BASE = 'https://maps.googleapis.com/maps/api/geocode/json';

/** Rough land centroids so a failed geocode never places lodging search in the ocean. */
const STATE_CENTROIDS: Record<string, GeoPoint> = {
  AL: { latitude: 32.8, longitude: -86.9 },
  AK: { latitude: 64.2, longitude: -152.5 },
  AZ: { latitude: 34.3, longitude: -111.7 },
  AR: { latitude: 34.9, longitude: -92.4 },
  CA: { latitude: 36.8, longitude: -119.4 },
  CO: { latitude: 39.0, longitude: -105.5 },
  CT: { latitude: 41.6, longitude: -72.7 },
  DE: { latitude: 39.0, longitude: -75.5 },
  FL: { latitude: 27.8, longitude: -81.7 },
  GA: { latitude: 32.7, longitude: -83.4 },
  HI: { latitude: 20.3, longitude: -156.4 },
  ID: { latitude: 44.4, longitude: -114.6 },
  IL: { latitude: 40.0, longitude: -89.0 },
  IN: { latitude: 39.9, longitude: -86.3 },
  IA: { latitude: 42.0, longitude: -93.5 },
  KS: { latitude: 38.5, longitude: -98.3 },
  KY: { latitude: 37.5, longitude: -85.3 },
  LA: { latitude: 31.0, longitude: -92.0 },
  ME: { latitude: 45.3, longitude: -69.2 },
  MD: { latitude: 39.0, longitude: -76.7 },
  MA: { latitude: 42.2, longitude: -71.5 },
  MI: { latitude: 44.3, longitude: -85.4 },
  MN: { latitude: 46.3, longitude: -94.3 },
  MS: { latitude: 32.7, longitude: -89.7 },
  MO: { latitude: 38.3, longitude: -92.5 },
  MT: { latitude: 47.0, longitude: -109.6 },
  NE: { latitude: 41.5, longitude: -99.8 },
  NV: { latitude: 39.3, longitude: -116.6 },
  NH: { latitude: 43.7, longitude: -71.6 },
  NJ: { latitude: 40.1, longitude: -74.5 },
  NM: { latitude: 34.4, longitude: -106.1 },
  NY: { latitude: 42.9, longitude: -75.5 },
  NC: { latitude: 35.5, longitude: -79.8 },
  ND: { latitude: 47.4, longitude: -100.5 },
  OH: { latitude: 40.3, longitude: -82.8 },
  OK: { latitude: 35.6, longitude: -97.5 },
  OR: { latitude: 44.0, longitude: -120.5 },
  PA: { latitude: 40.9, longitude: -77.8 },
  RI: { latitude: 41.7, longitude: -71.5 },
  SC: { latitude: 33.9, longitude: -81.0 },
  SD: { latitude: 44.4, longitude: -100.2 },
  TN: { latitude: 35.8, longitude: -86.3 },
  TX: { latitude: 31.0, longitude: -99.0 },
  UT: { latitude: 39.3, longitude: -111.7 },
  VT: { latitude: 44.0, longitude: -72.7 },
  VA: { latitude: 37.5, longitude: -78.6 },
  WA: { latitude: 47.4, longitude: -120.5 },
  WV: { latitude: 38.6, longitude: -80.6 },
  WI: { latitude: 44.5, longitude: -89.5 },
  WY: { latitude: 43.0, longitude: -107.6 },
  DC: { latitude: 38.9, longitude: -77.0 },
};

interface NppesAddress {
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
  address_purpose?: string;
}

interface NppesResult {
  number: string;
  basic?: {
    organization_name?: string;
    status?: string;
  };
  addresses?: NppesAddress[];
  taxonomies?: Array<{ desc?: string; primary?: boolean }>;
}

interface NppesResponse {
  result_count?: number;
  results?: NppesResult[];
}

/** NPPES treats organization_name as a prefix match only when a trailing `*` is present. */
export function toNppesOrganizationQuery(raw: string): string {
  const trimmed = raw.trim().replace(/\*+/g, '*');
  if (!trimmed) return '';
  return trimmed.endsWith('*') ? trimmed : `${trimmed}*`;
}

function pickAddress(addresses: NppesAddress[] | undefined): PhysicalAddress {
  const preferred =
    addresses?.find((a) => a.address_purpose === 'LOCATION') ??
    addresses?.find((a) => a.city) ??
    addresses?.[0];

  const zip = (preferred?.postal_code ?? '').replace(/\D/g, '').slice(0, 5) || '00000';

  return {
    street:
      [preferred?.address_1, preferred?.address_2].filter(Boolean).join(', ') || 'Address TBD',
    city: preferred?.city ?? 'Unknown',
    state: (preferred?.state ?? 'US').toUpperCase(),
    zipCode: zip,
    country:
      preferred?.country_code === 'US' || !preferred?.country_code ? 'US' : preferred.country_code,
  };
}

function isHospitalTaxonomy(result: NppesResult): boolean {
  const taxonomies = result.taxonomies ?? [];
  if (taxonomies.length === 0) return true;
  return taxonomies.some((t) => {
    const desc = (t.desc ?? '').toLowerCase();
    return (
      desc.includes('hospital') ||
      desc.includes('general acute') ||
      desc.includes('critical access') ||
      desc.includes('medical center') ||
      desc.includes('psychiatric hospital') ||
      desc.includes('chronic disease hospital') ||
      desc.includes('long term care hospital') ||
      desc.includes('rehabilitation hospital')
    );
  });
}

async function geocodeWithGoogle(query: string): Promise<GeoPoint | null> {
  const key = APP_CONFIG.googlePlacesApiKey;
  if (!key) return null;
  try {
    const response = await axios.get<{
      status: string;
      results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>;
    }>(GOOGLE_GEOCODE_BASE, {
      params: { address: query, key },
      timeout: 10_000,
    });
    if (response.data.status !== 'OK') return null;
    const loc = response.data.results?.[0]?.geometry?.location;
    if (!loc) return null;
    return { latitude: loc.lat, longitude: loc.lng };
  } catch {
    return null;
  }
}

async function geocodeWithNominatim(query: string): Promise<GeoPoint | null> {
  try {
    const response = await axios.get<Array<{ lat: string; lon: string }>>(NOMINATIM_BASE, {
      params: { q: query, format: 'json', limit: 1 },
      headers: {
        'User-Agent': 'TravelNurseApp/0.1 (Start Right Tutoring, LLC; logistics)',
        Accept: 'application/json',
      },
      timeout: 8_000,
    });
    const hit = response.data[0];
    if (!hit) return null;
    return { latitude: Number(hit.lat), longitude: Number(hit.lon) };
  } catch {
    return null;
  }
}

/** Public geocoder for city-only trip planning (no facility required). */
export async function geocodePlaceQuery(query: string): Promise<GeoPoint | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  return (await geocodeWithGoogle(trimmed)) ?? (await geocodeWithNominatim(trimmed));
}

async function geocodeAddress(address: PhysicalAddress): Promise<GeoPoint | null> {
  const full = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, USA`;
  const cityState = `${address.city}, ${address.state} ${address.zipCode}, USA`;

  return (
    (await geocodeWithGoogle(full)) ??
    (await geocodeWithGoogle(cityState)) ??
    (await geocodeWithNominatim(full)) ??
    (await geocodeWithNominatim(cityState))
  );
}

/** Land-based fallback when live geocoders are unavailable (never ocean/random). */
function approximateCoordinates(address: PhysicalAddress): GeoPoint {
  return STATE_CENTROIDS[address.state] ?? { latitude: 39.8, longitude: -98.6 };
}

/**
 * Resolve real lat/lng for a hospital before lodging / dining / flight geo queries.
 * Autocomplete keeps approximate coords for speed; selection must refine.
 */
export async function refineHospitalCoordinates(hospital: Hospital): Promise<Hospital> {
  const coordinates =
    (await geocodeAddress(hospital.address)) ?? approximateCoordinates(hospital.address);
  return { ...hospital, coordinates };
}

async function mapNppesToHospital(
  result: NppesResult,
  options: { geocode: boolean } = { geocode: false },
): Promise<Hospital | null> {
  const name = result.basic?.organization_name?.trim();
  if (!name || !isHospitalTaxonomy(result)) return null;

  const address = pickAddress(result.addresses);
  const coordinates = options.geocode
    ? ((await geocodeAddress(address)) ?? approximateCoordinates(address))
    : approximateCoordinates(address);
  const id = `npi-${result.number}`;
  const safety = buildStubSafetyRating({
    facilityId: id,
    facilityName: name,
    zipCode: address.zipCode,
  }).data;

  return {
    id,
    name,
    city: address.city,
    state: address.state,
    airportCode: resolveAirportCode(address.city, address.state),
    address,
    coordinates,
    safety,
  };
}

function dedupeHospitals(hospitals: Hospital[]): Hospital[] {
  const seen = new Set<string>();
  const out: Hospital[] = [];
  for (const hospital of hospitals) {
    const key = hospital.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(hospital);
  }
  return out;
}

async function searchNppesHospitals(params: HospitalSearchParams): Promise<Hospital[]> {
  const limit = Math.min(params.limit ?? 15, 25);
  const organizationName = toNppesOrganizationQuery(params.query);
  if (!organizationName) return [];

  // Do not pass taxonomy_description to NPPES — it over-filters legitimate acute-care NPIs.
  // Filter hospital-like taxonomies client-side instead.
  const response = await axios.get<NppesResponse>(NPPES_BASE, {
    params: {
      version: '2.1',
      enumeration_type: 'NPI-2',
      organization_name: organizationName,
      state: params.state,
      city: params.city,
      limit: Math.min(limit * 3, 50),
    },
    timeout: 15_000,
    headers: { Accept: 'application/json' },
  });

  const results = response.data.results ?? [];
  // Approximate coords for autocomplete speed; refine on select if needed.
  const mapped = await Promise.all(results.map((result) => mapNppesToHospital(result)));
  return dedupeHospitals(mapped.filter((h): h is Hospital => h !== null)).slice(0, limit);
}

/**
 * Search major medical hospitals / centers nationwide via backend, falling back to CMS NPPES.
 */
export async function searchHospitals(params: HospitalSearchParams): Promise<Hospital[]> {
  const query = params.query.trim();
  if (query.length < 2) return [];

  try {
    const envelope = await Promise.race([
      apiGet<Hospital[]>('/hospitals/search', {
        params: {
          q: query,
          state: params.state,
          city: params.city,
          limit: params.limit ?? 15,
        },
        timeout: 4_000,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('hospital search timeout')), 4_500);
      }),
    ]);
    if (envelope.data?.length) return envelope.data;
  } catch {
    // Fall through to public NPPES registry.
  }

  try {
    return await searchNppesHospitals({ ...params, query });
  } catch {
    return [];
  }
}

/** Resolve a hospital by facility name (work-order auto-match). */
export async function findHospitalByFacilityName(facilityName: string): Promise<Hospital | null> {
  const results = await searchHospitals({ query: facilityName, limit: 8 });
  if (results.length === 0) return null;

  const lower = facilityName.toLowerCase();
  const exact = results.find((h) => h.name.toLowerCase() === lower);
  if (exact) return exact;

  const partial = results.find(
    (h) => lower.includes(h.name.toLowerCase()) || h.name.toLowerCase().includes(lower),
  );
  return partial ?? results[0] ?? null;
}

export async function getHospitalDetails(hospitalId: string): Promise<Hospital | null> {
  try {
    const envelope = await apiGet<Hospital>(`/hospitals/${hospitalId}`);
    return envelope.data;
  } catch {
    if (hospitalId.startsWith('npi-')) {
      const npi = hospitalId.replace(/^npi-/, '');
      const response = await axios.get<NppesResponse>(NPPES_BASE, {
        params: { version: '2.1', number: npi },
        timeout: 15_000,
      });
      const result = response.data.results?.[0];
      if (!result) return null;
      return mapNppesToHospital(result, { geocode: true });
    }
    return null;
  }
}

export function createHospitalRequestId(): string {
  return generateRequestId();
}
