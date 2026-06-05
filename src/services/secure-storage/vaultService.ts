import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
  type DynamicSecureStorageKey,
} from '@/services/secure-storage';
import type {
  CredentialLocker,
  CredentialType,
  SecureCredentialPayload,
  User,
  UserRole,
  VaultPermission,
} from '@/types';

const VAULT_INDEX_KEY = 'tn_vault_index' as DynamicSecureStorageKey;

const ROLE_PERMISSIONS: Record<UserRole, VaultPermission[]> = {
  nurse: ['vault:read', 'vault:write'],
  physician: ['vault:read', 'vault:write'],
  hr: ['vault:read', 'vault:export'],
  admin: ['vault:read', 'vault:write', 'vault:delete', 'vault:export'],
};

const CREDENTIAL_ROLE_ACCESS: Record<CredentialType, UserRole[]> = {
  STATE_LICENSE: ['nurse', 'physician', 'hr', 'admin'],
  BLS: ['nurse', 'physician', 'hr', 'admin'],
  ACLS: ['nurse', 'physician', 'admin'],
  TB_TEST: ['nurse', 'physician', 'hr', 'admin'],
};

interface StoredCredentialRecord extends SecureCredentialPayload {
  encryptedPayload: string;
}

export class VaultAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VaultAccessError';
  }
}

function credentialStorageKey(id: string): DynamicSecureStorageKey {
  return `tn_vault_cred_${id}`;
}

function hasPermission(user: User, permission: VaultPermission): boolean {
  return user.permissions.includes(permission) || ROLE_PERMISSIONS[user.role].includes(permission);
}

function canAccessCredential(user: User, credential: SecureCredentialPayload): boolean {
  return credential.allowedRoles.includes(user.role) || user.role === 'admin';
}

function resolveCredentialStatus(expiresAt: string): SecureCredentialPayload['status'] {
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  if (expires < now) return 'expired';
  if (expires - now <= thirtyDays) return 'expiring';
  return 'valid';
}

async function readVaultIndex(): Promise<string[]> {
  const raw = await getSecureItem(VAULT_INDEX_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as string[];
}

async function writeVaultIndex(ids: string[]): Promise<void> {
  await setSecureItem(VAULT_INDEX_KEY, JSON.stringify(ids));
}

export async function getCredentialLocker(user: User): Promise<CredentialLocker> {
  if (!hasPermission(user, 'vault:read')) {
    throw new VaultAccessError('Insufficient permissions to read credential locker');
  }

  const ids = await readVaultIndex();
  const credentials: SecureCredentialPayload[] = [];

  for (const id of ids) {
    const raw = await getSecureItem(credentialStorageKey(id));
    if (!raw) continue;

    const record = JSON.parse(raw) as StoredCredentialRecord;
    if (!canAccessCredential(user, record)) continue;

    credentials.push({
      id: record.id,
      type: record.type,
      label: record.label,
      encryptedPayloadRef: record.encryptedPayloadRef,
      issuedAt: record.issuedAt,
      expiresAt: record.expiresAt,
      status: resolveCredentialStatus(record.expiresAt),
      ownerId: record.ownerId,
      allowedRoles: record.allowedRoles,
    });
  }

  return {
    userId: user.id,
    credentials,
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function storeCredential(
  user: User,
  input: {
    type: CredentialType;
    label: string;
    issuedAt: string;
    expiresAt: string;
    encryptedPayload: string;
  },
): Promise<SecureCredentialPayload> {
  if (!hasPermission(user, 'vault:write')) {
    throw new VaultAccessError('Insufficient permissions to write credentials');
  }

  const id = `${input.type.toLowerCase()}_${Date.now()}`;
  const storageKey = credentialStorageKey(id);
  const credential: StoredCredentialRecord = {
    id,
    type: input.type,
    label: input.label,
    encryptedPayloadRef: storageKey,
    issuedAt: input.issuedAt,
    expiresAt: input.expiresAt,
    status: resolveCredentialStatus(input.expiresAt),
    ownerId: user.id,
    allowedRoles: CREDENTIAL_ROLE_ACCESS[input.type],
    encryptedPayload: input.encryptedPayload,
  };

  await setSecureItem(storageKey, JSON.stringify(credential));

  const index = await readVaultIndex();
  if (!index.includes(id)) {
    await writeVaultIndex([...index, id]);
  }

  const { encryptedPayload, ...publicCredential } = credential;
  void encryptedPayload;
  return publicCredential;
}

export async function removeCredential(user: User, credentialId: string): Promise<void> {
  if (!hasPermission(user, 'vault:delete')) {
    throw new VaultAccessError('Insufficient permissions to delete credentials');
  }

  await deleteSecureItem(credentialStorageKey(credentialId));
  const index = await readVaultIndex();
  await writeVaultIndex(index.filter((id) => id !== credentialId));
}

export const vaultService = {
  getCredentialLocker,
  storeCredential,
  removeCredential,
  ROLE_PERMISSIONS,
  CREDENTIAL_ROLE_ACCESS,
} as const;
