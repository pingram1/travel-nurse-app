import { renderHook } from '@testing-library/react-native';

import { useStipendStore } from '@/store/stipendStore';
import { useStipendCalculator } from '../useStipendCalculator';

describe('useStipendCalculator', () => {
  beforeEach(() => {
    useStipendStore.getState().reset();
  });

  it('filters lodging options within daily housing stipend', () => {
    useStipendStore.getState().setContractGrossPay(3200);
    useStipendStore.getState().setDailyHousingStipendRate(100);
    useStipendStore.getState().setLodgingOptions([
      { id: '1', name: 'Under', provider: 'hotel', nightlyRate: 90 },
      { id: '2', name: 'Over', provider: 'airbnb', nightlyRate: 120 },
    ]);

    const { result } = renderHook(() => useStipendCalculator());

    expect(result.current.filteredLodgingOptions).toHaveLength(1);
    expect(result.current.filteredLodgingOptions[0]?.name).toBe('Under');
  });

  it('exposes tax deductibility note when enabled', () => {
    useStipendStore.getState().setHighlightTaxDeductibility(true);

    const { result } = renderHook(() => useStipendCalculator());

    expect(result.current.subscriptionDeductibleNote).toContain('tax-deductible');
  });
});
