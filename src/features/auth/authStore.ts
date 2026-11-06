import { create } from 'zustand';
import type { VaultMetadata, UserPreferences } from '../../types';
import {
  generateSalt,
  deriveKeyFromPassword,
  PBKDF2_ITERATIONS,
  bufferToBase64,
} from '../../core/crypto/kdf';
import {
  createAuthCheckToken,
  verifyAuthCheckToken,
  encryptData,
  decryptData,
} from '../../core/crypto/aes';
import {
  hasVault,
  getMetadata,
  initVault,
  getEncryptedVaultEntries,
  saveEncryptedVaultEntries,
  updateVaultMetadata,
  wipeVault,
  getPreferences,
  savePreferences,
} from '../../core/storage/repository';
import { useVaultStore } from '../vault/vaultStore';

interface AuthState {
  isInitialized: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  cryptoKey: CryptoKey | null;
  metadata: VaultMetadata | null;
  preferences: UserPreferences;
  lastActivity: number;

  checkStatus: () => Promise<void>;
  setupVault: (masterPassword: string) => Promise<boolean>;
  unlockVault: (masterPassword: string) => Promise<boolean>;
  lockVault: () => void;
  changeMasterPassword: (newMasterPassword: string) => Promise<boolean>;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  touchActivity: () => void;
  wipeAllData: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isInitialized: false,
  isUnlocked: false,
  isLoading: true,
  error: null,
  cryptoKey: null,
  metadata: null,
  preferences: {
    theme: 'dark',
    language: 'fr',
    autoLockMinutes: 5,
    clearClipboardSeconds: 20,
  },
  lastActivity: Date.now(),

  checkStatus: async () => {
    try {
      set({ isLoading: true });
      const initialized = await hasVault();
      const meta = initialized ? await getMetadata() : null;
      const prefs = await getPreferences();

      // Apply initial theme
      if (prefs.theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }

      set({
        isInitialized: initialized,
        metadata: meta || null,
        preferences: prefs,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to check vault status:', err);
      set({ isLoading: false, error: 'Database check failed' });
    }
  },

  setupVault: async (masterPassword: string) => {
    try {
      set({ isLoading: true, error: null });
      const salt = generateSalt();
      const key = await deriveKeyFromPassword(masterPassword, salt, PBKDF2_ITERATIONS);
      const authCheck = await createAuthCheckToken(key);

      const metadata: VaultMetadata = {
        id: 'default',
        version: 1,
        salt: bufferToBase64(salt),
        iterations: PBKDF2_ITERATIONS,
        authCheck,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Initial empty entries list encrypted
      const emptyPayload = await encryptData(JSON.stringify([]), key);
      await initVault(metadata, emptyPayload);

      set({
        isInitialized: true,
        isUnlocked: true,
        cryptoKey: key,
        metadata,
        isLoading: false,
        lastActivity: Date.now(),
      });

      useVaultStore.getState().setEntries([]);
      return true;
    } catch (err) {
      console.error('Error creating vault:', err);
      set({ isLoading: false, error: 'Erreur lors de la création du coffre' });
      return false;
    }
  },

  unlockVault: async (masterPassword: string) => {
    try {
      set({ isLoading: true, error: null });
      const meta = get().metadata || (await getMetadata());
      if (!meta) {
        set({ isLoading: false, error: 'Aucun coffre trouvé' });
        return false;
      }

      const key = await deriveKeyFromPassword(masterPassword, meta.salt, meta.iterations);
      const isValid = await verifyAuthCheckToken(meta.authCheck, key);

      if (!isValid) {
        set({
          isLoading: false,
          error: 'auth.unlockError',
        });
        return false;
      }

      // Load encrypted vault entries
      const encryptedPayload = await getEncryptedVaultEntries();
      let entries = [];
      if (encryptedPayload) {
        const decryptedJson = await decryptData(encryptedPayload, key);
        entries = JSON.parse(decryptedJson);
      }

      useVaultStore.getState().setEntries(entries);

      set({
        isUnlocked: true,
        cryptoKey: key,
        metadata: meta,
        isLoading: false,
        lastActivity: Date.now(),
        error: null,
      });
      return true;
    } catch (err) {
      console.error('Error unlocking vault:', err);
      set({
        isLoading: false,
        error: 'auth.unlockError',
      });
      return false;
    }
  },

  lockVault: () => {
    // Purge sensitive memory data immediately
    useVaultStore.getState().purge();
    set({
      isUnlocked: false,
      cryptoKey: null,
      lastActivity: Date.now(),
    });
  },

  changeMasterPassword: async (newMasterPassword: string) => {
    const { cryptoKey, metadata } = get();
    if (!cryptoKey || !metadata) return false;

    try {
      set({ isLoading: true });
      const currentEntries = useVaultStore.getState().entries;

      const newSalt = generateSalt();
      const newKey = await deriveKeyFromPassword(
        newMasterPassword,
        newSalt,
        PBKDF2_ITERATIONS,
      );
      const newAuthCheck = await createAuthCheckToken(newKey);

      const newMetadata: VaultMetadata = {
        ...metadata,
        salt: bufferToBase64(newSalt),
        authCheck: newAuthCheck,
        updatedAt: Date.now(),
      };

      const newEncryptedPayload = await encryptData(JSON.stringify(currentEntries), newKey);

      await saveEncryptedVaultEntries(newEncryptedPayload);
      await updateVaultMetadata(newMetadata);

      set({
        cryptoKey: newKey,
        metadata: newMetadata,
        isLoading: false,
        lastActivity: Date.now(),
      });
      return true;
    } catch (err) {
      console.error('Error changing master password:', err);
      set({ isLoading: false, error: 'Échec du changement de mot de passe' });
      return false;
    }
  },

  updateUserPreferences: async (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...get().preferences, ...newPrefs };
    await savePreferences(updated);

    if (newPrefs.theme) {
      if (newPrefs.theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    }

    set({ preferences: updated });
  },

  touchActivity: () => {
    set({ lastActivity: Date.now() });
  },

  wipeAllData: async () => {
    await wipeVault();
    useVaultStore.getState().purge();
    set({
      isInitialized: false,
      isUnlocked: false,
      cryptoKey: null,
      metadata: null,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
