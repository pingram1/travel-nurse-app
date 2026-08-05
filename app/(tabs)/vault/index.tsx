import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Badge, Button, Card, SectionHeader, type BadgeTone } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { vaultService } from '@/services/secure-storage/vaultService';
import type { CredentialLocker, CredentialType } from '@/types';
import { formatShortDate } from '@/utils/datetime';

const statusTone: Record<string, BadgeTone> = {
  valid: 'success',
  expiring: 'warning',
  expired: 'danger',
};

const SAMPLE_CREDENTIALS: Array<{ type: CredentialType; label: string; monthsValid: number }> = [
  { type: 'STATE_LICENSE', label: 'RN License — Oregon', monthsValid: 18 },
  { type: 'BLS', label: 'BLS Certification (AHA)', monthsValid: 24 },
  { type: 'ACLS', label: 'ACLS Certification (AHA)', monthsValid: 1 },
  { type: 'TB_TEST', label: 'TB Test — Negative', monthsValid: 12 },
];

export default function VaultScreen() {
  const { user } = useAuth();
  const [locker, setLocker] = useState<CredentialLocker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const addCredential = async (sample: (typeof SAMPLE_CREDENTIALS)[number]) => {
    if (!user) return;
    setBusy(true);
    try {
      const issuedAt = new Date().toISOString();
      const expires = new Date();
      expires.setMonth(expires.getMonth() + sample.monthsValid);
      await vaultService.storeCredential(user, {
        type: sample.type,
        label: sample.label,
        issuedAt,
        expiresAt: expires.toISOString(),
        encryptedPayload: `enc::${sample.type}::demo-payload`,
      });
      await loadLocker();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to store credential');
    } finally {
      setBusy(false);
    }
  };

  const removeCredential = async (credentialId: string) => {
    if (!user) return;
    setBusy(true);
    try {
      await vaultService.removeCredential(user, credentialId);
      await loadLocker();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove credential');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface-canvas" contentContainerClassName="gap-4 p-4 pb-8">
      <View className="rounded-2xl bg-medical-800 p-5">
        <View className="flex-row items-center gap-2">
          <Ionicons name="lock-closed" size={16} color="#b5d2e9" />
          <Text className="text-xs font-semibold uppercase tracking-widest text-medical-200">
            AES-encrypted · Device keychain
          </Text>
        </View>
        <Text className="mt-1 text-2xl font-bold text-white">Credential Vault</Text>
        <Text className="mt-1 text-sm text-medical-100">
          State licenses, BLS/ACLS, and TB tests stored in secure hardware-backed storage with
          role-based access control.
        </Text>
        {user ? (
          <View className="mt-3 rounded-xl bg-medical-900/60 p-3">
            <Text className="text-sm font-semibold text-white">Signed in as {user.role}</Text>
            <Text className="mt-0.5 text-xs text-medical-200">
              Permissions: {user.permissions.join(', ')}
            </Text>
          </View>
        ) : null}
      </View>

      {error ? (
        <Card className="border-danger-100 bg-danger-50">
          <Text className="text-sm text-danger-800">{error}</Text>
        </Card>
      ) : null}

      <SectionHeader
        title="Stored credentials"
        subtitle={locker ? `Last synced ${formatShortDate(locker.lastSyncedAt)}` : 'Loading…'}
      />
      {locker && locker.credentials.length === 0 ? (
        <Card>
          <Text className="text-sm text-slate-600">
            No credentials stored yet. Add your first document below — it never leaves the secure
            enclave unencrypted.
          </Text>
        </Card>
      ) : null}
      <View className="gap-3">
        {locker?.credentials.map((credential) => (
          <Card key={credential.id}>
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900">{credential.label}</Text>
                <Text className="mt-0.5 text-sm text-slate-500">
                  {credential.type} · expires {formatShortDate(credential.expiresAt)}
                </Text>
                <View className="mt-2 flex-row gap-2">
                  <Badge
                    label={credential.status.toUpperCase()}
                    tone={statusTone[credential.status] ?? 'neutral'}
                  />
                </View>
              </View>
              {canDelete ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${credential.label}`}
                  disabled={busy}
                  onPress={() => void removeCredential(credential.id)}
                  className="h-11 w-11 items-center justify-center rounded-xl bg-danger-50 active:bg-danger-100"
                >
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
                </Pressable>
              ) : null}
            </View>
          </Card>
        ))}
      </View>

      {canWrite ? (
        <>
          <SectionHeader
            title="Add a credential"
            subtitle="Demo documents — encrypted before storage"
          />
          <View className="gap-2">
            {SAMPLE_CREDENTIALS.map((sample) => (
              <Button
                key={sample.type}
                label={`Add ${sample.label}`}
                variant="secondary"
                loading={busy}
                onPress={() => void addCredential(sample)}
              />
            ))}
          </View>
        </>
      ) : (
        <Card>
          <Text className="text-sm text-slate-600">
            Your role does not include vault write access. Contact your administrator.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}
