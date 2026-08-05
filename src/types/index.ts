export type { ApiErrorEnvelope, ApiSuccessEnvelope, PaginatedMeta, PaginatedResponse } from './api';

export type UserRole = 'nurse' | 'physician' | 'admin' | 'hr';

export type VaultPermission = 'vault:read' | 'vault:write' | 'vault:delete' | 'vault:export';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  credentialsVerified: boolean;
  permissions: VaultPermission[];
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

export type BookingWorkflowStep =
  'housing' | 'flights' | 'seats' | 'dining' | 'transit' | 'cars' | 'review';

export type TransitProvider = 'uber' | 'lyft' | 'turo';

export interface GeoPoint {
  latitude: number;
  longitude: number;
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

export interface LodgingListing {
  id: string;
  hospitalId: string;
  name: string;
  provider: LodgingProvider;
  nightlyRate: number;
  distanceMiles: number;
  areaCrimeIndex: number;
  guestRating: number;
}

export interface FlightOption {
  id: string;
  hospitalId: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  nonstop: boolean;
  aircraft: string;
  cabinLayout: AirlineCabinLayout;
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
  groundTransit: { provider: string; label: string; estimatedCost: number } | null;
  carRental: { provider: string; label: string; weeklyRate: number } | null;
  estimatedTotal: number;
  completionPercent: number;
  isReadyToConfirm: boolean;
}

export interface Restaurant {
  id: string;
  hospitalId: string;
  name: string;
  cuisine: string;
  distanceMiles: number;
  priceLevel: 1 | 2 | 3;
  rating: number;
  openLate: boolean;
}

export interface TransitOption {
  id: string;
  provider: TransitProvider;
  label: string;
  etaMinutes: number;
  estimatedCost: number;
  appUrl: string;
  webUrl: string;
}

export interface BookingWorkflowState {
  housingFirstEnabled: boolean;
  workflowSteps: BookingWorkflowStep[];
  activeStep: BookingWorkflowStep;
  workOrder: WorkOrder | null;
  selectedLodgingId: string | null;
}

/** @deprecated Use SafetyRating */
export interface SafetyScore {
  oshaRating: number;
  crimeIndex: number;
  overallGrade: SafetyRating['overallGrade'];
  lastUpdated: string;
}

/** @deprecated Use SecureCredentialPayload */
export interface CredentialDocument {
  id: string;
  type: 'BLS' | 'ACLS' | 'RN_LICENSE' | 'OTHER';
  label: string;
  expiresAt: string;
  status: CredentialStatus;
}

/** @deprecated Use StipendCalculation */
export interface StipendBreakdown {
  grossPay: number;
  housingStipend: number;
  mealStipend: number;
  travelReimbursement: number;
  deductions: number;
  takeHomePay: number;
}
