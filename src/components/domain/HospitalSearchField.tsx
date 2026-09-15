import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Card, Input } from '@/components/ui';
import type { Hospital } from '@/types';
import { formatHospitalOptionSubtitle, formatHospitalOptionTitle } from '@/utils/hospitalDisplay';

export interface HospitalSearchFieldProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: Hospital[];
  isFetching: boolean;
  selectedHospitalId: string | null;
  onSelect: (hospital: Hospital) => void;
  errorMessage?: string | null;
}

export function HospitalSearchField({
  query,
  onQueryChange,
  results,
  isFetching,
  selectedHospitalId,
  onSelect,
  errorMessage,
}: HospitalSearchFieldProps) {
  const trimmed = query.trim();
  const showDropdown = trimmed.length >= 2;
  const showEmpty = showDropdown && !isFetching && results.length === 0;

  return (
    <View className="gap-2">
      <Input
        label="Hospital or medical center"
        placeholder="Start typing a hospital name…"
        value={query}
        onChangeText={onQueryChange}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="words"
        hint="Suggestions update as you type · US NPPES hospital registry"
      />

      {showDropdown ? (
        <Card variant="soft" className="!p-2">
          {isFetching && results.length === 0 ? (
            <View className="flex-row items-center gap-3 px-2 py-3">
              <ActivityIndicator color="#0f766e" />
              <Text className="text-sm text-slate-600">Searching hospitals…</Text>
            </View>
          ) : null}

          {results.map((hospital) => {
            const selected = selectedHospitalId === hospital.id;
            return (
              <Pressable
                key={hospital.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelect(hospital)}
                className={`min-h-[48px] rounded-xl px-3 py-3 ${
                  selected ? 'bg-medical-100' : 'bg-transparent active:bg-medical-50'
                }`}
              >
                <Text className="text-sm font-semibold text-slate-900" numberOfLines={3}>
                  {formatHospitalOptionTitle(hospital)}
                </Text>
                <Text className="mt-0.5 text-xs text-slate-500" numberOfLines={2}>
                  {formatHospitalOptionSubtitle(hospital)}
                </Text>
              </Pressable>
            );
          })}

          {showEmpty ? (
            <View className="px-2 py-3">
              <Text className="text-sm text-slate-600">
                {errorMessage ??
                  'No hospitals matched that search. Try fewer words (e.g. “Mayo Clinic”) or the official NPPES name.'}
              </Text>
            </View>
          ) : null}

          {isFetching && results.length > 0 ? (
            <View className="flex-row items-center gap-2 px-2 py-2">
              <ActivityIndicator size="small" color="#0f766e" />
              <Text className="text-xs text-slate-500">Updating suggestions…</Text>
            </View>
          ) : null}
        </Card>
      ) : (
        <Text className="text-xs text-slate-500">Type at least 2 characters to search.</Text>
      )}
    </View>
  );
}
