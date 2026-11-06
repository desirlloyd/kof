import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  X,
  Moon,
  Sun,
  Languages,
  Clock,
  KeyRound,
  Download,
  Upload,
  AlertOctagon,
} from 'lucide-react';
import { useAuthStore } from '../auth/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { exportEncryptedBackup, parseAndImportCsv } from './exportImportService';
import type { AppTheme, AppLanguage } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { preferences, updateUserPreferences, changeMasterPassword, wipeAllData } =
    useAuthStore();

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'backup'>('general');

  // Change master password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Import state
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleLanguageChange = async (lang: AppLanguage) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('kof_language', lang);
    await updateUserPreferences({ language: lang });
  };

  const handleThemeToggle = async (theme: AppTheme) => {
    await updateUserPreferences({ theme });
  };

  const handleAutoLockChange = async (minutes: number) => {
    await updateUserPreferences({ autoLockMinutes: minutes });
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 8) {
      setPasswordStatus('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus(t('auth.passwordMismatch'));
      return;
    }

    setIsChangingPassword(true);
    const success = await changeMasterPassword(newPassword);
    setIsChangingPassword(false);

    if (success) {
      setPasswordStatus('Mot de passe maître mis à jour avec succès.');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus('Erreur lors de la mise à jour.');
    }
  };

  const handleExport = async () => {
    await exportEncryptedBackup();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const count = await parseAndImportCsv(text);
      setImportStatus(`${count} comptes importés avec succès !`);
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleWipe = async () => {
    if (window.confirm(t('settings.wipeConfirm'))) {
      await wipeAllData();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-2xl bg-[#171A30] border-2 border-[#2D3357] rounded-3xl p-6 md:p-8 tap-shadow-solid my-8 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2D3357] mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#FFF6E5]">
                {t('settings.title')}
              </h2>
              <button
                onClick={onClose}
                className="text-[#A9ABC4] hover:text-[#FFF6E5] p-2 rounded-xl hover:bg-[#20243F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#0E1020] p-1 rounded-2xl border border-[#2D3357] mb-6">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'general'
                    ? 'bg-[#FFB400] text-[#0E1020]'
                    : 'text-[#A9ABC4] hover:text-[#FFF6E5]'
                }`}
              >
                Général
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'security'
                    ? 'bg-[#19D3C5] text-[#0E1020]'
                    : 'text-[#A9ABC4] hover:text-[#FFF6E5]'
                }`}
              >
                Sécurité
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'backup'
                    ? 'bg-[#FF4D6D] text-[#0E1020]'
                    : 'text-[#A9ABC4] hover:text-[#FFF6E5]'
                }`}
              >
                Sauvegarde
              </button>
            </div>

            {/* Tab 1: Général */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Langue */}
                <div className="p-4 bg-[#20243F] border border-[#2D3357] rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Languages className="w-5 h-5 text-[#FFB400]" />
                    <h3 className="font-bold text-sm text-[#FFF6E5]">
                      {t('settings.language')}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'fr', label: 'Français' },
                      { code: 'ht', label: 'Kreyòl Ayisyen' },
                      { code: 'en', label: 'English' },
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleLanguageChange(l.code as AppLanguage)}
                        className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          i18n.language === l.code
                            ? 'border-[#FFB400] bg-[#FFB400]/20 text-[#FFB400]'
                            : 'border-[#2D3357] bg-[#171A30] text-[#A9ABC4] hover:text-[#FFF6E5]'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thème */}
                <div className="p-4 bg-[#20243F] border border-[#2D3357] rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-5 h-5 text-[#19D3C5]" />
                    <h3 className="font-bold text-sm text-[#FFF6E5]">
                      {t('settings.theme')}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleThemeToggle('dark')}
                      className={`p-3 rounded-xl text-xs font-bold border-2 flex items-center justify-center gap-2 transition-all ${
                        preferences.theme === 'dark'
                          ? 'border-[#19D3C5] bg-[#19D3C5]/20 text-[#19D3C5]'
                          : 'border-[#2D3357] bg-[#171A30] text-[#A9ABC4]'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      {t('settings.themeDark')}
                    </button>
                    <button
                      onClick={() => handleThemeToggle('light')}
                      className={`p-3 rounded-xl text-xs font-bold border-2 flex items-center justify-center gap-2 transition-all ${
                        preferences.theme === 'light'
                          ? 'border-[#FFB400] bg-[#FFB400]/20 text-[#FFB400]'
                          : 'border-[#2D3357] bg-[#171A30] text-[#A9ABC4]'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      {t('settings.themeLight')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Sécurité */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Verrouillage Auto */}
                <div className="p-4 bg-[#20243F] border border-[#2D3357] rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-[#FFB400]" />
                    <h3 className="font-bold text-sm text-[#FFF6E5]">
                      {t('settings.autoLock')}
                    </h3>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 5, 15, 0].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleAutoLockChange(mins)}
                        className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          preferences.autoLockMinutes === mins
                            ? 'border-[#FFB400] bg-[#FFB400]/20 text-[#FFB400]'
                            : 'border-[#2D3357] bg-[#171A30] text-[#A9ABC4]'
                        }`}
                      >
                        {mins === 0 ? t('settings.autoLockNever') : `${mins} min`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Changer le mot de passe maître */}
                <form
                  onSubmit={handleChangePasswordSubmit}
                  className="p-4 bg-[#20243F] border border-[#2D3357] rounded-2xl space-y-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <KeyRound className="w-5 h-5 text-[#19D3C5]" />
                    <h3 className="font-bold text-sm text-[#FFF6E5]">
                      {t('settings.changePassword')}
                    </h3>
                  </div>

                  <Input
                    type="password"
                    placeholder="Nouveau mot de passe maître..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    isMono
                    required
                  />

                  <Input
                    type="password"
                    placeholder="Confirmer le nouveau mot de passe..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    isMono
                    required
                  />

                  {passwordStatus && (
                    <p className="text-xs text-[#FFB400] font-medium">
                      {passwordStatus}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="turquoise"
                    isLoading={isChangingPassword}
                    className="w-full mt-2"
                  >
                    Sauvegarder le nouveau mot de passe
                  </Button>
                </form>
              </div>
            )}

            {/* Tab 3: Sauvegarde & Danger */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                {/* Export .kof */}
                <div className="p-4 bg-[#20243F] border border-[#2D3357] rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#FFF6E5]">
                      {t('settings.exportTitle')}
                    </h3>
                    <p className="text-xs text-[#A9ABC4] mt-1">
                      {t('settings.exportDesc')}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleExport}
                    icon={<Download className="w-4 h-4" />}
                  >
                    {t('settings.exportBtn')}
                  </Button>
                </div>

                {/* Import CSV */}
                <div className="p-4 bg-[#20243F] border border-[#2D3357] rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#FFF6E5]">
                      {t('settings.importTitle')}
                    </h3>
                    <p className="text-xs text-[#A9ABC4] mt-1">
                      Importe depuis Chrome, Bitwarden ou 1Password.
                    </p>
                    {importStatus && (
                      <p className="text-xs text-[#B6F23A] font-semibold mt-1">
                        {importStatus}
                      </p>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#19D3C5] text-[#0E1020] hover:bg-[#20e2d4] shadow-[4px_4px_0px_#171A30] cursor-pointer gap-2">
                      <Upload className="w-4 h-4" />
                      <span>{t('settings.importCsvBtn')}</span>
                    </span>
                  </label>
                </div>

                {/* Zone de Danger */}
                <div className="p-4 bg-[#FF4D6D]/10 border-2 border-[#FF4D6D] rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-[#FF4D6D]" />
                    <h3 className="font-bold text-sm text-[#FF4D6D]">
                      {t('settings.dangerZone')}
                    </h3>
                  </div>
                  <p className="text-xs text-[#FFF6E5]/80 leading-relaxed">
                    {t('settings.wipeConfirm')}
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleWipe}
                    className="w-full"
                  >
                    {t('settings.wipeVault')}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
