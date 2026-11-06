import { openDB, type IDBPDatabase } from 'idb';
import type { VaultMetadata, EncryptedPayload, UserPreferences } from '../../types';

const DB_NAME = 'kof_db_v1';
const DB_VERSION = 1;

export interface KofDBSchema {
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
      upgrade(db) {
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('vault')) {
          db.createObjectStore('vault', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences');
        }
      },
    });
  }
  return dbPromise;
}

export async function clearAllDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.clear('metadata');
  await db.clear('vault');
  await db.clear('preferences');
}
