import { Image, Text, View } from 'react-native';

import { Button, Card, SectionHeader } from '@/components/ui';
import type { RideShareLogEntry } from '@/types';

export interface RideShareLogPanelProps {
  providerLabel: string;
  entries: RideShareLogEntry[];
  isPicking: boolean;
  error: string | null;
  onAddFromLibrary: () => void;
  onCapturePhoto: () => void;
  onRemove: (entryId: string) => void;
}

export function RideShareLogPanel({
  providerLabel,
  entries,
  isPicking,
  error,
  onAddFromLibrary,
  onCapturePhoto,
  onRemove,
}: RideShareLogPanelProps) {
  return (
    <View className="gap-4">
      <SectionHeader
        title="Ride-share log"
        subtitle={`Keep ${providerLabel} receipts and trip screenshots in one place`}
      />
      <Card>
        <View className="gap-3">
          <Button label="Upload screenshot" disabled={isPicking} onPress={onAddFromLibrary} />
          <Button
            label="Take photo of receipt"
            variant="soft"
            disabled={isPicking}
            onPress={onCapturePhoto}
          />
        </View>
      </Card>

      {entries.length === 0 ? (
        <Card variant="soft">
          <Text className="text-sm text-slate-600">
            No ride screenshots yet. Add a trip screenshot or receipt after each ride.
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <View className="gap-3">
                <Image
                  accessibilityLabel="Ride-share screenshot"
                  source={{ uri: entry.screenshotUri }}
                  className="h-40 w-full rounded-2xl"
                  resizeMode="cover"
                />
                <Text className="text-xs text-slate-500">
                  {entry.recordedAt.slice(0, 10)}
                  {entry.notes ? ` · ${entry.notes}` : ''}
                </Text>
                <Button
                  label="Remove"
                  variant="ghost"
                  size="sm"
                  onPress={() => onRemove(entry.id)}
                />
              </View>
            </Card>
          ))}
        </View>
      )}

      {error ? <Text className="text-sm font-medium text-danger-600">{error}</Text> : null}
    </View>
  );
}
