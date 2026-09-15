import axios from 'axios';

import { APP_CONFIG } from '@/constants/config';
import type { GeoPoint } from '@/types';
import { haversineMiles, roundMiles } from '@/utils/geo';

export interface PlacesHit {
  id: string;
  name: string;
  coordinates: GeoPoint;
  distanceMiles: number;
  rating: number;
  priceLevel?: number;
  types: string[];
  vicinity?: string;
  placeId?: string;
  openLate?: boolean;
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  geometry?: { location?: { lat: number; lng: number } };
  rating?: number;
  types?: string[];
  vicinity?: string;
  price_level?: number;
  opening_hours?: { open_now?: boolean };
}

interface GooglePlacesResponse {
  results?: GooglePlaceResult[];
  status: string;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

/** Google Places Nearby Search — requires EXPO_PUBLIC_GOOGLE_PLACES_API_KEY. */
export async function searchGooglePlacesNearby(params: {
  origin: GeoPoint;
  radiusMiles: number;
  type: string;
  keyword?: string;
}): Promise<PlacesHit[]> {
  const key = APP_CONFIG.googlePlacesApiKey;
  if (!key) return [];

  try {
    const radiusMeters = Math.round(params.radiusMiles * 1609.34);
    const response = await axios.get<GooglePlacesResponse>(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${params.origin.latitude},${params.origin.longitude}`,
          radius: radiusMeters,
          type: params.type,
          keyword: params.keyword,
          key,
        },
        timeout: 15_000,
      },
    );

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      return [];
    }

    return (response.data.results ?? []).map((place) => {
      const coordinates: GeoPoint = {
        latitude: place.geometry?.location?.lat ?? params.origin.latitude,
        longitude: place.geometry?.location?.lng ?? params.origin.longitude,
      };
      const hit: PlacesHit = {
        id: `place-${place.place_id}`,
        name: place.name,
        coordinates,
        distanceMiles: roundMiles(haversineMiles(params.origin, coordinates)),
        rating: place.rating ?? 4.0,
        types: place.types ?? [],
        placeId: place.place_id,
      };
      if (place.price_level != null) hit.priceLevel = place.price_level;
      if (place.vicinity) hit.vicinity = place.vicinity;
      if (place.opening_hours?.open_now != null) hit.openLate = place.opening_hours.open_now;
      return hit;
    });
  } catch {
    return [];
  }
}

/**
 * Live OpenStreetMap Overpass query — real establishments, no API key.
 * Used when Google Places is unavailable.
 */
export async function searchOverpassNearby(params: {
  origin: GeoPoint;
  radiusMiles: number;
  mode: 'dining' | 'lodging' | 'gym' | 'entertainment' | 'grocery';
}): Promise<PlacesHit[]> {
  const radiusMeters = Math.round(params.radiusMiles * 1609.34);
  const { latitude, longitude } = params.origin;
  const around = `(around:${radiusMeters},${latitude},${longitude})`;

  const filtersByMode: Record<typeof params.mode, string> = {
    dining: `
node["amenity"="restaurant"]${around};
node["amenity"="fast_food"]${around};
node["amenity"="cafe"]${around};
`,
    lodging: `
node["tourism"="hotel"]${around};
node["tourism"="guest_house"]${around};
node["tourism"="apartment"]${around};
node["tourism"="hostel"]${around};
way["tourism"="hotel"]${around};
`,
    gym: `
node["leisure"="fitness_centre"]${around};
node["leisure"="sports_centre"]${around};
node["amenity"="gym"]${around};
node["sport"="fitness"]${around};
node["sport"="yoga"]${around};
`,
    entertainment: `
node["tourism"="attraction"]${around};
node["tourism"="museum"]${around};
node["tourism"="zoo"]${around};
node["tourism"="theme_park"]${around};
node["amenity"="cinema"]${around};
node["amenity"="theatre"]${around};
node["amenity"="arts_centre"]${around};
node["leisure"="bowling_alley"]${around};
`,
    grocery: `
node["shop"="supermarket"]${around};
node["shop"="grocery"]${around};
node["shop"="convenience"]${around};
way["shop"="supermarket"]${around};
`,
  };
  const filters = filtersByMode[params.mode];

  const query = `
[out:json][timeout:25];
(
${filters}
);
out center 45;
`;

  try {
    const response = await axios.post<OverpassResponse>(
      'https://overpass-api.de/api/interpreter',
      query,
      {
        headers: {
          'Content-Type': 'text/plain',
          Accept: 'application/json',
          'User-Agent': 'TravelNurseApp/0.1 (Start Right Tutoring, LLC; logistics)',
        },
        timeout: 25_000,
      },
    );

    const hits: PlacesHit[] = [];
    for (const el of response.data.elements ?? []) {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat == null || lon == null || !el.tags?.name) continue;

      const coordinates: GeoPoint = { latitude: lat, longitude: lon };
      const kind = el.tags.amenity ?? el.tags.tourism ?? 'establishment';
      const cuisine = el.tags.cuisine?.replace(/_/g, ' ') ?? kind;
      const vicinity = [el.tags['addr:housenumber'], el.tags['addr:street'], el.tags['addr:city']]
        .filter(Boolean)
        .join(' ');

      const hit: PlacesHit = {
        id: `osm-${el.id}`,
        name: el.tags.name,
        coordinates,
        distanceMiles: roundMiles(haversineMiles(params.origin, coordinates)),
        rating: 4.0,
        types: [kind, cuisine],
        placeId: String(el.id),
        openLate: el.tags.opening_hours?.toLowerCase().includes('24') ?? false,
      };
      if (vicinity) hit.vicinity = vicinity;
      hits.push(hit);
    }

    return hits.sort((a, b) => a.distanceMiles - b.distanceMiles);
  } catch {
    return [];
  }
}

export function mapsBookingUrl(name: string, placeId?: string, coordinates?: GeoPoint): string {
  if (placeId && !/^\d+$/.test(placeId)) {
    return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`;
  }
  if (coordinates) {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
}

export function airbnbSearchUrl(name: string, coordinates?: GeoPoint): string {
  const query = coordinates
    ? `${name} near ${coordinates.latitude},${coordinates.longitude}`
    : name;
  return `https://www.airbnb.com/s/homes?query=${encodeURIComponent(query)}`;
}

const HOTEL_BRAND_BOOKING: Array<{ match: RegExp; url: (name: string) => string }> = [
  {
    match:
      /\b(hilton|homewood|hampton|embassy suites|doubletree|hilton garden|tru by hilton|canopy)\b/i,
    url: (name) => `https://www.hilton.com/en/search/?query=${encodeURIComponent(name)}`,
  },
  {
    match:
      /\b(marriott|courtyard|residence inn|springhill|fairfield|westin|sheraton|renaissance|ritz-carlton|aloft|moxy)\b/i,
    url: (name) =>
      `https://www.marriott.com/search/default.mi?searchType=InCity&destinationAddress.destination=${encodeURIComponent(name)}`,
  },
  {
    match: /\b(hyatt|andaz|unbound|caption by hyatt)\b/i,
    url: (name) => `https://www.hyatt.com/explore-hotels?q=${encodeURIComponent(name)}`,
  },
  {
    match:
      /\b(ihg|holiday inn|crowne plaza|staybridge|candlewood|intercontinental|kimpton|avid)\b/i,
    url: (name) => `https://www.ihg.com/hotels/us/en/reservation?qDest=${encodeURIComponent(name)}`,
  },
  {
    match: /\b(wyndham|days inn|ramada|super 8|la quinta|wingate|trademark)\b/i,
    url: (name) => `https://www.wyndhamhotels.com/search?query=${encodeURIComponent(name)}`,
  },
  {
    match: /\b(choice|comfort inn|quality inn|sleep inn|cambria|clarion|econo lodge)\b/i,
    url: (name) => `https://www.choicehotels.com/search?query=${encodeURIComponent(name)}`,
  },
  {
    match: /\b(best western)\b/i,
    url: (name) =>
      `https://www.bestwestern.com/en_US/book/hotel-search.html?ss=${encodeURIComponent(name)}`,
  },
];

/** Official chain booking page when the hotel name matches a known brand. */
export function brandHotelBookingUrl(name: string): string | null {
  for (const brand of HOTEL_BRAND_BOOKING) {
    if (brand.match.test(name)) return brand.url(name);
  }
  return null;
}

/** Hotel website — brand booking page, never Google Maps. */
export function hotelBookingUrl(name: string, _coordinates?: GeoPoint): string {
  return (
    brandHotelBookingUrl(name) ??
    `https://www.google.com/search?q=${encodeURIComponent(`${name} official hotel website`)}`
  );
}

export function isGoogleMapsUrl(url: string): boolean {
  return /google\.(com|[a-z.]+)\/(maps|travel)/i.test(url);
}

/** Place Details `website` field — the property's own site when Google has it. */
export async function fetchPlaceWebsite(placeId: string): Promise<string | null> {
  const key = APP_CONFIG.googlePlacesApiKey;
  if (!key || /^\d+$/.test(placeId)) return null;
  try {
    const response = await axios.get<{
      status: string;
      result?: { website?: string };
    }>('https://maps.googleapis.com/maps/api/place/details/json', {
      params: { place_id: placeId, fields: 'website', key },
      timeout: 10_000,
    });
    if (response.data.status !== 'OK') return null;
    const site = response.data.result?.website?.trim();
    return site || null;
  } catch {
    return null;
  }
}
