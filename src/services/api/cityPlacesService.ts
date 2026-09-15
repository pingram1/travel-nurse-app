import { apiGet } from '@/services/api/client';
import {
  mapsBookingUrl,
  searchGooglePlacesNearby,
  searchOverpassNearby,
  type PlacesHit,
} from '@/services/api/placesClient';
import type { CityPlace, CityPlaceCategory, GeoPoint } from '@/types';

export interface CityPlacesSearchParams {
  hospitalId: string;
  coordinates: GeoPoint;
  category: CityPlaceCategory;
  radiusMiles?: number;
}

const LODGING_RE = /\b(lodging|hotel|motel|inn|suites|resort|hostel|airbnb|guest.?house)\b/i;
const GYM_NAME_RE =
  /\b(gym|fitness|yoga|pilates|crossfit|la fitness|lifetime|eos fitness|24.?hour|planet fitness|orangetheory|f45|pure barre|soulcycle)\b/i;

function priceLevel(level?: number): 1 | 2 | 3 {
  if (!level || level <= 1) return 1;
  if (level === 2) return 2;
  return 3;
}

function typeBlob(types: string[], name: string): string {
  return `${types.join(' ')} ${name}`.toLowerCase();
}

function isLodging(types: string[], name: string): boolean {
  return LODGING_RE.test(typeBlob(types, name)) || types.includes('lodging');
}

function isHealthCare(types: string[], name: string): boolean {
  // Google often tags gyms with a broad "health" type — only exclude clinical care.
  if (
    types.some((t) => ['hospital', 'doctor', 'dentist', 'pharmacy', 'physiotherapist'].includes(t))
  ) {
    return true;
  }
  return /\b(hospital|urgent.?care|medical.?clinic)\b/i.test(name);
}

function isGymPlace(types: string[], name: string): boolean {
  if (isLodging(types, name)) return false;
  if (isHealthCare(types, name) && !types.includes('gym') && !GYM_NAME_RE.test(name)) {
    return false;
  }
  return types.includes('gym') || GYM_NAME_RE.test(name);
}

function isDiningPlace(types: string[], name: string): boolean {
  if (isLodging(types, name) || isHealthCare(types, name)) return false;
  if (isGymPlace(types, name) && !types.some((t) => t.includes('restaurant') || t === 'cafe')) {
    return false;
  }
  return (
    types.includes('restaurant') ||
    types.includes('cafe') ||
    types.includes('meal_takeaway') ||
    types.includes('bakery') ||
    types.includes('bar') ||
    types.includes('food')
  );
}

const ENTERTAINMENT_TYPES = new Set([
  'tourist_attraction',
  'museum',
  'aquarium',
  'art_gallery',
  'amusement_park',
  'movie_theater',
  'bowling_alley',
  'stadium',
  'zoo',
  'casino',
  'night_club',
  'park',
]);

function isGroceryPlace(types: string[], name: string): boolean {
  if (isLodging(types, name) || isHealthCare(types, name)) return false;
  return (
    types.includes('supermarket') ||
    types.includes('grocery_or_supermarket') ||
    types.includes('grocery') ||
    /\b(heb|h-e-b|kroger|trader joe|whole foods|aldi|walmart|target|sprouts|fiesta mart|food lion|publix)\b/i.test(
      name,
    )
  );
}

function isEntertainmentPlace(types: string[], name: string): boolean {
  if (isLodging(types, name) || isHealthCare(types, name) || isGymPlace(types, name)) {
    return false;
  }
  if (types.some((t) => ENTERTAINMENT_TYPES.has(t))) return true;
  return /\b(topgolf|theater|theatre|cinema|museum|aquarium|zoo|bowling|arcade|comedy|concert)\b/i.test(
    name,
  );
}

function subcategoryFor(category: CityPlaceCategory, types: string[], name: string): string {
  if (category === 'dining') {
    const skip = new Set([
      'point_of_interest',
      'establishment',
      'food',
      'restaurant',
      'meal_takeaway',
      'meal_delivery',
      'cafe',
      'bar',
      'store',
    ]);
    const hit = types.find((t) => !skip.has(t.toLowerCase()));
    if (!hit) return 'Restaurant';
    return hit.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  if (category === 'gym') {
    if (/yoga/i.test(name)) return 'Yoga';
    if (/pilates|barre/i.test(name)) return 'Pilates';
    if (/crossfit|f45|orangetheory/i.test(name)) return 'HIIT / CrossFit';
    return 'Gym / Fitness';
  }
  if (category === 'grocery') {
    if (/whole foods/i.test(name)) return 'Whole Foods';
    if (/\bheb|h-e-b\b/i.test(name)) return 'H-E-B';
    if (/trader joe/i.test(name)) return "Trader Joe's";
    return 'Grocery';
  }
  const known = types.find((t) => ENTERTAINMENT_TYPES.has(t));
  if (known) {
    return known.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return 'Entertainment';
}

function toCityPlace(hit: PlacesHit, hospitalId: string, category: CityPlaceCategory): CityPlace {
  const place: CityPlace = {
    id: `${category}-${hit.id}`,
    hospitalId,
    name: hit.name,
    cuisine: subcategoryFor(category, hit.types, hit.name),
    category,
    distanceMiles: hit.distanceMiles,
    priceLevel: priceLevel(hit.priceLevel),
    rating: Math.round(hit.rating * 10) / 10,
    openLate: Boolean(hit.openLate),
    bookingWebUrl: mapsBookingUrl(hit.name, hit.placeId, hit.coordinates),
  };
  if (hit.placeId) place.placeId = hit.placeId;
  if (hit.vicinity) place.vicinity = hit.vicinity;
  return place;
}

function dedupeByNameDistance(places: CityPlace[]): CityPlace[] {
  const seen = new Set<string>();
  const out: CityPlace[] = [];
  for (const place of places) {
    const key = `${place.name.toLowerCase()}|${place.vicinity ?? ''}|${place.distanceMiles}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(place);
  }
  return out;
}

async function searchGoogleCategory(
  origin: GeoPoint,
  radiusMiles: number,
  category: CityPlaceCategory,
): Promise<PlacesHit[]> {
  const radius = Math.min(radiusMiles, 30);

  if (category === 'dining') {
    const restaurants = await searchGooglePlacesNearby({
      origin,
      radiusMiles: radius,
      type: 'restaurant',
    });
    const cafes = await searchGooglePlacesNearby({
      origin,
      radiusMiles: radius,
      type: 'cafe',
    });
    return [...restaurants, ...cafes].filter((h) => isDiningPlace(h.types, h.name));
  }

  if (category === 'gym') {
    const gyms = await searchGooglePlacesNearby({
      origin,
      radiusMiles: radius,
      type: 'gym',
    });
    const fitness = await searchGooglePlacesNearby({
      origin,
      radiusMiles: radius,
      type: 'gym',
      keyword: 'fitness studio yoga pilates',
    });
    return [...gyms, ...fitness].filter((h) => isGymPlace(h.types, h.name));
  }

  if (category === 'grocery') {
    const markets = await searchGooglePlacesNearby({
      origin,
      radiusMiles: radius,
      type: 'supermarket',
    });
    const grocery = await searchGooglePlacesNearby({
      origin,
      radiusMiles: radius,
      type: 'grocery_or_supermarket',
    });
    const byId = new Map([...markets, ...grocery].map((h) => [h.id, h]));
    return [...byId.values()].filter((h) => isGroceryPlace(h.types, h.name));
  }

  const entertainmentQueries: Array<{ type: string; keyword?: string }> = [
    { type: 'tourist_attraction' },
    { type: 'museum' },
    { type: 'aquarium' },
    { type: 'movie_theater' },
    { type: 'amusement_park' },
    { type: 'bowling_alley' },
    { type: 'tourist_attraction', keyword: 'topgolf theater entertainment' },
  ];

  const batches = await Promise.all(
    entertainmentQueries.map((q) => {
      const request: Parameters<typeof searchGooglePlacesNearby>[0] = {
        origin,
        radiusMiles: radius,
        type: q.type,
      };
      if (q.keyword) request.keyword = q.keyword;
      return searchGooglePlacesNearby(request);
    }),
  );

  const merged = batches.flat();
  const byId = new Map(merged.map((h) => [h.id, h]));
  return [...byId.values()].filter((h) => isEntertainmentPlace(h.types, h.name));
}

/**
 * Live city places by category — Google Places when keyed, else OpenStreetMap.
 * Never returns lodging or core health facilities.
 */
export async function searchCityPlacesNearby(params: CityPlacesSearchParams): Promise<CityPlace[]> {
  const radiusMiles = params.radiusMiles ?? 50;

  try {
    const envelope = await Promise.race([
      apiGet<CityPlace[]>('/city-places/nearby', {
        params: {
          hospitalId: params.hospitalId,
          lat: params.coordinates.latitude,
          lng: params.coordinates.longitude,
          radiusMiles,
          category: params.category,
        },
        timeout: 4_000,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('city places timeout')), 4_500);
      }),
    ]);
    if (envelope.data?.length) {
      return envelope.data
        .filter((p) => p.category === params.category && p.distanceMiles <= radiusMiles)
        .sort((a, b) => a.distanceMiles - b.distanceMiles);
    }
  } catch {
    // Fall through to Places / Overpass.
  }

  let hits = await searchGoogleCategory(params.coordinates, radiusMiles, params.category);

  if (hits.length === 0) {
    hits = await searchOverpassNearby({
      origin: params.coordinates,
      radiusMiles: Math.min(radiusMiles, 25),
      mode: params.category,
    });
    hits = hits.filter((h) => {
      if (params.category === 'dining') return isDiningPlace(h.types, h.name);
      if (params.category === 'gym') return isGymPlace(h.types, h.name);
      if (params.category === 'grocery') return isGroceryPlace(h.types, h.name);
      return isEntertainmentPlace(h.types, h.name);
    });
  }

  return dedupeByNameDistance(
    hits
      .filter((h) => h.distanceMiles <= radiusMiles)
      .map((hit) => toCityPlace(hit, params.hospitalId, params.category))
      .sort((a, b) => a.distanceMiles - b.distanceMiles),
  );
}

/** Fetch dining + grocery + gym + entertainment catalogs for City Finder. */
export async function searchAllCityPlacesNearby(params: {
  hospitalId: string;
  coordinates: GeoPoint;
  radiusMiles?: number;
}): Promise<CityPlace[]> {
  const [dining, gym, entertainment, grocery] = await Promise.all([
    searchCityPlacesNearby({ ...params, category: 'dining' }),
    searchCityPlacesNearby({ ...params, category: 'gym' }),
    searchCityPlacesNearby({ ...params, category: 'entertainment' }),
    searchCityPlacesNearby({ ...params, category: 'grocery' }),
  ]);
  return [...dining, ...gym, ...entertainment, ...grocery].sort(
    (a, b) => a.distanceMiles - b.distanceMiles,
  );
}
