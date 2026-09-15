import type { CarRentalOption, GeoPoint, LodgingListing, TransitOption } from '@/types';

/**
 * Location-derived ancillary catalogs (cars, transit).
 * Hospitals, lodging, dining, and flights are loaded via dedicated API services.
 */

export interface CarRentalAnchor {
  id: string;
  airportCode: string;
}

/** Peer-to-peer + agency rentals near the destination arrival airport. */
export function buildCarRentalsForHospital(anchor: CarRentalAnchor): CarRentalOption[] {
  const airport = anchor.airportCode;
  const airportPickup = `${airport} Airport`;
  const rccPickup = `${airport} Rental Car Center`;

  const turoVehicles: Array<{
    slug: string;
    label: string;
    vehicleClass: string;
    dailyRate: number;
    weeklyRate: number;
  }> = [
    {
      slug: 'sedan',
      label: 'Turo Sedan',
      vehicleClass: 'Sedan',
      dailyRate: 42,
      weeklyRate: 245,
    },
    {
      slug: 'compact-suv',
      label: 'Turo Compact SUV',
      vehicleClass: 'SUV',
      dailyRate: 48,
      weeklyRate: 266,
    },
    {
      slug: 'full-suv',
      label: 'Turo Full-Size SUV',
      vehicleClass: 'SUV',
      dailyRate: 62,
      weeklyRate: 335,
    },
    {
      slug: 'truck',
      label: 'Turo Pickup Truck',
      vehicleClass: 'Truck',
      dailyRate: 58,
      weeklyRate: 318,
    },
    {
      slug: 'minivan',
      label: 'Turo Minivan',
      vehicleClass: 'Minivan',
      dailyRate: 55,
      weeklyRate: 299,
    },
  ];

  const turoOptions: CarRentalOption[] = turoVehicles.map((vehicle) => ({
    id: `car-${anchor.id}-turo-${vehicle.slug}`,
    hospitalId: anchor.id,
    provider: 'turo',
    label: vehicle.label,
    vehicleClass: vehicle.vehicleClass,
    dailyRate: vehicle.dailyRate,
    weeklyRate: vehicle.weeklyRate,
    pickupLocation: airportPickup,
    includesInsurance: false,
    appUrl: 'turo://',
    webUrl: `https://turo.com/us/en/search?location=${encodeURIComponent(airportPickup)}&makeModel=${encodeURIComponent(vehicle.vehicleClass)}`,
  }));

  return [
    ...turoOptions,
    {
      id: `car-${anchor.id}-enterprise`,
      hospitalId: anchor.id,
      provider: 'enterprise',
      label: 'Enterprise Midsize',
      vehicleClass: 'Midsize',
      dailyRate: 52,
      weeklyRate: 289,
      pickupLocation: rccPickup,
      includesInsurance: true,
      appUrl: 'enterprise://',
      webUrl: `https://www.enterprise.com/en/car-rental-locations/us.html?search=${airport}`,
    },
    {
      id: `car-${anchor.id}-hertz`,
      hospitalId: anchor.id,
      provider: 'hertz',
      label: 'Hertz Full-Size',
      vehicleClass: 'Full-Size',
      dailyRate: 58,
      weeklyRate: 312,
      pickupLocation: rccPickup,
      includesInsurance: true,
      appUrl: 'hertz://',
      webUrl: `https://www.hertz.com/rentacar/reservation/?airportCode=${airport}`,
    },
  ];
}

/** Ride-share only — Turo belongs under car rental. */
export function buildTransitOptions(
  lodging: LodgingListing | null,
  arrivalTime: string | null,
  hospitalCoordinates?: GeoPoint | null,
): TransitOption[] {
  const distance = lodging?.distanceMiles ?? 8;
  const airportToLodgingMiles = 12 + distance;
  const surge = arrivalTime && new Date(arrivalTime).getUTCHours() >= 17 ? 1.25 : 1;
  void hospitalCoordinates;

  return [
    {
      id: 'transit-uber',
      provider: 'uber',
      label: 'UberX — airport pickup',
      etaMinutes: 6,
      estimatedCost: Math.round(airportToLodgingMiles * 2.1 * surge),
      appUrl: 'uber://?action=setPickup&pickup=my_location',
      webUrl: 'https://m.uber.com/looking',
    },
    {
      id: 'transit-lyft',
      provider: 'lyft',
      label: 'Lyft Standard — airport pickup',
      etaMinutes: 8,
      estimatedCost: Math.round(airportToLodgingMiles * 1.95 * surge),
      appUrl: 'lyft://ridetype?id=lyft',
      webUrl: 'https://www.lyft.com/rider',
    },
  ];
}
