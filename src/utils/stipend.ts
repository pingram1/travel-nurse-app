import type {
  LodgingOption,
  LodgingOptionInput,
  LodgingStipendVariance,
  StipendCalculationInput,
} from '@/types';

const VARIANCE_TOLERANCE = 0.01;

export function classifyLodgingVariance(
  nightlyRate: number,
  dailyHousingStipendRate: number,
): { variance: LodgingStipendVariance; varianceAmount: number } {
  const varianceAmount = nightlyRate - dailyHousingStipendRate;

  if (Math.abs(varianceAmount) <= VARIANCE_TOLERANCE) {
    return { variance: 'at', varianceAmount: 0 };
  }

  return varianceAmount < 0
    ? { variance: 'under', varianceAmount }
    : { variance: 'over', varianceAmount };
}

export function annotateLodgingOptions(
  options: LodgingOptionInput[],
  dailyHousingStipendRate: number,
): LodgingOption[] {
  return options.map((option) => {
    const { variance, varianceAmount } = classifyLodgingVariance(
      option.nightlyRate,
      dailyHousingStipendRate,
    );

    return { ...option, stipendVariance: variance, varianceAmount };
  });
}

export function filterLodgingByStipend(options: LodgingOption[]): LodgingOption[] {
  return options.filter((option) => option.stipendVariance !== 'over');
}

export function buildStipendCalculation(input: StipendCalculationInput): {
  filteredLodgingOptions: LodgingOption[];
  estimatedTakeHome: number;
  subscriptionDeductibleNote: string | null;
} {
  const annotated = annotateLodgingOptions(input.lodgingOptions, input.dailyHousingStipendRate);
  const filteredLodgingOptions = filterLodgingByStipend(annotated);
  const contractDays = 30;
  const housingSpend = filteredLodgingOptions.reduce(
    (min, option) => Math.min(min, option.nightlyRate),
    input.dailyHousingStipendRate,
  );

  const estimatedTakeHome =
    input.contractGrossPay -
    housingSpend * contractDays +
    input.dailyHousingStipendRate * contractDays;

  const subscriptionDeductibleNote = input.highlightTaxDeductibility
    ? 'Your subscription may qualify as a tax-deductible professional expense. Consult a tax advisor.'
    : null;

  return { filteredLodgingOptions, estimatedTakeHome, subscriptionDeductibleNote };
}
