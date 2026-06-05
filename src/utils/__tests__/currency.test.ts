import { calculateTakeHomePay, formatCurrency } from '../currency';

describe('currency utils', () => {
  it('formats USD amounts', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('calculates take-home pay from stipends and deductions', () => {
    const result = calculateTakeHomePay({
      grossPay: 3000,
      housingStipend: 1000,
      mealStipend: 400,
      travelReimbursement: 200,
      deductions: 500,
    });

    expect(result).toBe(4100);
  });
});
