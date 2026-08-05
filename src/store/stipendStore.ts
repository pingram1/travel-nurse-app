import { create } from 'zustand';

import type { LodgingOptionInput, PhysicalAddress, StipendCalculationInput } from '@/types';

const DEFAULT_TAX_HOME: PhysicalAddress = {
  street: '400 Main St',
  city: 'Austin',
  state: 'TX',
  zipCode: '78701',
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

// Realistic contract defaults so the app is interactive out of the box;
// replaced by parsed work-order values in a full integration.
const initialState: StipendCalculationInput = {
  contractGrossPay: 3200,
  taxHomeAddress: DEFAULT_TAX_HOME,
  dailyHousingStipendRate: 110,
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
