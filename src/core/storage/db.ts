import { openDB, type IDBPDatabase } from 'idb';
import type { UserAccount, VaultMetadata, EncryptedPayload, UserPreferences } from '../../types';

const DB_NAME = 'kof_db_v1';
const DB_VERSION = 2;

export interface KofDBSchema {
  accounts: {
    key: string;
    value: UserAccount;
  };
  metadata: {
    key: string;
    value: VaultMetadata;
  };
  vault: {
    key: string;
    value: {
      id: string;
      payload: EncryptedPayload;
      updatedAt: number;
    };
  };
  preferences: {
    key: string;
    value: UserPreferences;
  };
}

let dbPromise: Promise<IDBPDatabase<KofDBSchema>> | null = null;

export function getDatabase(): Promise<IDBPDatabase<KofDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<KofDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('vault')) {
          db.createObjectStore('vault', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences');
        }
        if (!db.objectStoreNames.contains('accounts')) {
          db.createObjectStore('accounts', { keyPath: 'id' });
        }

        // Automatic migration from v1 single-vault to v2 multi-account
        if (oldVersion < 2 && db.objectStoreNames.contains('metadata')) {
          const metaStore = transaction.objectStore('metadata');
          const vaultStore = transaction.objectStore('vault');
          const accountsStore = transaction.objectStore('accounts');

          metaStore.get('default').then((meta) => {
            if (meta) {
              vaultStore.get('entries_blob').then((vaultRecord) => {
                const legacyAccount: UserAccount = {
                  id: 'default',
                  name: 'Mon Kòf',
                  avatarColor: '#FFB400',
                  createdAt: meta.createdAt || Date.now(),
                  lastLoginAt: Date.now(),
                  metadata: meta,
                  vaultPayload: vaultRecord
                    ? vaultRecord.payload
                    : { version: 1, iv: '', ciphertext: '' },
                  preferences: {
                    theme: 'dark',
                    language: 'fr',
                    autoLockMinutes: 5,
                    clearClipboardSeconds: 20,
                  },
                };
                accountsStore.put(legacyAccount);
              });
            }
          });
        }
      },
    });
  }
  return dbPromise;
}

export async function clearAllDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.clear('accounts');
  await db.clear('metadata');
  await db.clear('vault');
  await db.clear('preferences');
}
