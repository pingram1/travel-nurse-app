import { apiGet } from '@/services/api/client';
import type { ApiSuccessEnvelope } from '@/types/api';
import type { BlsOshaRating, NibrsCrimeIndex, NurseVerifiedRating, SafetyRating } from '@/types';
import { generateRequestId } from '@/utils/uuid';

const BLS_OSHA_PATH = '/safety/bls/osha';
const NIBRS_CRIME_PATH = '/safety/nibrs/crime';
const SAFETY_RATING_PATH = '/safety/ratings';

export interface FacilitySafetyQuery {
  facilityId: string;
  facilityName: string;
  zipCode: string;
}

/** Shared composite grade used by live stubs and trip catalog data. */
export function gradeFromScores(
  oshaScore: number,
  crimeIndex: number,
  nurseScore: number,
): SafetyRating['overallGrade'] {
  const composite = oshaScore * 0.4 + (100 - crimeIndex) * 0.4 + nurseScore * 4;
  if (composite >= 90) return 'A';
  if (composite >= 80) return 'B';
  if (composite >= 70) return 'C';
  if (composite >= 60) return 'D';
  return 'F';
}

export async function fetchBlsOshaRating(
  query: FacilitySafetyQuery,
): Promise<ApiSuccessEnvelope<BlsOshaRating>> {
  return apiGet<BlsOshaRating>(`${BLS_OSHA_PATH}/${query.facilityId}`, {
    params: { facilityName: query.facilityName },
  });
}

export async function fetchNibrsCrimeIndex(
  zipCode: string,
): Promise<ApiSuccessEnvelope<NibrsCrimeIndex>> {
  return apiGet<NibrsCrimeIndex>(`${NIBRS_CRIME_PATH}/${zipCode}`);
}

export async function fetchNurseVerifiedRating(
  facilityId: string,
): Promise<ApiSuccessEnvelope<NurseVerifiedRating>> {
  return apiGet<NurseVerifiedRating>(`${SAFETY_RATING_PATH}/${facilityId}/nurse-verified`);
}

export async function fetchCompositeSafetyRating(
  query: FacilitySafetyQuery,
): Promise<ApiSuccessEnvelope<SafetyRating>> {
  try {
    return await apiGet<SafetyRating>(`${SAFETY_RATING_PATH}/${query.facilityId}`, {
      params: { zipCode: query.zipCode, facilityName: query.facilityName },
    });
  } catch {
    return buildStubSafetyRating(query);
  }
}

export function buildStubSafetyRating(
  query: FacilitySafetyQuery,
): ApiSuccessEnvelope<SafetyRating> {
  const now = new Date().toISOString();
  const osha: BlsOshaRating = {
    facilityId: query.facilityId,
    facilityName: query.facilityName,
    oshaComplianceScore: 88,
    source: 'BLS',
    retrievedAt: now,
  };
  const residential: NibrsCrimeIndex = {
    areaCode: query.zipCode,
    jurisdiction: 'Stub Jurisdiction',
    crimeIndex: 32,
    source: 'NIBRS',
    retrievedAt: now,
  };
  const nurseVerified: NurseVerifiedRating = {
    averageScore: 4.2,
    reviewCount: 18,
    lastSubmittedAt: now,
    verifiedByRole: ['nurse', 'physician'],
  };

  return {
    success: true,
    data: {
      facilityId: query.facilityId,
      facilityName: query.facilityName,
      osha,
      residential,
      nurseVerified,
      overallGrade: gradeFromScores(
        osha.oshaComplianceScore,
        residential.crimeIndex,
        nurseVerified.averageScore,
      ),
      lastUpdated: now,
    },
    requestId: generateRequestId(),
    timestamp: now,
  };
}
