import { create } from 'zustand';
import type {
  UserAccount,
  AccountSummary,
  VaultMetadata,
  UserPreferences,
} from '../../types';
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
  getAllAccounts,
  getAccount,
  saveAccount,
  deleteAccount,
  updateAccountVault,
  updateAccountMetadata,
  updateAccountPreferences,
  getStoredActiveAccountId,
  setStoredActiveAccountId,
  wipeAllData,
  DEFAULT_PREFERENCES,
} from '../../core/storage/repository';
import { useVaultStore } from '../vault/vaultStore';

interface AuthState {
  accounts: AccountSummary[];
  selectedAccount: AccountSummary | null;
  currentAccount: UserAccount | null;
  isCreatingNewAccount: boolean;
  isInitialized: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  cryptoKey: CryptoKey | null;
  metadata: VaultMetadata | null;
  preferences: UserPreferences;
  lastActivity: number;

  checkStatus: () => Promise<void>;
  setSelectedAccount: (account: AccountSummary | null) => void;
  setIsCreatingNewAccount: (isCreating: boolean) => void;
  createAccount: (name: string, masterPassword: string, avatarColor?: string) => Promise<boolean>;
  unlockVault: (masterPassword: string) => Promise<boolean>;
  lockVault: () => void;
  switchAccount: () => void;
  renameAccount: (newName: string) => Promise<boolean>;
  deleteCurrentAccount: () => Promise<boolean>;
  changeMasterPassword: (newMasterPassword: string) => Promise<boolean>;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  touchActivity: () => void;
  wipeEverything: () => Promise<void>;
  clearError: () => void;
}

const AVATAR_COLORS = ['#FFB400', '#19D3C5', '#FF4D6D', '#B6F23A', '#A78BFA'];

export const useAuthStore = create<AuthState>((set, get) => ({
  accounts: [],
  selectedAccount: null,
  currentAccount: null,
  isCreatingNewAccount: false,
  isInitialized: false,
  isUnlocked: false,
  isLoading: true,
  error: null,
  cryptoKey: null,
  metadata: null,
  preferences: DEFAULT_PREFERENCES,
  lastActivity: Date.now(),

  checkStatus: async () => {
    try {
      set({ isLoading: true });
      const accounts = await getAllAccounts();
      const lastActiveId = getStoredActiveAccountId();
      const selected = accounts.find((a) => a.id === lastActiveId) || accounts[0] || null;

      const isInitialized = accounts.length > 0;

      // Apply initial theme
      const currentPrefs = DEFAULT_PREFERENCES;
      if (currentPrefs.theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }

      set({
        accounts,
        selectedAccount: selected,
        isInitialized,
        isCreatingNewAccount: !isInitialized,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to check accounts status:', err);
      set({ isLoading: false, error: 'Database check failed' });
    }
  },

  setSelectedAccount: (account) => {
    if (account) setStoredActiveAccountId(account.id);
    set({ selectedAccount: account, isCreatingNewAccount: false, error: null });
  },

  setIsCreatingNewAccount: (isCreating) => {
    set({ isCreatingNewAccount: isCreating, error: null });
  },

  createAccount: async (name, masterPassword, customColor) => {
    try {
      set({ isLoading: true, error: null });

      const salt = generateSalt();
      const key = await deriveKeyFromPassword(masterPassword, salt, PBKDF2_ITERATIONS);
      const authCheck = await createAuthCheckToken(key);

      const accountId = crypto.randomUUID();
      const metadata: VaultMetadata = {
        id: accountId,
        version: 1,
        salt: bufferToBase64(salt),
        iterations: PBKDF2_ITERATIONS,
        authCheck,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const emptyPayload = await encryptData(JSON.stringify([]), key);

      const randomColor =
        customColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

      const newAccount: UserAccount = {
        id: accountId,
        name: name.trim() || 'Mon Kòf',
        avatarColor: randomColor,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        metadata,
        vaultPayload: emptyPayload,
        preferences: DEFAULT_PREFERENCES,
      };

      await saveAccount(newAccount);
      setStoredActiveAccountId(accountId);

      const updatedAccounts = await getAllAccounts();
      const summary = updatedAccounts.find((a) => a.id === accountId) || null;

      useVaultStore.getState().setEntries([]);

      set({
        accounts: updatedAccounts,
        selectedAccount: summary,
        currentAccount: newAccount,
        isInitialized: true,
        isUnlocked: true,
        isCreatingNewAccount: false,
        cryptoKey: key,
        metadata,
        preferences: newAccount.preferences,
        isLoading: false,
        lastActivity: Date.now(),
      });

      return true;
    } catch (err) {
      console.error('Error creating account:', err);
      set({ isLoading: false, error: 'Erreur lors de la création du compte' });
      return false;
    }
  },

  unlockVault: async (masterPassword) => {
    try {
      set({ isLoading: true, error: null });
      const { selectedAccount } = get();
      if (!selectedAccount) {
        set({ isLoading: false, error: 'Aucun compte sélectionné' });
        return false;
      }

      const account = await getAccount(selectedAccount.id);
      if (!account) {
        set({ isLoading: false, error: 'Compte introuvable' });
        return false;
      }

      const key = await deriveKeyFromPassword(
        masterPassword,
        account.metadata.salt,
        account.metadata.iterations,
      );

      const isValid = await verifyAuthCheckToken(account.metadata.authCheck, key);

      if (!isValid) {
        set({
          isLoading: false,
          error: 'auth.unlockError',
        });
        return false;
      }

      // Decrypt entries
      let entries = [];
      if (account.vaultPayload && account.vaultPayload.ciphertext) {
        const decryptedJson = await decryptData(account.vaultPayload, key);
        entries = JSON.parse(decryptedJson);
      }

      useVaultStore.getState().setEntries(entries);
      setStoredActiveAccountId(account.id);

      // Update theme from account prefs
      if (account.preferences.theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }

      set({
        currentAccount: account,
        metadata: account.metadata,
        preferences: account.preferences || DEFAULT_PREFERENCES,
        isUnlocked: true,
        cryptoKey: key,
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
    useVaultStore.getState().purge();
    set({
      isUnlocked: false,
      cryptoKey: null,
      lastActivity: Date.now(),
    });
  },

  switchAccount: () => {
    useVaultStore.getState().purge();
    set({
      isUnlocked: false,
      cryptoKey: null,
      currentAccount: null,
      error: null,
    });
  },

  renameAccount: async (newName) => {
    const { currentAccount } = get();
    if (!currentAccount) return false;

    const trimmed = newName.trim();
    if (!trimmed) return false;

    const updated: UserAccount = { ...currentAccount, name: trimmed };
    await saveAccount(updated);

    const accounts = await getAllAccounts();
    const summary = accounts.find((a) => a.id === updated.id) || null;

    set({
      currentAccount: updated,
      selectedAccount: summary,
      accounts,
    });
    return true;
  },

  deleteCurrentAccount: async () => {
    const { currentAccount } = get();
    if (!currentAccount) return false;

    await deleteAccount(currentAccount.id);
    useVaultStore.getState().purge();

    const accounts = await getAllAccounts();
    const nextSelected = accounts[0] || null;

    set({
      accounts,
      selectedAccount: nextSelected,
      currentAccount: null,
      isUnlocked: false,
      cryptoKey: null,
      isInitialized: accounts.length > 0,
      isCreatingNewAccount: accounts.length === 0,
      error: null,
    });

    return true;
  },

  changeMasterPassword: async (newMasterPassword) => {
    const { cryptoKey, currentAccount } = get();
    if (!cryptoKey || !currentAccount) return false;

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
        ...currentAccount.metadata,
        salt: bufferToBase64(newSalt),
        authCheck: newAuthCheck,
        updatedAt: Date.now(),
      };

      const newEncryptedPayload = await encryptData(JSON.stringify(currentEntries), newKey);

      await updateAccountVault(currentAccount.id, newEncryptedPayload);
      await updateAccountMetadata(currentAccount.id, newMetadata);

      const updatedAccount: UserAccount = {
        ...currentAccount,
        metadata: newMetadata,
        vaultPayload: newEncryptedPayload,
      };

      set({
        cryptoKey: newKey,
        metadata: newMetadata,
        currentAccount: updatedAccount,
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

  updateUserPreferences: async (newPrefs) => {
    const { currentAccount, preferences } = get();
    const updated = { ...preferences, ...newPrefs };

    if (currentAccount) {
      await updateAccountPreferences(currentAccount.id, updated);
      set({
        preferences: updated,
        currentAccount: { ...currentAccount, preferences: updated },
      });
    } else {
      set({ preferences: updated });
    }

    if (newPrefs.theme) {
      if (newPrefs.theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    }
  },

  touchActivity: () => {
    set({ lastActivity: Date.now() });
  },

  wipeEverything: async () => {
    await wipeAllData();
    useVaultStore.getState().purge();
    set({
      accounts: [],
      selectedAccount: null,
      currentAccount: null,
      isInitialized: false,
      isUnlocked: false,
      isCreatingNewAccount: true,
      cryptoKey: null,
      metadata: null,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
