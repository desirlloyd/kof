import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Lock,
  Settings,
  Sparkles,
  ShieldCheck,
  Star,
  Globe,
  CreditCard,
  FileText,
  Server,
  UserCheck,
  ClipboardCopy,
  FolderLock,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useAuthStore } from '../auth/authStore';
import { useVaultStore } from './vaultStore';
import { EntryCard } from './EntryCard';
import { EntryDetailView } from './EntryDetailView';
import { EntryFormModal } from './EntryFormModal';
import { GeneratorModal } from '../generator/GeneratorModal';
import { SettingsModal } from '../settings/SettingsModal';
import { AuditView } from '../audit/AuditView';
import { Button } from '../../components/ui/Button';
import { TiKof } from '../../components/mascot/TiKof';
import { runSecurityAudit } from '../audit/auditService';
import type { VaultEntry } from '../../types';

export const DashboardView: React.FC = () => {
  const { t } = useTranslation();
  const { lockVault, touchActivity, preferences, lastActivity } = useAuthStore();
  const {
    entries,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    activeEntryId,
    setActiveEntryId,
    clipboardSecondsLeft,
  } = useVaultStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<VaultEntry | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'vault' | 'audit'>('vault');

  // Inactivity auto-lock and activity tracker
  useEffect(() => {
    const handleActivity = () => touchActivity();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    // Emergency quick lock shortcut: Ctrl+Shift+L
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        lockVault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const interval = setInterval(() => {
      if (preferences.autoLockMinutes > 0) {
        const timeoutMs = preferences.autoLockMinutes * 60 * 1000;
        if (Date.now() - lastActivity > timeoutMs) {
          lockVault();
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, [preferences.autoLockMinutes, lastActivity, touchActivity, lockVault]);

  // Extract unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((e) => e.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Category filter
      if (selectedCategory === 'favorites' && !entry.favorite) return false;
      if (
        selectedCategory !== 'all' &&
        selectedCategory !== 'favorites' &&
        entry.category !== selectedCategory
      ) {
        return false;
      }

      // Tag filter
      if (selectedTag && (!entry.tags || !entry.tags.includes(selectedTag))) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = entry.title.toLowerCase().includes(q);
        const matchUser = entry.username?.toLowerCase().includes(q);
        const matchUrl = entry.url?.toLowerCase().includes(q);
        const matchTags = entry.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchUser && !matchUrl && !matchTags) return false;
      }

      return true;
    });
  }, [entries, selectedCategory, selectedTag, searchQuery]);

  // Active entry
  const activeEntry = useMemo(
    () => entries.find((e) => e.id === activeEntryId) || null,
    [entries, activeEntryId],
  );

  const audit = useMemo(() => runSecurityAudit(entries), [entries]);

  const handleCreateNew = () => {
    setEntryToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditEntry = (entry: VaultEntry) => {
    setEntryToEdit(entry);
    setIsFormOpen(true);
  };

  const handleFixFromAudit = (id: string) => {
    setCurrentView('vault');
    setActiveEntryId(id);
    const target = entries.find((e) => e.id === id);
    if (target) handleEditEntry(target);
  };

  const categories = [
    { id: 'all' as const, label: t('vault.allEntries'), icon: FolderLock },
    { id: 'favorites' as const, label: t('vault.favorites'), icon: Star },
    { id: 'login' as const, label: t('vault.categories.login'), icon: Globe },
    { id: 'card' as const, label: t('vault.categories.card'), icon: CreditCard },
    { id: 'note' as const, label: t('vault.categories.note'), icon: FileText },
    { id: 'server' as const, label: t('vault.categories.server'), icon: Server },
    { id: 'identity' as const, label: t('vault.categories.identity'), icon: UserCheck },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#0E1020] text-[#FFF6E5] flex flex-col font-sans select-none">
      {/* Top Clipboard Countdown Notice */}
      <AnimatePresence>
        {clipboardSecondsLeft !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#FFB400] text-[#0E1020] px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-2 overflow-hidden shadow-md sticky top-0 z-40"
          >
            <ClipboardCopy className="w-4 h-4 animate-bounce shrink-0" />
            <span className="truncate">
              {t('vault.clipboardTimer', { seconds: clipboardSecondsLeft })}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navbar */}
      <header className="h-14 sm:h-16 border-b-2 border-[#2D3357] bg-[#171A30] px-3 sm:px-6 md:px-8 flex items-center justify-between gap-3 sticky top-0 z-30">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <TiKof mood="happy" size="sm" />
          <div className="leading-tight">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#FFF6E5]">
              Kòf
            </h1>
            <p className="text-[10px] text-[#FFB400] font-semibold hidden sm:block">
              {t('app.tagline')}
            </p>
          </div>
        </div>

        {/* Desktop Global Search Bar */}
        <div className="max-w-md w-full relative hidden md:block">
          <Search className="w-4 h-4 text-[#A9ABC4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('vault.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E1020] border-2 border-[#2D3357] text-[#FFF6E5] placeholder-[#A9ABC4]/60 rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-[#FFB400]"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Desktop Health Pill Button */}
          <button
            onClick={() => setCurrentView(currentView === 'vault' ? 'audit' : 'vault')}
            className={`hidden md:flex px-3 py-1.5 rounded-xl border-2 text-xs font-bold items-center gap-1.5 transition-all ${
              currentView === 'audit'
                ? 'border-[#B6F23A] bg-[#B6F23A]/20 text-[#B6F23A]'
                : 'border-[#2D3357] bg-[#20243F] text-[#FFF6E5] hover:border-[#B6F23A]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#B6F23A]" />
            <span>{t('audit.title')}</span>
            <span className="font-mono text-[#B6F23A]">{audit.score}%</span>
          </button>

          {/* Desktop Generator Button */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsGeneratorOpen(true)}
            className="hidden lg:inline-flex"
            icon={<Sparkles className="w-4 h-4 text-[#FFB400]" />}
          >
            <span>{t('generator.title')}</span>
          </Button>

          {/* New Entry Button (Desktop + Mobile) */}
          <Button
            size="sm"
            variant="primary"
            onClick={handleCreateNew}
            icon={<Plus className="w-4 h-4" />}
            className="h-9 px-3 text-xs sm:text-sm font-bold"
          >
            <span className="hidden sm:inline">{t('vault.newEntry')}</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>

          {/* Desktop Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hidden md:flex p-2 text-[#A9ABC4] hover:text-[#FFF6E5] rounded-xl hover:bg-[#20243F] transition-colors"
            title={t('settings.title')}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Lock Button */}
          <button
            onClick={lockVault}
            className="p-2 text-[#FF4D6D] hover:bg-[#FF4D6D]/15 rounded-xl transition-colors active:scale-95"
            title="Verrouiller (Ctrl+Shift+L)"
            aria-label="Verrouiller"
          >
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Search & Category Chips Strip (Only on Vault view) */}
      {currentView === 'vault' && (
        <div className="md:hidden bg-[#171A30] border-b border-[#2D3357] px-3 pt-2 pb-2.5 space-y-2 sticky top-14 sm:top-16 z-20">
          {/* Mobile Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#A9ABC4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('vault.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0E1020] border-2 border-[#2D3357] text-[#FFF6E5] placeholder-[#A9ABC4]/60 rounded-xl pl-9 pr-8 py-2 text-xs outline-none focus:border-[#FFB400]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A9ABC4] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontally Scrollable Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count =
                cat.id === 'all'
                  ? entries.length
                  : cat.id === 'favorites'
                  ? entries.filter((e) => e.favorite).length
                  : entries.filter((e) => e.category === cat.id).length;
              const isSelected = selectedCategory === cat.id && !selectedTag;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedTag(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border-2 transition-all ${
                    isSelected
                      ? 'border-[#FFB400] bg-[#FFB400]/20 text-[#FFB400]'
                      : 'border-[#2D3357] bg-[#20243F] text-[#A9ABC4]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span className="text-[10px] font-mono opacity-80">({count})</span>
                </button>
              );
            })}

            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap shrink-0 border-2 transition-all ${
                  selectedTag === tag
                    ? 'border-[#FF4D6D] bg-[#FF4D6D]/20 text-[#FF4D6D]'
                    : 'border-[#2D3357] bg-[#20243F] text-[#A9ABC4]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden pb-16 md:pb-0">
        {/* Desktop Sidebar */}
        <aside className="w-64 border-r-2 border-[#2D3357] bg-[#171A30] p-4 flex flex-col gap-6 hidden md:flex shrink-0 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTag(null);
                setCurrentView('vault');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'all' && !selectedTag && currentView === 'vault'
                  ? 'bg-[#FFB400] text-[#0E1020]'
                  : 'text-[#A9ABC4] hover:text-[#FFF6E5] hover:bg-[#20243F]'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderLock className="w-4 h-4" />
                <span>{t('vault.allEntries')}</span>
              </div>
              <span className="font-mono text-xs">{entries.length}</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('favorites');
                setSelectedTag(null);
                setCurrentView('vault');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'favorites' && currentView === 'vault'
                  ? 'bg-[#FFB400] text-[#0E1020]'
                  : 'text-[#A9ABC4] hover:text-[#FFF6E5] hover:bg-[#20243F]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>{t('vault.favorites')}</span>
              </div>
              <span className="font-mono text-xs">
                {entries.filter((e) => e.favorite).length}
              </span>
            </button>
          </div>

          {/* Categories */}
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#A9ABC4]/60 px-3 block mb-2">
              {t('vault.category')}
            </span>
            <div className="space-y-1">
              {(
                [
                  { id: 'login', icon: Globe },
                  { id: 'card', icon: CreditCard },
                  { id: 'note', icon: FileText },
                  { id: 'server', icon: Server },
                  { id: 'identity', icon: UserCheck },
                ] as const
              ).map((cat) => {
                const Icon = cat.icon;
                const count = entries.filter((e) => e.category === cat.id).length;
                const isSelected = selectedCategory === cat.id && currentView === 'vault';
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedTag(null);
                      setCurrentView('vault');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#19D3C5] text-[#0E1020]'
                        : 'text-[#A9ABC4] hover:text-[#FFF6E5] hover:bg-[#20243F]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{t(`vault.categories.${cat.id}`)}</span>
                    </div>
                    <span className="font-mono text-xs">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#A9ABC4]/60 px-3 block mb-2">
                Tags
              </span>
              <div className="flex flex-wrap gap-1.5 px-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(selectedTag === tag ? null : tag);
                      setCurrentView('vault');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                      selectedTag === tag
                        ? 'bg-[#FF4D6D] text-white border-[#FF4D6D]'
                        : 'bg-[#20243F] text-[#A9ABC4] border-[#2D3357] hover:border-[#FFF6E5]'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* View Content (Vault or Audit) */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto tap-bg-pattern">
          {currentView === 'audit' ? (
            <AuditView onSelectEntryToFix={handleFixFromAudit} />
          ) : (
            <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              {/* Left Column: Entries List */}
              <div
                className={`flex flex-col gap-3 ${
                  activeEntry ? 'hidden lg:flex lg:col-span-5 xl:col-span-4' : 'col-span-12'
                }`}
              >
                {/* Active Category Title & Count */}
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm sm:text-base font-extrabold text-[#FFF6E5] uppercase tracking-wide truncate">
                    {selectedCategory === 'all'
                      ? t('vault.allEntries')
                      : selectedCategory === 'favorites'
                      ? t('vault.favorites')
                      : t(`vault.categories.${selectedCategory}`)}
                    {selectedTag && ` (#${selectedTag})`}
                  </h2>
                  <span className="text-xs font-mono font-bold text-[#FFB400] shrink-0">
                    {filteredEntries.length} {filteredEntries.length > 1 ? 'secrets' : 'secret'}
                  </span>
                </div>

                {/* Empty State */}
                {filteredEntries.length === 0 ? (
                  <div className="p-6 sm:p-8 bg-[#171A30] border-2 border-[#2D3357] rounded-3xl tap-shadow-solid flex flex-col items-center justify-center text-center my-auto min-h-[300px]">
                    <TiKof
                      mood="worried"
                      size="md"
                      bubbleText={t('mascot.empty')}
                    />
                    <h3 className="text-base sm:text-lg font-bold text-[#FFF6E5] mt-4">
                      {t('vault.noEntries')}
                    </h3>
                    <p className="text-xs text-[#A9ABC4] mt-1 max-w-xs">
                      {t('vault.noEntriesHint')}
                    </p>
                    <Button
                      variant="primary"
                      size="md"
                      className="mt-5"
                      onClick={handleCreateNew}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      {t('vault.newEntry')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5 sm:space-y-3 overflow-y-auto">
                    {filteredEntries.map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        isSelected={entry.id === activeEntryId}
                        onSelect={() => setActiveEntryId(entry.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Entry Detail */}
              {activeEntry ? (
                <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col h-full">
                  {/* Mobile Back Button to Entry List */}
                  <div className="lg:hidden mb-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setActiveEntryId(null)}
                      icon={<ArrowLeft className="w-4 h-4" />}
                      className="w-full justify-start text-xs font-bold py-2.5"
                    >
                      Retour aux secrets
                    </Button>
                  </div>
                  <EntryDetailView
                    entry={activeEntry}
                    onEdit={() => handleEditEntry(activeEntry)}
                    onClose={() => setActiveEntryId(null)}
                  />
                </div>
              ) : (
                <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 items-center justify-center p-8 bg-[#171A30]/50 border-2 border-dashed border-[#2D3357] rounded-3xl text-center">
                  <div className="flex flex-col items-center">
                    <TiKof mood="sleeping" size="md" />
                    <p className="text-sm font-semibold text-[#A9ABC4] mt-3">
                      Sélectionne un secret pour afficher ses détails en toute sécurité.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (Thumb Zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#171A30] border-t-2 border-[#2D3357] px-3 flex items-center justify-around z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.4)]">
        {/* Tab 1: Secrets */}
        <button
          onClick={() => {
            setCurrentView('vault');
            setActiveEntryId(null);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[48px] rounded-xl transition-all ${
            currentView === 'vault'
              ? 'text-[#FFB400]'
              : 'text-[#A9ABC4] hover:text-[#FFF6E5]'
          }`}
        >
          <FolderLock className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-0.5">Secrets</span>
        </button>

        {/* Tab 2: Santé */}
        <button
          onClick={() => setCurrentView('audit')}
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[48px] rounded-xl relative transition-all ${
            currentView === 'audit'
              ? 'text-[#B6F23A]'
              : 'text-[#A9ABC4] hover:text-[#FFF6E5]'
          }`}
        >
          <div className="relative">
            <ShieldCheck className="w-5 h-5" />
            <span className="absolute -top-1 -right-3 text-[9px] font-mono font-bold bg-[#B6F23A] text-[#0E1020] px-1 rounded-full">
              {audit.score}%
            </span>
          </div>
          <span className="text-[11px] font-bold mt-0.5">{t('audit.title')}</span>
        </button>

        {/* Tab 3: Générateur */}
        <button
          onClick={() => setIsGeneratorOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 min-h-[48px] rounded-xl text-[#A9ABC4] hover:text-[#19D3C5] transition-all"
        >
          <Sparkles className="w-5 h-5 text-[#19D3C5]" />
          <span className="text-[11px] font-bold mt-0.5">Clés</span>
        </button>

        {/* Tab 4: Paramètres */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 min-h-[48px] rounded-xl text-[#A9ABC4] hover:text-[#FFF6E5] transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-0.5">{t('settings.title')}</span>
        </button>
      </nav>

      {/* Modals with responsive mobile behavior */}
      <EntryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        entryToEdit={entryToEdit}
      />

      <GeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
