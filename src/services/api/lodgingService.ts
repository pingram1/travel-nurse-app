import axios from 'axios';

import { apiGet } from '@/services/api/client';
import {
  airbnbSearchUrl,
  fetchPlaceWebsite,
  hotelBookingUrl,
  isGoogleMapsUrl,
  searchGooglePlacesNearby,
  searchOverpassNearby,
  type PlacesHit,
} from '@/services/api/placesClient';
import type { GeoPoint, LodgingListing, LodgingProvider, LodgingSearchParams } from '@/types';
import { haversineMiles, roundMiles } from '@/utils/geo';
import {
  deriveAreaCrimeIndex,
  explainLodgingSafety,
  LODGING_RADIUS_MILES,
  safetyPreferenceFromIndex,
  sortByStealthSafety,
} from '@/utils/safetyRanking';

interface InternalLodgingCandidate extends LodgingListing {
  areaCrimeIndex: number;
}

interface NominatimLodgingHit {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  namedetails?: { name?: string };
}

function estimateNightlyRate(
  provider: LodgingProvider,
  rating: number,
  priceLevel?: number,
): number {
  const base = provider === 'hotel' ? 95 : 82;
  const tier = (priceLevel ?? Math.round(rating)) * 12;
  return Math.round(base + tier + (rating - 3.5) * 18);
}

function inferProvider(types: string[] | undefined, name: string): LodgingProvider {
  const blob = `${(types ?? []).join(' ')} ${name}`.toLowerCase();
  if (
    blob.includes('apartment') ||
    blob.includes('airbnb') ||
    blob.includes('guest_house') ||
    blob.includes('hostel')
  ) {
    return 'airbnb';
  }
  if (
    blob.includes('lodging') ||
    blob.includes('hotel') ||
    blob.includes('inn') ||
    blob.includes('suites')
  ) {
    return 'hotel';
  }
  return 'hotel';
}

function bookingLinks(
  provider: LodgingProvider,
  name: string,
  coordinates: GeoPoint,
): Pick<LodgingListing, 'bookingAppUrl' | 'bookingWebUrl'> {
  if (provider === 'airbnb') {
    return {
      bookingAppUrl: 'airbnb://',
      bookingWebUrl: airbnbSearchUrl(name, coordinates),
    };
  }
  return {
    bookingWebUrl: hotelBookingUrl(name, coordinates),
  };
}

/** Prefer the hotel's own website from Place Details; never Google Maps. */
async function attachOfficialWebsites(
  candidates: InternalLodgingCandidate[],
): Promise<InternalLodgingCandidate[]> {
  return Promise.all(
    candidates.map(async (candidate) => {
      if (candidate.provider === 'airbnb') return candidate;
      if (!candidate.placeId) return candidate;
      const site = await fetchPlaceWebsite(candidate.placeId);
      if (site && !isGoogleMapsUrl(site)) {
        return { ...candidate, bookingWebUrl: site };
      }
      return candidate;
    }),
  );
}

function fromPlacesHit(hit: PlacesHit, hospitalId: string): InternalLodgingCandidate {
  const provider = inferProvider(hit.types, hit.name);
  const areaCrimeIndex = deriveAreaCrimeIndex(hit.coordinates.latitude, hit.coordinates.longitude);
  const links = bookingLinks(provider, hit.name, hit.coordinates);
  const candidate: InternalLodgingCandidate = {
    id: hit.id,
    hospitalId,
    name: hit.name,
    provider,
    nightlyRate: estimateNightlyRate(provider, hit.rating, hit.priceLevel),
    distanceMiles: hit.distanceMiles,
    guestRating: Math.round(hit.rating * 10) / 10,
    safetyPreference: safetyPreferenceFromIndex(areaCrimeIndex),
    coordinates: hit.coordinates,
    ...links,
    areaCrimeIndex,
    safetyContext: explainLodgingSafety({
      areaCrimeIndex,
      distanceMiles: hit.distanceMiles,
      guestRating: Math.round(hit.rating * 10) / 10,
    }),
  };
  if (hit.placeId) candidate.placeId = hit.placeId;
  if (hit.vicinity) candidate.vicinity = hit.vicinity;
  return candidate;
}

function toPublicListing(candidate: InternalLodgingCandidate): LodgingListing {
  const { areaCrimeIndex: _crime, ...listing } = candidate;
  void _crime;
  return listing;
}

function rankAndFilter(
  candidates: InternalLodgingCandidate[],
  radiusMiles: number,
): LodgingListing[] {
  const withinRadius = candidates.filter((c) => c.distanceMiles <= radiusMiles);
  const ranked = sortByStealthSafety(withinRadius);
  return ranked.map(toPublicListing);
}

async function searchNominatimLodging(
  origin: GeoPoint,
  hospitalId: string,
  radiusMiles: number,
): Promise<InternalLodgingCandidate[]> {
  const delta = radiusMiles / 69;
  const viewbox = [
    origin.longitude - delta,
    origin.latitude + delta,
    origin.longitude + delta,
    origin.latitude - delta,
  ].join(',');

  try {
    const response = await axios.get<NominatimLodgingHit[]>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: 'hotel',
          format: 'json',
          limit: 20,
          viewbox,
          bounded: 1,
          addressdetails: 0,
        },
        headers: {
          'User-Agent': 'TravelNurseApp/0.1 (Start Right Tutoring, LLC; logistics)',
          Accept: 'application/json',
        },
        timeout: 12_000,
      },
    );

    return response.data.map((hit) => {
      const coords: GeoPoint = {
        latitude: Number(hit.lat),
        longitude: Number(hit.lon),
      };
      const distanceMiles = roundMiles(haversineMiles(origin, coords));
      const name =
        hit.namedetails?.name ??
        hit.display_name.split(',').slice(0, 2).join(',').trim() ??
        'Lodging';
      const provider: LodgingProvider = hit.type === 'apartments' ? 'airbnb' : 'hotel';
      const guestRating = 3.8 + (Math.abs(hit.place_id) % 12) / 10;
      const areaCrimeIndex = deriveAreaCrimeIndex(coords.latitude, coords.longitude);
      const links = bookingLinks(provider, name, coords);

      return {
        id: `osm-${hit.place_id}`,
        hospitalId,
        name,
        provider,
        nightlyRate: estimateNightlyRate(provider, guestRating),
        distanceMiles,
        guestRating: Math.round(guestRating * 10) / 10,
        safetyPreference: safetyPreferenceFromIndex(areaCrimeIndex),
        coordinates: coords,
        placeId: String(hit.place_id),
        vicinity: hit.display_name.split(',').slice(0, 3).join(',').trim(),
        ...links,
        areaCrimeIndex,
        safetyContext: explainLodgingSafety({
          areaCrimeIndex,
          distanceMiles,
          guestRating: Math.round(guestRating * 10) / 10,
        }),
      };
    });
  } catch {
    return [];
  }
}

/**
 * Pull real lodging (hotels / short-term rentals) within radius of a hospital.
 * Google Places → Nominatim → Overpass. Never synthesizes mock venues.
 */
export async function searchLodgingNearby(params: LodgingSearchParams): Promise<LodgingListing[]> {
  const radiusMiles = params.radiusMiles ?? LODGING_RADIUS_MILES;

  try {
    const envelope = await Promise.race([
      apiGet<LodgingListing[]>('/lodging/nearby', {
        params: {
          hospitalId: params.hospitalId,
          lat: params.coordinates.latitude,
          lng: params.coordinates.longitude,
          radiusMiles,
        },
        timeout: 4_000,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('lodging search timeout')), 4_500);
      }),
    ]);
    if (envelope.data?.length) {
      return envelope.data
        .filter((l) => l.distanceMiles <= radiusMiles)
        .map((listing) => {
          if (listing.bookingWebUrl) return listing;
          const coords = listing.coordinates ?? params.coordinates;
          const links = bookingLinks(listing.provider, listing.name, coords);
          return { ...listing, ...links };
        });
    }
  } catch {
    // Fall through to Places / Nominatim / Overpass.
  }

  let candidates: InternalLodgingCandidate[] = (
    await searchGooglePlacesNearby({
      origin: params.coordinates,
      radiusMiles,
      type: 'lodging',
    })
  ).map((hit) => fromPlacesHit(hit, params.hospitalId));

  if (candidates.length === 0) {
    candidates = await searchNominatimLodging(params.coordinates, params.hospitalId, radiusMiles);
  }

  if (candidates.length === 0) {
    candidates = (
      await searchOverpassNearby({
        origin: params.coordinates,
        radiusMiles,
        mode: 'lodging',
      })
    ).map((hit) => fromPlacesHit(hit, params.hospitalId));
  }

  candidates = await attachOfficialWebsites(candidates);
  return rankAndFilter(candidates, radiusMiles);
}
