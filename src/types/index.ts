export type VaultCategory = 'login' | 'card' | 'note' | 'server' | 'identity';

export interface VaultEntry {
  id: string;
  title: string;
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
  category: VaultCategory;
  tags: string[];
  favorite: boolean;
  totpSecret?: string;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
}

export interface EncryptedPayload {
  version: number;
  iv: string; // Base64
  ciphertext: string; // Base64
}

export interface VaultMetadata {
  id: string;
  version: number;
  salt: string; // Base64 16 bytes
  iterations: number; // >= 600,000
  authCheck: EncryptedPayload; // Known token encrypted with derived key
  createdAt: number;
  updatedAt: number;
}

export interface UserPreferences {
  theme: AppTheme;
  language: AppLanguage;
  autoLockMinutes: number; // default 5, 0 = disabled
  clearClipboardSeconds: number; // default 20
}

export interface UserAccount {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: number;
  lastLoginAt?: number;
  metadata: VaultMetadata;
  vaultPayload: EncryptedPayload;
  preferences: UserPreferences;
}

export interface AccountSummary {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: number;
  lastLoginAt?: number;
}

export interface SecurityScoreItem {
  type: 'weak' | 'reused' | 'old' | 'missing-2fa';
  entryId: string;
  title: string;
  reason: string;
}

export interface SecurityAuditResult {
  score: number; // 0 to 100
  total: number;
  weakCount: number;
  reusedCount: number;
  oldCount: number;
  duplicates: Map<string, string[]>;
  issues: SecurityScoreItem[];
}

export type MascotMood = 'neutral' | 'happy' | 'worried' | 'sleeping';

export type AppTheme = 'dark' | 'light';
export type AppLanguage = 'fr' | 'ht' | 'en';
