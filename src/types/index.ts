export type { ApiErrorEnvelope, ApiSuccessEnvelope, PaginatedMeta, PaginatedResponse } from './api';

export type UserRole = 'nurse' | 'physician' | 'admin' | 'hr';

export type VaultPermission = 'vault:read' | 'vault:write' | 'vault:delete' | 'vault:export';

export type SubscriptionPlanId = 'monthly' | 'semiannual' | 'annual';

export type SubscriptionStatus = 'none' | 'active' | 'canceled';

export interface PaymentMethodSummary {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  credentialsVerified: boolean;
  permissions: VaultPermission[];
  phone?: string;
  avatarUri?: string | null;
  subscriptionPlanId?: SubscriptionPlanId | null;
  subscriptionStatus?: SubscriptionStatus;
  paymentMethod?: PaymentMethodSummary | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface PhysicalAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type WorkOrderSource = 'pdf' | 'email';

export type WorkOrderStatus = 'pending' | 'parsed' | 'failed';

export interface WorkOrder {
  id: string;
  source: WorkOrderSource;
  facilityName: string;
  facilityAddress: PhysicalAddress;
  contractStartDate: string;
  contractEndDate: string;
  parsedAt: string;
  status: WorkOrderStatus;
  rawContentRef?: string;
}

export interface ParsedWorkOrderFields {
  facilityName: string;
  facilityAddress: PhysicalAddress;
  contractStartDate: string;
  contractEndDate: string;
}

export interface BlsOshaRating {
  facilityId: string;
  facilityName: string;
  oshaComplianceScore: number;
  source: 'BLS';
  retrievedAt: string;
}

export interface NibrsCrimeIndex {
  areaCode: string;
  jurisdiction: string;
  crimeIndex: number;
  source: 'NIBRS';
  retrievedAt: string;
}

export interface NurseVerifiedRating {
  averageScore: number;
  reviewCount: number;
  lastSubmittedAt: string;
  verifiedByRole: UserRole[];
}

export interface SafetyRating {
  facilityId: string;
  facilityName: string;
  osha: BlsOshaRating;
  residential: NibrsCrimeIndex;
  nurseVerified: NurseVerifiedRating;
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  lastUpdated: string;
}

export type CredentialType = 'STATE_LICENSE' | 'BLS' | 'ACLS' | 'TB_TEST';

export type CredentialStatus = 'valid' | 'expiring' | 'expired';

export interface SecureCredentialPayload {
  id: string;
  type: CredentialType;
  label: string;
  encryptedPayloadRef: string;
  issuedAt: string;
  expiresAt: string;
  status: CredentialStatus;
  ownerId: string;
  allowedRoles: UserRole[];
}

export interface CredentialLocker {
  userId: string;
  credentials: SecureCredentialPayload[];
  lastSyncedAt: string;
}

export type LodgingProvider = 'hotel' | 'airbnb';

export type LodgingStipendVariance = 'under' | 'at' | 'over';

export interface LodgingOption {
  id: string;
  name: string;
  provider: LodgingProvider;
  nightlyRate: number;
  stipendVariance: LodgingStipendVariance;
  varianceAmount: number;
}

export type LodgingOptionInput = Omit<LodgingOption, 'stipendVariance' | 'varianceAmount'>;

export interface StipendCalculationInput {
  contractGrossPay: number;
  taxHomeAddress: PhysicalAddress;
  dailyHousingStipendRate: number;
  highlightTaxDeductibility: boolean;
  lodgingOptions: LodgingOptionInput[];
}

export interface StipendCalculation extends StipendCalculationInput {
  filteredLodgingOptions: LodgingOption[];
  estimatedTakeHome: number;
  subscriptionDeductibleNote: string | null;
}

export type BookingWorkflowStep = 'housing' | 'flights' | 'seats' | 'dining' | 'ground' | 'review';

export type TripMode = 'planning' | 'travel';

export type RentalPhotoKind = 'before' | 'after' | 'fuel' | 'insurance' | 'other';

export interface RentalLogEntry {
  id: string;
  recordedAt: string;
  odometerMiles: number | null;
  fuelLevel: string | null;
  notes: string | null;
  photoKind: RentalPhotoKind;
  photoUri: string | null;
}

export interface RentalLog {
  startMileage: number | null;
  endMileage: number | null;
  insuranceOnFile: boolean;
  insurancePhotoUri: string | null;
  entries: RentalLogEntry[];
}

export interface RideShareLogEntry {
  id: string;
  recordedAt: string;
  screenshotUri: string;
  notes: string | null;
}

export type TransitProvider = 'uber' | 'lyft';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** City or facility anchor used when a hospital is optional. */
export interface TripDestination {
  id: string;
  label: string;
  city: string;
  state: string;
  airportCode: string;
  coordinates: GeoPoint;
  source: 'facility' | 'city';
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  state: string;
  airportCode: string;
  address: PhysicalAddress;
  coordinates: GeoPoint;
  safety: SafetyRating;
}

/** Opaque area preference from backend safety ranking — never exposes raw crime indices. */
export type LodgingSafetyPreference = 'preferred' | 'standard' | 'caution';

export interface LodgingSafetyContext {
  areaCrimeIndex: number;
  preference: LodgingSafetyPreference;
  distanceMiles: number;
  guestRating: number;
  compositeScore: number;
  weights: { crime: number; proximity: number; rating: number };
  summary: string;
}

export interface LodgingListing {
  id: string;
  hospitalId: string;
  name: string;
  provider: LodgingProvider;
  nightlyRate: number;
  distanceMiles: number;
  guestRating: number;
  safetyPreference: LodgingSafetyPreference;
  coordinates?: GeoPoint;
  placeId?: string;
  vicinity?: string;
  /** Deep link (Airbnb app / Maps). Booking completes externally. */
  bookingAppUrl?: string;
  /** Hotel site, Airbnb web, or Maps — booking completes externally. */
  bookingWebUrl?: string;
  /** Rank reasoning — UI shows this only for Pro subscribers. */
  safetyContext?: LodgingSafetyContext;
}

export interface LodgingSearchParams {
  hospitalId: string;
  coordinates: GeoPoint;
  radiusMiles?: number;
}

export interface FlightSearchParams {
  hospitalId: string;
  originAirport: string;
  destinationAirport: string;
  /** Inclusive ISO date (YYYY-MM-DD) — typically contract start. */
  departureDateStart: string;
  /** Inclusive ISO date (YYYY-MM-DD) — search window end (contract start + buffer or end). */
  departureDateEnd: string;
}

export interface FlightOption {
  id: string;
  hospitalId: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  nonstop: boolean;
  aircraft: string;
  cabinLayout: AirlineCabinLayout;
  /** Deep link into the airline app (may fall back to web). */
  bookingAppUrl: string;
  /** Browser booking URL for the airline. */
  bookingWebUrl: string;
}

export interface HospitalSearchParams {
  query: string;
  state?: string;
  city?: string;
  limit?: number;
}

export interface BoardingPassExtract {
  airline: string | null;
  flightNumber: string | null;
  seatNumber: string | null;
  departureAirport: string | null;
  arrivalAirport: string | null;
  departureDate: string | null;
  passengerName: string | null;
  rawText: string;
  confidence: number;
  sourceImageUri?: string;
}

export type SeatClass = 'first' | 'premium' | 'economy';
export type SeatStatus = 'available' | 'occupied' | 'selected';

export interface SeatCell {
  id: string;
  row: number;
  column: string;
  seatClass: SeatClass;
  status: SeatStatus;
  price: number;
  /** 0–1 depth for pseudo-3D rendering (nose = 0, tail = 1) */
  depth: number;
}

export type AirlineCabinLayout = 'narrow-3-3' | 'southwest-open';

export interface SeatSelection {
  flightId: string;
  seatId: string;
  row: number;
  column: string;
  seatClass: SeatClass;
  price: number;
  label: string;
}

export interface CarRentalOption {
  id: string;
  hospitalId: string;
  provider: 'turo' | 'enterprise' | 'hertz';
  label: string;
  vehicleClass: string;
  dailyRate: number;
  weeklyRate: number;
  pickupLocation: string;
  includesInsurance: boolean;
  appUrl: string;
  webUrl: string;
}

export interface ItinerarySummary {
  facilityName: string;
  contractDates: string | null;
  lodging: { name: string; nightlyRate: number; totalNights: number } | null;
  flight: {
    airline: string;
    flightNumber: string;
    route: string;
    price: number;
    seat: SeatSelection | null;
  } | null;
  dining: { count: number; names: string[] };
  entertainment: { count: number; names: string[] };
  groundTransit: {
    rideTransport: { provider: string; label: string; estimatedCost: number } | null;
    carRental: { provider: string; label: string; weeklyRate: number } | null;
  };
  estimatedTotal: number;
  completionPercent: number;
  isReadyToConfirm: boolean;
}

export type CityPlaceCategory = 'dining' | 'gym' | 'entertainment' | 'grocery';

export interface Restaurant {
  id: string;
  hospitalId: string;
  name: string;
  /** Display subcategory (cuisine, “Yoga”, “Museum”, etc.). */
  cuisine: string;
  category: CityPlaceCategory;
  distanceMiles: number;
  priceLevel: 1 | 2 | 3;
  rating: number;
  openLate: boolean;
  placeId?: string;
  vicinity?: string;
  bookingWebUrl?: string;
}

/** Alias used by City Finder for non-dining venues as well. */
export type CityPlace = Restaurant;

export interface TransitOption {
  id: string;
  provider: TransitProvider;
  label: string;
  etaMinutes: number;
  estimatedCost: number;
  appUrl: string;
  webUrl: string;
}
