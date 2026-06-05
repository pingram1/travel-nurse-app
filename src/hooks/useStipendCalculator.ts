import { useMemo } from 'react';

import { useStipendStore } from '@/store/stipendStore';
import type { LodgingOptionInput, PhysicalAddress, StipendCalculation } from '@/types';
import { buildStipendCalculation } from '@/utils/stipend';

export interface UseStipendCalculatorResult extends StipendCalculation {
  setContractGrossPay: (amount: number) => void;
  setTaxHomeAddress: (address: PhysicalAddress) => void;
  setDailyHousingStipendRate: (rate: number) => void;
  setHighlightTaxDeductibility: (enabled: boolean) => void;
  setLodgingOptions: (options: LodgingOptionInput[]) => void;
  reset: () => void;
}

export function useStipendCalculator(): UseStipendCalculatorResult {
  const input = useStipendStore();
  const {
    setContractGrossPay,
    setTaxHomeAddress,
    setDailyHousingStipendRate,
    setHighlightTaxDeductibility,
    setLodgingOptions,
    reset,
  } = input;

  const calculation = useMemo(() => {
    const { filteredLodgingOptions, estimatedTakeHome, subscriptionDeductibleNote } =
      buildStipendCalculation({
        contractGrossPay: input.contractGrossPay,
        taxHomeAddress: input.taxHomeAddress,
        dailyHousingStipendRate: input.dailyHousingStipendRate,
        highlightTaxDeductibility: input.highlightTaxDeductibility,
        lodgingOptions: input.lodgingOptions,
      });

    return {
      contractGrossPay: input.contractGrossPay,
      taxHomeAddress: input.taxHomeAddress,
      dailyHousingStipendRate: input.dailyHousingStipendRate,
      highlightTaxDeductibility: input.highlightTaxDeductibility,
      lodgingOptions: input.lodgingOptions,
      filteredLodgingOptions,
      estimatedTakeHome,
      subscriptionDeductibleNote,
    };
  }, [
    input.contractGrossPay,
    input.taxHomeAddress,
    input.dailyHousingStipendRate,
    input.highlightTaxDeductibility,
    input.lodgingOptions,
  ]);

  return {
    ...calculation,
    setContractGrossPay,
    setTaxHomeAddress,
    setDailyHousingStipendRate,
    setHighlightTaxDeductibility,
    setLodgingOptions,
    reset,
  };
}
