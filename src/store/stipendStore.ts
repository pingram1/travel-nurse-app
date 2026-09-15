import { create } from 'zustand';

import type { LodgingOptionInput, PhysicalAddress, StipendCalculationInput } from '@/types';

const EMPTY_TAX_HOME: PhysicalAddress = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
};

interface StipendState extends StipendCalculationInput {
  setContractGrossPay: (amount: number) => void;
  setTaxHomeAddress: (address: PhysicalAddress) => void;
  setDailyHousingStipendRate: (rate: number) => void;
  setHighlightTaxDeductibility: (enabled: boolean) => void;
  setLodgingOptions: (options: LodgingOptionInput[]) => void;
  reset: () => void;
}

/** Blank slate — clinician enters contract + tax home (or uploads a contract). */
const initialState: StipendCalculationInput = {
  contractGrossPay: 0,
  taxHomeAddress: EMPTY_TAX_HOME,
  dailyHousingStipendRate: 0,
  highlightTaxDeductibility: false,
  lodgingOptions: [],
};

export const useStipendStore = create<StipendState>((set) => ({
  ...initialState,
  setContractGrossPay: (contractGrossPay) => set({ contractGrossPay }),
  setTaxHomeAddress: (taxHomeAddress) => set({ taxHomeAddress }),
  setDailyHousingStipendRate: (dailyHousingStipendRate) => set({ dailyHousingStipendRate }),
  setHighlightTaxDeductibility: (highlightTaxDeductibility) => set({ highlightTaxDeductibility }),
  setLodgingOptions: (lodgingOptions) => set({ lodgingOptions }),
  reset: () => set(initialState),
}));
