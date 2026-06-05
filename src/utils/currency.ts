import type { StipendBreakdown } from '@/types';

export function formatCurrency(amount: number, locale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateTakeHomePay(input: Omit<StipendBreakdown, 'takeHomePay'>): number {
  const stipends = input.housingStipend + input.mealStipend + input.travelReimbursement;
  return input.grossPay + stipends - input.deductions;
}
