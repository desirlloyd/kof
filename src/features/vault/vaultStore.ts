import { create } from 'zustand';
import type { VaultEntry, VaultCategory } from '../../types';
import { encryptData } from '../../core/crypto/aes';
import { updateAccountVault } from '../../core/storage/repository';
import { useAuthStore } from '../auth/authStore';

interface VaultState {
  entries: VaultEntry[];
  searchQuery: string;
  selectedCategory: VaultCategory | 'all' | 'favorites';
  selectedTag: string | null;
  activeEntryId: string | null;
  isEditing: boolean;
  clipboardSecondsLeft: number | null;
  clipboardTimeoutId: ReturnType<typeof setInterval> | null;

  setEntries: (entries: VaultEntry[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: VaultCategory | 'all' | 'favorites') => void;
  setSelectedTag: (tag: string | null) => void;
  setActiveEntryId: (id: string | null) => void;
  setIsEditing: (isEditing: boolean) => void;

  addEntry: (entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateEntry: (id: string, updates: Partial<VaultEntry>) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;

  copyToClipboard: (text: string, clearAfterSeconds?: number) => Promise<void>;
  clearClipboard: () => Promise<void>;
  purge: () => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  entries: [],
  searchQuery: '',
  selectedCategory: 'all',
  selectedTag: null,
  activeEntryId: null,
  isEditing: false,
  clipboardSecondsLeft: null,
  clipboardTimeoutId: null,

  setEntries: (entries) => set({ entries }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedTag: (selectedTag) => set({ selectedTag }),
  setActiveEntryId: (activeEntryId) => set({ activeEntryId }),
  setIsEditing: (isEditing) => set({ isEditing }),

  addEntry: async (entryData) => {
    const auth = useAuthStore.getState();
    const key = auth.cryptoKey;
    const account = auth.currentAccount;
    if (!key || !account) return false;

    const newEntry: VaultEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedEntries = [newEntry, ...get().entries];
    try {
      const payload = await encryptData(JSON.stringify(updatedEntries), key);
      await updateAccountVault(account.id, payload);
      set({ entries: updatedEntries, activeEntryId: newEntry.id, isEditing: false });
      auth.touchActivity();
      return true;
    } catch (err) {
      console.error('Failed to save new entry:', err);
      return false;
    }
  },

  updateEntry: async (id, updates) => {
    const auth = useAuthStore.getState();
    const key = auth.cryptoKey;
    const account = auth.currentAccount;
    if (!key || !account) return false;

    const updatedEntries = get().entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates, updatedAt: Date.now() } : entry,
    );

    try {
      const payload = await encryptData(JSON.stringify(updatedEntries), key);
      await updateAccountVault(account.id, payload);
      set({ entries: updatedEntries, isEditing: false });
      auth.touchActivity();
      return true;
    } catch (err) {
      console.error('Failed to update entry:', err);
      return false;
    }
  },

  deleteEntry: async (id) => {
    const auth = useAuthStore.getState();
    const key = auth.cryptoKey;
    const account = auth.currentAccount;
    if (!key || !account) return false;

    const updatedEntries = get().entries.filter((entry) => entry.id !== id);
    try {
      const payload = await encryptData(JSON.stringify(updatedEntries), key);
      await updateAccountVault(account.id, payload);
      set({
        entries: updatedEntries,
        activeEntryId: get().activeEntryId === id ? null : get().activeEntryId,
      });
      auth.touchActivity();
      return true;
    } catch (err) {
      console.error('Failed to delete entry:', err);
      return false;
    }
  },

  toggleFavorite: async (id) => {
    const entry = get().entries.find((e) => e.id === id);
    if (!entry) return false;
    return get().updateEntry(id, { favorite: !entry.favorite });
  },

  copyToClipboard: async (text: string, clearAfterSeconds = 20) => {
    try {
      await navigator.clipboard.writeText(text);

      const existingTimeout = get().clipboardTimeoutId;
      if (existingTimeout) {
        clearInterval(existingTimeout);
      }

      set({ clipboardSecondsLeft: clearAfterSeconds });

      let remaining = clearAfterSeconds;
      const interval = setInterval(async () => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(interval);
          set({ clipboardSecondsLeft: null, clipboardTimeoutId: null });
          try {
            await navigator.clipboard.writeText('');
          } catch {
            // Ignore clipboard write restrictions on blur
          }
        } else {
          set({ clipboardSecondsLeft: remaining });
        }
      }, 1000);

      set({ clipboardTimeoutId: interval });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  },

  clearClipboard: async () => {
    const existing = get().clipboardTimeoutId;
    if (existing) clearInterval(existing);
    set({ clipboardSecondsLeft: null, clipboardTimeoutId: null });
    try {
      await navigator.clipboard.writeText('');
    } catch {
      // Ignored
    }
  },

  purge: () => {
    const existing = get().clipboardTimeoutId;
    if (existing) clearInterval(existing);
    set({
      entries: [],
      activeEntryId: null,
      isEditing: false,
      clipboardSecondsLeft: null,
      clipboardTimeoutId: null,
    });
  },
}));
