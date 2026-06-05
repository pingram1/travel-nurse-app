import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { useStipendCalculator } from '@/hooks/useStipendCalculator';
import { useStipendStore } from '@/store/stipendStore';
import { formatCurrency } from '@/utils/currency';

const MOCK_LODGING = [
  { id: 'h1', name: 'Extended Stay Suites', provider: 'hotel' as const, nightlyRate: 89 },
  { id: 'a1', name: 'Downtown AirBnB', provider: 'airbnb' as const, nightlyRate: 110 },
  { id: 'h2', name: 'Travel Nurse Inn', provider: 'hotel' as const, nightlyRate: 95 },
];

export default function StipendScreen() {
  const stipend = useStipendCalculator();

  useEffect(() => {
    const store = useStipendStore.getState();
    store.setContractGrossPay(3200);
    store.setDailyHousingStipendRate(100);
    store.setTaxHomeAddress({
      street: '400 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'US',
    });
    store.setLodgingOptions(MOCK_LODGING);
  }, []);

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <Text className="mb-4 text-2xl font-bold text-slate-900">Stipend Tracker</Text>

      <Card className="mb-4 gap-2">
        <Text className="text-base text-slate-700">
          Contract gross pay: {formatCurrency(stipend.contractGrossPay)}
        </Text>
        <Text className="text-base text-slate-700">
          Daily housing stipend: {formatCurrency(stipend.dailyHousingStipendRate)}
        </Text>
        <Text className="text-base text-slate-700">
          Tax home: {stipend.taxHomeAddress.city}, {stipend.taxHomeAddress.state}
        </Text>
        <Text className="text-lg font-bold text-brand-600">
          Est. take-home: {formatCurrency(stipend.estimatedTakeHome)}
        </Text>
      </Card>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: stipend.highlightTaxDeductibility }}
        onPress={() => stipend.setHighlightTaxDeductibility(!stipend.highlightTaxDeductibility)}
        className={`mb-4 rounded-lg px-4 py-3 ${stipend.highlightTaxDeductibility ? 'bg-brand-600' : 'bg-slate-200'}`}
      >
        <Text
          className={`font-semibold ${stipend.highlightTaxDeductibility ? 'text-white' : 'text-slate-800'}`}
        >
          Highlight tax deductibility
        </Text>
      </Pressable>

      {stipend.subscriptionDeductibleNote ? (
        <Card className="mb-4 border border-brand-200 bg-brand-50">
          <Text className="text-sm text-brand-800">{stipend.subscriptionDeductibleNote}</Text>
        </Card>
      ) : null}

      <Card className="gap-3">
        <Text className="text-base font-semibold text-slate-900">Lodging within stipend</Text>
        {stipend.filteredLodgingOptions.map((option) => (
          <View key={option.id} className="border-b border-slate-100 pb-2">
            <Text className="text-base text-slate-800">{option.name}</Text>
            <Text className="text-sm text-slate-600">
              {formatCurrency(option.nightlyRate)}/night — {option.stipendVariance} stipend (
              {formatCurrency(Math.abs(option.varianceAmount))})
            </Text>
          </View>
        ))}
      </Card>
    </View>
  );
}
