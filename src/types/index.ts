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

export type BookingWorkflowStep = 'housing' | 'flights' | 'transit' | 'review';

export type TransitProvider = 'uber' | 'lyft' | 'turo';

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
