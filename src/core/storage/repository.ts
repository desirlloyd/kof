import { getDatabase, clearAllDatabase } from './db';
import type {
  UserAccount,
  AccountSummary,
  VaultMetadata,
  EncryptedPayload,
  UserPreferences,
} from '../../types';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  language: 'fr',
  autoLockMinutes: 5,
  clearClipboardSeconds: 20,
};

const ACTIVE_ACCOUNT_KEY = 'kof_active_account_id';

export function getStoredActiveAccountId(): string | null {
  return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
}

export function setStoredActiveAccountId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  }
}

/**
 * Récupère la liste résumée de tous les comptes enregistrés
 */
export async function getAllAccounts(): Promise<AccountSummary[]> {
  const db = await getDatabase();
  await ensureLegacyMigration(db);
  const accounts = await db.getAll('accounts');
  return accounts
    .map((acc) => ({
      id: acc.id,
      name: acc.name,
      avatarColor: acc.avatarColor,
      createdAt: acc.createdAt,
      lastLoginAt: acc.lastLoginAt,
    }))
    .sort((a, b) => (b.lastLoginAt || b.createdAt) - (a.lastLoginAt || a.createdAt));
}

/**
 * Récupère le compte complet avec métadonnées et payload chiffré
 */
export async function getAccount(id: string): Promise<UserAccount | undefined> {
  const db = await getDatabase();
  await ensureLegacyMigration(db);
  return db.get('accounts', id);
}

/**
 * Crée ou met à jour un compte utilisateur
 */
export async function saveAccount(account: UserAccount): Promise<void> {
  const db = await getDatabase();
  await db.put('accounts', account);
}

/**
 * Supprime un compte utilisateur
 */
export async function deleteAccount(id: string): Promise<void> {
  const db = await getDatabase();
  await db.delete('accounts', id);
  if (getStoredActiveAccountId() === id) {
    setStoredActiveAccountId(null);
  }
}

/**
 * Met à jour le payload chiffré du coffre d'un compte
 */
export async function updateAccountVault(
  accountId: string,
  payload: EncryptedPayload,
): Promise<void> {
  const db = await getDatabase();
  const account = await db.get('accounts', accountId);
  if (account) {
    account.vaultPayload = payload;
    account.lastLoginAt = Date.now();
    await db.put('accounts', account);
  }
}

/**
 * Met à jour les métadonnées (sel, authCheck) d'un compte
 */
export async function updateAccountMetadata(
  accountId: string,
  metadata: VaultMetadata,
): Promise<void> {
  const db = await getDatabase();
  const account = await db.get('accounts', accountId);
  if (account) {
    account.metadata = metadata;
    await db.put('accounts', account);
  }
}

/**
 * Met à jour les préférences d'un compte
 */
export async function updateAccountPreferences(
  accountId: string,
  preferences: UserPreferences,
): Promise<void> {
  const db = await getDatabase();
  const account = await db.get('accounts', accountId);
  if (account) {
    account.preferences = preferences;
    await db.put('accounts', account);
  }
}

/**
 * Vérifie si au moins un compte existe sur cet appareil
 */
export async function hasAnyAccount(): Promise<boolean> {
  const accounts = await getAllAccounts();
  return accounts.length > 0;
}

/**
 * Migration transparente depuis l'ancienne version v1 à compte unique
 */
async function ensureLegacyMigration(db: Awaited<ReturnType<typeof getDatabase>>): Promise<void> {
  try {
    const existingAccounts = await db.count('accounts');
    if (existingAccounts === 0) {
      const legacyMeta = await db.get('metadata', 'default');
      if (legacyMeta) {
        const legacyVault = await db.get('vault', 'entries_blob');
        const legacyAccount: UserAccount = {
          id: 'default',
          name: 'Mon Kòf',
          avatarColor: '#FFB400',
          createdAt: legacyMeta.createdAt || Date.now(),
          lastLoginAt: Date.now(),
          metadata: legacyMeta,
          vaultPayload: legacyVault
            ? legacyVault.payload
            : { version: 1, iv: '', ciphertext: '' },
          preferences: {
            theme: 'dark',
            language: 'fr',
            autoLockMinutes: 5,
            clearClipboardSeconds: 20,
          },
        };
        await db.put('accounts', legacyAccount);
      }
    }
  } catch (err) {
    console.warn('Migration legacy check:', err);
  }
}

export async function wipeAllData(): Promise<void> {
  setStoredActiveAccountId(null);
  await clearAllDatabase();
}
