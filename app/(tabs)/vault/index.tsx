import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  HeroBanner,
  PressableScale,
  SectionHeader,
  type BadgeTone,
} from '@/components/ui';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { vaultService } from '@/services/secure-storage/vaultService';
import type { CredentialLocker, CredentialType, SecureCredentialPayload } from '@/types';
import { formatShortDate } from '@/utils/datetime';

const statusTone: Record<string, BadgeTone> = {
  valid: 'success',
  expiring: 'warning',
  expired: 'danger',
};

/** Empty interactive upload slots for common clinical credential types. */
const CREDENTIAL_SLOTS: Array<{ type: CredentialType; label: string; hint: string }> = [
  { type: 'STATE_LICENSE', label: 'State RN / license', hint: 'Upload license card or PDF photo' },
  { type: 'BLS', label: 'BLS certification', hint: 'AHA or equivalent card' },
  { type: 'ACLS', label: 'ACLS certification', hint: 'Advanced cardiac life support' },
  { type: 'TB_TEST', label: 'TB test / IGRA', hint: 'Most recent negative result' },
];

export default function VaultScreen() {
  const { user } = useAuth();
  const [locker, setLocker] = useState<CredentialLocker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyType, setBusyType] = useState<CredentialType | null>(null);

  const loadLocker = useCallback(async () => {
    if (!user) return;
    try {
      const data = await vaultService.getCredentialLocker(user);
      setLocker(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load credential locker');
    }
  }, [user]);

  useEffect(() => {
    void loadLocker();
  }, [loadLocker]);

  const canWrite = user?.permissions.includes('vault:write') ?? false;
  const canDelete = user?.permissions.includes('vault:delete') ?? false;

  const credentialForType = (type: CredentialType): SecureCredentialPayload | undefined =>
    locker?.credentials.find((c) => c.type === type);

  const uploadCredential = async (slot: (typeof CREDENTIAL_SLOTS)[number]) => {
    if (!user) return;
    setBusyType(slot.type);
    setError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Photo library permission is required to upload credentials.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      // Secure storage holds an encrypted file reference; binary blob sync is server-side.
      const payload = JSON.stringify({
        kind: 'local-file-ref',
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? `${slot.type.toLowerCase()}.jpg`,
        uploadedAt: new Date().toISOString(),
      });

      const issuedAt = new Date().toISOString();
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 2);

      const existing = credentialForType(slot.type);
      if (existing && canDelete) {
        await vaultService.removeCredential(user, existing.id);
      }

      await vaultService.storeCredential(user, {
        type: slot.type,
        label: slot.label,
        issuedAt,
        expiresAt: expires.toISOString(),
        encryptedPayload: payload,
      });
      await loadLocker();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to store credential');
    } finally {
      setBusyType(null);
    }
  };

  const removeCredential = async (credentialId: string) => {
    if (!user) return;
    setBusyType('STATE_LICENSE');
    try {
      await vaultService.removeCredential(user, credentialId);
      await loadLocker();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove credential');
    } finally {
      setBusyType(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-10">
      <HeroBanner
        eyebrow="AES-encrypted · Device keychain"
        title="Credential Vault"
        subtitle="Upload licenses and certifications into hardware-backed secure storage with role-based access."
      >
        {user ? (
          <View className="rounded-2xl bg-white/15 px-3 py-2.5">
            <Text className="text-sm font-semibold text-white">Signed in as {user.role}</Text>
            <Text className="mt-0.5 text-xs text-medical-100">
              Permissions: {user.permissions.join(', ')}
            </Text>
          </View>
        ) : null}
      </HeroBanner>

      {error ? (
        <Card variant="warning" className="border-danger-100 bg-danger-50">
          <Text className="text-sm text-danger-800">{error}</Text>
        </Card>
      ) : null}

      <SectionHeader
        title="Credential slots"
        subtitle={
          locker
            ? `Last synced ${formatShortDate(locker.lastSyncedAt)} · empty until you upload`
            : 'Loading…'
        }
      />

      <View className="gap-3">
        {CREDENTIAL_SLOTS.map((slot) => {
          const stored = credentialForType(slot.type);
          return (
            <Card key={slot.type}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-row flex-1 items-start gap-3">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-2xl bg-medical-100"
                    style={SHADOWS.soft}
                  >
                    <Ionicons
                      name={stored ? 'checkmark-circle' : 'cloud-upload-outline'}
                      size={22}
                      color={stored ? COLORS.clinical[600] : COLORS.medical[600]}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900">{slot.label}</Text>
                    <Text className="mt-0.5 text-sm text-slate-500">
                      {stored ? `Expires ${formatShortDate(stored.expiresAt)}` : slot.hint}
                    </Text>
                    <View className="mt-2 flex-row gap-2">
                      {stored ? (
                        <Badge
                          label={stored.status.toUpperCase()}
                          tone={statusTone[stored.status] ?? 'neutral'}
                        />
                      ) : (
                        <Badge label="Empty — tap upload" tone="warning" />
                      )}
                    </View>
                  </View>
                </View>
              </View>
              {canWrite ? (
                <View className="mt-3 flex-row gap-2">
                  <View className="flex-1">
                    <Button
                      label={stored ? 'Replace file' : 'Upload'}
                      variant="soft"
                      loading={busyType === slot.type}
                      onPress={() => void uploadCredential(slot)}
                    />
                  </View>
                  {stored && canDelete ? (
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${slot.label}`}
                      disabled={busyType !== null}
                      onPress={() => void removeCredential(stored.id)}
                      className="h-11 w-11 items-center justify-center rounded-2xl bg-danger-50"
                      contentClassName="items-center justify-center"
                      scaleTo={0.92}
                    >
                      <Ionicons name="trash-outline" size={20} color="#e5484d" />
                    </PressableScale>
                  ) : null}
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>

      {!canWrite ? (
        <Card variant="soft">
          <Text className="text-sm text-slate-600">
            Your role does not include vault write access. Contact your administrator.
          </Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}
