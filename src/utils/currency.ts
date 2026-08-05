export interface TakeHomePayInput {
  grossPay: number;
  housingStipend: number;
  mealStipend: number;
  travelReimbursement: number;
  deductions: number;
}

export function formatCurrency(amount: number, locale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateTakeHomePay(input: TakeHomePayInput): number {
  const stipends = input.housingStipend + input.mealStipend + input.travelReimbursement;
  return input.grossPay + stipends - input.deductions;
}
