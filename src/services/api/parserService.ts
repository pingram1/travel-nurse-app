import { apiPost } from '@/services/api/client';
import type { ApiSuccessEnvelope } from '@/types/api';
import type { ParsedWorkOrderFields, WorkOrder, WorkOrderSource } from '@/types';
import { generateRequestId } from '@/utils/uuid';
import { parseWorkOrderContent, workOrderFieldsSchema } from '@/utils/validators';

const PARSE_PATH = '/work-orders/parse';

export interface ParseWorkOrderRequest {
  source: WorkOrderSource;
  content: string;
  filename?: string;
}

export interface ParseWorkOrderResponse {
  workOrder: WorkOrder;
  confidence: number;
}

export async function parseWorkOrderUpload(
  request: ParseWorkOrderRequest,
): Promise<ApiSuccessEnvelope<ParseWorkOrderResponse>> {
  try {
    return await apiPost<ParseWorkOrderResponse, ParseWorkOrderRequest>(PARSE_PATH, request);
  } catch {
    return buildStubParseResult(request);
  }
}

export function extractWorkOrderFields(content: string): ParsedWorkOrderFields | null {
  const parsed = parseWorkOrderContent(content);
  if (
    !parsed.facilityName ||
    !parsed.facilityAddress ||
    !parsed.contractStartDate ||
    !parsed.contractEndDate
  ) {
    return null;
  }

  const result = workOrderFieldsSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

function buildStubParseResult(
  request: ParseWorkOrderRequest,
): ApiSuccessEnvelope<ParseWorkOrderResponse> {
  const fields = extractWorkOrderFields(request.content);
  const now = new Date().toISOString();

  const workOrder: WorkOrder = fields
    ? {
        id: generateRequestId(),
        source: request.source,
        facilityName: fields.facilityName,
        facilityAddress: fields.facilityAddress,
        contractStartDate: fields.contractStartDate,
        contractEndDate: fields.contractEndDate,
        parsedAt: now,
        status: 'parsed',
        ...(request.filename ? { rawContentRef: request.filename } : {}),
      }
    : {
        id: generateRequestId(),
        source: request.source,
        facilityName: '',
        facilityAddress: { street: '', city: '', state: '', zipCode: '', country: 'US' },
        contractStartDate: '',
        contractEndDate: '',
        parsedAt: now,
        status: 'failed',
        ...(request.filename ? { rawContentRef: request.filename } : {}),
      };

  return {
    success: true,
    data: { workOrder, confidence: fields ? 0.85 : 0 },
    requestId: generateRequestId(),
    timestamp: now,
  };
}
