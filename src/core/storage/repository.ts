import { getDatabase, clearAllDatabase } from './db';
import type { VaultMetadata, EncryptedPayload, UserPreferences } from '../../types';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  language: 'fr',
  autoLockMinutes: 5,
  clearClipboardSeconds: 20,
};

export async function hasVault(): Promise<boolean> {
  const db = await getDatabase();
  const meta = await db.get('metadata', 'default');
  return !!meta;
}

export async function getMetadata(): Promise<VaultMetadata | undefined> {
  const db = await getDatabase();
  return db.get('metadata', 'default');
}

export async function initVault(
  metadata: VaultMetadata,
  initialEncryptedPayload: EncryptedPayload,
): Promise<void> {
  const db = await getDatabase();
  const tx = db.transaction(['metadata', 'vault'], 'readwrite');
  await tx.objectStore('metadata').put(metadata);
  await tx.objectStore('vault').put({
    id: 'entries_blob',
    payload: initialEncryptedPayload,
    updatedAt: Date.now(),
  });
  await tx.done;
}

export async function getEncryptedVaultEntries(): Promise<EncryptedPayload | null> {
  const db = await getDatabase();
  const record = await db.get('vault', 'entries_blob');
  return record ? record.payload : null;
}

export async function saveEncryptedVaultEntries(
  payload: EncryptedPayload,
): Promise<void> {
  const db = await getDatabase();
  await db.put('vault', {
    id: 'entries_blob',
    payload,
    updatedAt: Date.now(),
  });
}

export async function updateVaultMetadata(metadata: VaultMetadata): Promise<void> {
  const db = await getDatabase();
  await db.put('metadata', metadata);
}

export async function getPreferences(): Promise<UserPreferences> {
  const db = await getDatabase();
  const prefs = await db.get('preferences', 'user_prefs' as unknown as string);
  return prefs ? { ...DEFAULT_PREFERENCES, ...prefs } : DEFAULT_PREFERENCES;
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  const db = await getDatabase();
  await db.put('preferences', prefs, 'user_prefs' as unknown as string);
}

export async function wipeVault(): Promise<void> {
  await clearAllDatabase();
}
