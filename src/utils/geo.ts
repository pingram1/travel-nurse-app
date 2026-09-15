import type { GeoPoint } from '@/types';

const EARTH_RADIUS_MILES = 3958.8;

/** Great-circle distance in miles between two WGS84 points. */
export function haversineMiles(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Offset a point by approximate miles (small-distance planar approx). */
export function offsetMiles(origin: GeoPoint, milesNorth: number, milesEast: number): GeoPoint {
  const latPerMile = 1 / 69.0;
  const lonPerMile = 1 / (69.0 * Math.cos((origin.latitude * Math.PI) / 180));
  return {
    latitude: origin.latitude + milesNorth * latPerMile,
    longitude: origin.longitude + milesEast * lonPerMile,
  };
}

export function roundMiles(miles: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(miles * factor) / factor;
}
