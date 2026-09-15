import { Image, Text, View } from 'react-native';

import { Button, Card, Input, SectionHeader, Toggle } from '@/components/ui';
import type { RentalLog, RentalLogEntry, RentalPhotoKind } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { parseMileageInput, rentalMileageDriven } from '@/utils/travelLog';

export interface RentalLogPanelProps {
  vehicleLabel: string;
  weeklyRate: number | null;
  log: RentalLog;
  fuelDraft: string;
  isPicking: boolean;
  error: string | null;
  onFuelDraftChange: (value: string) => void;
  onStartMileageChange: (miles: number | null) => void;
  onEndMileageChange: (miles: number | null) => void;
  onInsuranceChange: (onFile: boolean) => void;
  onPickInsurancePhoto: () => void;
  onAddPhoto: (kind: RentalPhotoKind) => void;
  onRemoveEntry: (entryId: string) => void;
}

function entriesOf(log: RentalLog, kind: RentalPhotoKind): RentalLogEntry[] {
  return log.entries.filter((entry) => entry.photoKind === kind);
}

function PhotoRow({ entry, onRemove }: { entry: RentalLogEntry; onRemove: (id: string) => void }) {
  return (
    <View className="gap-2 rounded-2xl bg-slate-50 p-3">
      {entry.photoUri ? (
        <Image
          accessibilityLabel={`${entry.photoKind} rental photo`}
          source={{ uri: entry.photoUri }}
          className="h-36 w-full rounded-2xl"
          resizeMode="cover"
        />
      ) : null}
      {entry.fuelLevel ? (
        <Text className="text-sm text-slate-600">Fuel: {entry.fuelLevel}</Text>
      ) : null}
      <Button label="Remove photo" variant="ghost" size="sm" onPress={() => onRemove(entry.id)} />
    </View>
  );
}

export function RentalLogPanel({
  vehicleLabel,
  weeklyRate,
  log,
  fuelDraft,
  isPicking,
  error,
  onFuelDraftChange,
  onStartMileageChange,
  onEndMileageChange,
  onInsuranceChange,
  onPickInsurancePhoto,
  onAddPhoto,
  onRemoveEntry,
}: RentalLogPanelProps) {
  const driven = rentalMileageDriven(log);
  const before = entriesOf(log, 'before');
  const after = entriesOf(log, 'after');
  const fuel = entriesOf(log, 'fuel');

  return (
    <View className="gap-4">
      <SectionHeader
        title="Rental log"
        subtitle={`${vehicleLabel}${weeklyRate !== null ? ` · ${formatCurrency(weeklyRate)}/week` : ''}`}
      />
      <Card>
        <View className="gap-4">
          <Input
            label="Start mileage"
            keyboardType="number-pad"
            value={log.startMileage === null ? '' : String(log.startMileage)}
            onChangeText={(text) => onStartMileageChange(parseMileageInput(text))}
            placeholder="Odometer at pickup"
          />
          <Input
            label="End mileage"
            keyboardType="number-pad"
            value={log.endMileage === null ? '' : String(log.endMileage)}
            onChangeText={(text) => onEndMileageChange(parseMileageInput(text))}
            placeholder="Odometer at return"
          />
          <Text className="text-sm font-semibold text-medical-700">
            {driven === null
              ? 'Enter start and end mileage to see miles driven'
              : `${driven} miles driven`}
          </Text>
        </View>
      </Card>

      <Card>
        <View className="gap-3">
          <Toggle
            label="Insurance on file"
            description="Confirm coverage before you drive off the lot"
            value={log.insuranceOnFile}
            onValueChange={onInsuranceChange}
          />
          {log.insurancePhotoUri ? (
            <Image
              accessibilityLabel="Insurance card photo"
              source={{ uri: log.insurancePhotoUri }}
              className="h-36 w-full rounded-2xl"
              resizeMode="cover"
            />
          ) : null}
          <Button
            label={log.insurancePhotoUri ? 'Replace insurance photo' : 'Add insurance photo'}
            variant="soft"
            disabled={isPicking}
            onPress={onPickInsurancePhoto}
          />
        </View>
      </Card>

      <Card>
        <View className="gap-3">
          <Text className="text-base font-bold text-slate-900">Before / after photos</Text>
          <Button
            label="Add pickup photo"
            variant="soft"
            disabled={isPicking}
            onPress={() => onAddPhoto('before')}
          />
          {before.map((entry) => (
            <PhotoRow key={entry.id} entry={entry} onRemove={onRemoveEntry} />
          ))}
          <Button
            label="Add return photo"
            variant="soft"
            disabled={isPicking}
            onPress={() => onAddPhoto('after')}
          />
          {after.map((entry) => (
            <PhotoRow key={entry.id} entry={entry} onRemove={onRemoveEntry} />
          ))}
        </View>
      </Card>

      <Card>
        <View className="gap-3">
          <Text className="text-base font-bold text-slate-900">Fuel</Text>
          <Input
            label="Fuel level"
            value={fuelDraft}
            onChangeText={onFuelDraftChange}
            placeholder="e.g. 3/4 or Full"
            hint="Saved with the next fuel photo"
          />
          <Button
            label="Add fuel receipt or gauge photo"
            variant="soft"
            disabled={isPicking}
            onPress={() => onAddPhoto('fuel')}
          />
          {fuel.map((entry) => (
            <PhotoRow key={entry.id} entry={entry} onRemove={onRemoveEntry} />
          ))}
        </View>
      </Card>

      {error ? <Text className="text-sm font-medium text-danger-600">{error}</Text> : null}
    </View>
  );
}
