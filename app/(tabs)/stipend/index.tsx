import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Badge, Button, Card, HeroBanner, Input, SectionHeader, Toggle } from '@/components/ui';
import { useStipendCalculator } from '@/hooks/useStipendCalculator';
import { useTrip } from '@/hooks/useTrip';
import { formatCurrency } from '@/utils/currency';

export default function StipendScreen() {
  const stipend = useStipendCalculator();
  const trip = useTrip();
  const [grossDraft, setGrossDraft] = useState(
    stipend.contractGrossPay > 0 ? String(stipend.contractGrossPay) : '',
  );
  const [dailyDraft, setDailyDraft] = useState(
    stipend.dailyHousingStipendRate > 0 ? String(stipend.dailyHousingStipendRate) : '',
  );
  const [street, setStreet] = useState(stipend.taxHomeAddress.street);
  const [city, setCity] = useState(stipend.taxHomeAddress.city);
  const [state, setState] = useState(stipend.taxHomeAddress.state);
  const [zip, setZip] = useState(stipend.taxHomeAddress.zipCode);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    stipend.setLodgingOptions(
      trip.lodging.map((listing) => ({
        id: listing.id,
        name: listing.name,
        provider: listing.provider,
        nightlyRate: listing.nightlyRate,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.lodging]);

  const saveContractInputs = () => {
    const gross = Number(grossDraft);
    const daily = Number(dailyDraft);
    if (!Number.isFinite(gross) || gross < 0 || !Number.isFinite(daily) || daily < 0) {
      setFormError('Enter valid non-negative amounts for pay and daily stipend.');
      return;
    }
    if (!city.trim() || state.trim().length !== 2 || !zip.trim()) {
      setFormError('Tax home needs city, 2-letter state, and ZIP.');
      return;
    }
    setFormError(null);
    stipend.setContractGrossPay(gross);
    stipend.setDailyHousingStipendRate(daily);
    stipend.setTaxHomeAddress({
      street: street.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      zipCode: zip.trim(),
      country: 'US',
    });
    setUploadNote('Contract details saved.');
  };

  const uploadContractDocument = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setUploadNote('Photo library permission is required to upload a contract.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploadNote(
      `Contract image attached (${result.assets[0].fileName ?? 'document'}). Enter or confirm pay and tax-home fields below — server-side OCR will prefill these in a future release.`,
    );
  };

  const hasContract =
    stipend.contractGrossPay > 0 &&
    stipend.dailyHousingStipendRate > 0 &&
    Boolean(stipend.taxHomeAddress.city);

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-10">
      <HeroBanner
        eyebrow="Contract finances"
        title="Stipend Tracker"
        subtitle={
          trip.hospital
            ? `Track lodging variance for ${trip.hospital.name}`
            : 'Enter your contract pay and tax home, then select a facility for lodging variance.'
        }
      />

      <SectionHeader
        title="Your contract"
        subtitle="Enter manually or attach a contract photo for your records"
      />
      <Card>
        <View className="gap-3">
          <Input
            label="Gross weekly pay (USD)"
            value={grossDraft}
            onChangeText={setGrossDraft}
            keyboardType="decimal-pad"
            placeholder="e.g. 3200"
          />
          <Input
            label="Daily housing stipend (USD)"
            value={dailyDraft}
            onChangeText={setDailyDraft}
            keyboardType="decimal-pad"
            placeholder="e.g. 110"
          />
          <Input label="Tax home street" value={street} onChangeText={setStreet} />
          <Input label="City" value={city} onChangeText={setCity} />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                label="State"
                value={state}
                onChangeText={setState}
                autoCapitalize="characters"
                maxLength={2}
                placeholder="TX"
              />
            </View>
            <View className="flex-1">
              <Input
                label="ZIP"
                value={zip}
                onChangeText={setZip}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
          </View>
          {formError ? (
            <Text className="text-sm font-medium text-danger-600">{formError}</Text>
          ) : null}
          {uploadNote ? <Text className="text-sm text-medical-700">{uploadNote}</Text> : null}
          <Button label="Save contract details" onPress={saveContractInputs} />
          <Button
            label="Upload contract photo"
            variant="soft"
            onPress={() => void uploadContractDocument()}
          />
        </View>
      </Card>

      <Card title="Snapshot">
        <View className="gap-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600">Gross weekly pay</Text>
            <Text className="text-sm font-bold text-slate-900">
              {hasContract ? formatCurrency(stipend.contractGrossPay) : '—'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600">Daily housing stipend</Text>
            <Text className="text-sm font-bold text-slate-900">
              {hasContract ? formatCurrency(stipend.dailyHousingStipendRate) : '—'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600">Tax home</Text>
            <Text className="text-sm font-bold text-slate-900">
              {hasContract
                ? `${stipend.taxHomeAddress.city}, ${stipend.taxHomeAddress.state}`
                : 'Not set'}
            </Text>
          </View>
          <View className="mt-2 rounded-2xl bg-clinical-50 p-4">
            <Text className="text-xs font-bold uppercase tracking-[1px] text-clinical-700">
              Estimated take-home
            </Text>
            <Text className="mt-0.5 text-2xl font-bold text-clinical-700">
              {hasContract ? formatCurrency(stipend.estimatedTakeHome) : '—'}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <Toggle
          label="Highlight tax deductibility"
          description="Surface professional expenses that may be deductible."
          value={stipend.highlightTaxDeductibility}
          onValueChange={stipend.setHighlightTaxDeductibility}
        />
      </Card>

      {stipend.subscriptionDeductibleNote ? (
        <Card variant="success">
          <Text className="text-sm text-clinical-800">{stipend.subscriptionDeductibleNote}</Text>
        </Card>
      ) : null}

      <SectionHeader
        title="Lodging vs. stipend variance"
        subtitle="Options priced over your daily stipend are filtered out"
      />
      {!hasContract ? (
        <Card variant="soft">
          <Text className="text-sm leading-5 text-slate-600">
            Save your daily housing stipend above to filter lodging against your contract.
          </Text>
        </Card>
      ) : stipend.filteredLodgingOptions.length === 0 ? (
        <Card variant="soft">
          <Text className="text-sm leading-5 text-slate-600">
            No lodging market loaded yet — pick a facility in the Trip tab.
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {stipend.filteredLodgingOptions.map((option) => (
            <Card key={option.id}>
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-900">{option.name}</Text>
                  <Text className="mt-0.5 text-sm text-slate-500">
                    {formatCurrency(option.nightlyRate)}/night ·{' '}
                    {option.provider === 'hotel' ? 'Hotel' : 'Airbnb'}
                  </Text>
                </View>
                <Badge
                  label={
                    option.stipendVariance === 'at'
                      ? 'At stipend'
                      : `${formatCurrency(Math.abs(option.varianceAmount))} under`
                  }
                  tone="success"
                />
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
