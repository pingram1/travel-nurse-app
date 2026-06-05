import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { vaultService } from '@/services/secure-storage/vaultService';
import type { CredentialLocker } from '@/types';

export default function VaultScreen() {
  const { user } = useAuth();
  const [locker, setLocker] = useState<CredentialLocker | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocker() {
      if (!user) return;
      try {
        const data = await vaultService.getCredentialLocker(user);
        setLocker(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load credential locker');
      }
    }
    void loadLocker();
  }, [user]);

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <Text className="mb-4 text-2xl font-bold text-slate-900">Credential Vault</Text>
      <Card className="gap-3">
        <Text className="text-base text-slate-700">
          Encrypted locker for State Licenses, BLS/ACLS, and TB Test documents. RBAC enforced per
          role.
        </Text>
        {user ? (
          <Text className="text-sm text-slate-500">
            Role: {user.role} · Permissions: {user.permissions.join(', ')}
          </Text>
        ) : null}
        {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
        {locker && locker.credentials.length === 0 ? (
          <Text className="text-sm text-slate-500">No credentials stored yet.</Text>
        ) : null}
        {locker?.credentials.map((credential) => (
          <View key={credential.id} className="border-t border-slate-100 pt-2">
            <Text className="text-base font-medium text-slate-900">{credential.label}</Text>
            <Text className="text-sm text-slate-600">
              {credential.type} · {credential.status} · expires {credential.expiresAt.slice(0, 10)}
            </Text>
          </View>
        ))}
      </Card>
    </View>
  );
}
