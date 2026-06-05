import { z } from 'zod';

import type { ParsedWorkOrderFields } from '@/types';

export const emailSchema = z.string().email('Enter a valid email address');

export const physicalAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  country: z.string().default('US'),
});

export const workOrderFieldsSchema = z.object({
  facilityName: z.string().min(1),
  facilityAddress: physicalAddressSchema,
  contractStartDate: z.string().datetime(),
  contractEndDate: z.string().datetime(),
});

export const parseWorkOrderRequestSchema = z.object({
  source: z.enum(['pdf', 'email']),
  content: z.string().min(1),
  filename: z.string().optional(),
});

const FACILITY_NAME_PATTERN = /facility(?:\s*name)?[:\s]+(.+)/i;
const ADDRESS_PATTERN = /address[:\s]+(.+)/i;
const START_DATE_PATTERN = /(?:start|begin)(?:\s*date)?[:\s]+(\d{4}-\d{2}-\d{2})/i;
const END_DATE_PATTERN = /(?:end|through)(?:\s*date)?[:\s]+(\d{4}-\d{2}-\d{2})/i;

interface ParsedWorkOrderDraft {
  facilityName?: string;
  facilityAddress?: ParsedWorkOrderFields['facilityAddress'];
  contractStartDate?: string;
  contractEndDate?: string;
}

export function parseWorkOrderContent(content: string): ParsedWorkOrderDraft {
  const facilityMatch = FACILITY_NAME_PATTERN.exec(content);
  const addressMatch = ADDRESS_PATTERN.exec(content);
  const startMatch = START_DATE_PATTERN.exec(content);
  const endMatch = END_DATE_PATTERN.exec(content);

  const addressParts = addressMatch?.[1]?.split(',').map((part) => part.trim()) ?? [];
  const draft: ParsedWorkOrderDraft = {};

  const facilityName = facilityMatch?.[1]?.trim();
  if (facilityName) draft.facilityName = facilityName;

  if (addressParts.length >= 3) {
    draft.facilityAddress = {
      street: addressParts[0] ?? '',
      city: addressParts[1] ?? '',
      state: addressParts[2]?.slice(0, 2) ?? '',
      zipCode: addressParts[2]?.slice(3).trim() ?? '',
      country: 'US',
    };
  }

  if (startMatch?.[1]) draft.contractStartDate = `${startMatch[1]}T00:00:00.000Z`;
  if (endMatch?.[1]) draft.contractEndDate = `${endMatch[1]}T00:00:00.000Z`;

  return draft;
}

export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[0-9]/, 'Password must include a number');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const stipendInputSchema = z.object({
  contractGrossPay: z.number().nonnegative(),
  dailyHousingStipendRate: z.number().nonnegative(),
  highlightTaxDeductibility: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type StipendInputValues = z.infer<typeof stipendInputSchema>;
export type WorkOrderFieldsValues = z.infer<typeof workOrderFieldsSchema>;
export type ParseWorkOrderRequestValues = z.infer<typeof parseWorkOrderRequestSchema>;
