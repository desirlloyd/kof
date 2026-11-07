import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Plus,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { useAuthStore } from './authStore';
import { TiKof } from '../../components/mascot/TiKof';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StrengthMeter } from '../../components/ui/StrengthMeter';
import { evaluatePasswordStrength } from '../../core/crypto/entropy';
import type { MascotMood } from '../../types';

const AVATAR_COLORS = ['#FFB400', '#19D3C5', '#FF4D6D', '#B6F23A', '#A78BFA'];

export const AuthView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    accounts,
    selectedAccount,
    setSelectedAccount,
    isCreatingNewAccount,
    setIsCreatingNewAccount,
    createAccount,
    unlockVault,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  // Onboarding / New Account state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountName, setAccountName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Unlock state
  const [unlockPassword, setUnlockPassword] = useState('');

  // Password evaluation for mascot reaction
  const currentStrength = evaluatePasswordStrength(
    isCreatingNewAccount ? masterPassword : unlockPassword,
  );

  let mascotMood: MascotMood = 'neutral';
  let mascotBubble = t('mascot.welcome');

  if (isCreatingNewAccount || accounts.length === 0) {
    if (step === 1) {
      mascotMood = 'happy';
      mascotBubble = t('auth.welcomeTitle');
    } else if (step === 2) {
      mascotMood = 'neutral';
      mascotBubble = t('auth.step2Title');
    } else {
      mascotMood = currentStrength.mascotMood;
      mascotBubble =
        masterPassword.length > 0
          ? currentStrength.score >= 3
            ? t('mascot.goodPassword')
            : t('mascot.weakPassword')
          : t('auth.step3Title');
    }
  } else {
    if (error) {
      mascotMood = 'worried';
      mascotBubble = t('mascot.error');
    } else {
      mascotMood = unlockPassword.length > 0 ? 'happy' : 'neutral';
      mascotBubble = t('mascot.unlock');
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!accountName.trim()) {
      setLocalError('Le nom du profil est obligatoire.');
      return;
    }
    if (masterPassword.length < 8) {
      setLocalError('Le mot de passe maître doit comporter au moins 8 caractères.');
      return;
    }
    if (masterPassword !== confirmPassword) {
      setLocalError(t('auth.passwordMismatch'));
      return;
    }

    await createAccount(accountName, masterPassword, selectedColor);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!unlockPassword) return;
    await unlockVault(unlockPassword);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-3 sm:p-6 bg-[#0E1020] tap-bg-pattern relative overflow-x-hidden">
      {/* Halo décoratif inspiré du soleil créole */}
      <div className="absolute top-1/4 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-[#FFB400]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-[#19D3C5]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher */}
      <div className="w-full max-w-md flex justify-end mb-3 sm:mb-4 px-1 z-10">
        <div className="flex items-center gap-1 bg-[#171A30] border-2 border-[#2D3357] p-1 rounded-xl text-[11px] font-semibold">
          {(['fr', 'ht', 'en'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                i18n.changeLanguage(lang);
                localStorage.setItem('kof_language', lang);
              }}
              className={`px-2 py-1 rounded-lg uppercase transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${
                i18n.language === lang
                  ? 'bg-[#FFB400] text-[#0E1020] font-bold'
                  : 'text-[#A9ABC4] hover:text-[#FFF6E5]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#171A30] border-2 border-[#2D3357] rounded-3xl p-5 sm:p-6 md:p-8 tap-shadow-solid relative z-10 my-auto"
      >
        {/* Mascotte Ti Kòf avec bulle d'expression */}
        <div className="flex flex-col items-center mb-5 sm:mb-6">
          <TiKof mood={mascotMood} size="md" bubbleText={mascotBubble} />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF6E5] tracking-tight mt-2 text-center">
            Kòf
          </h1>
          <p className="text-xs sm:text-sm text-[#FFB400] font-medium tracking-wide">
            {t('app.tagline')}
          </p>
        </div>

        {/* --- CAS 1 : CRÉATION D'UN NOUVEAU COMPTE / PREMIER ONBOARDING --- */}
        {isCreatingNewAccount || accounts.length === 0 ? (
          <div>
            {/* Si d'autres comptes existent déjà, bouton pour revenir à la sélection */}
            {accounts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNewAccount(false);
                  setStep(1);
                  setLocalError(null);
                }}
                className="mb-4 text-xs font-semibold text-[#A9ABC4] hover:text-[#FFB400] flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('auth.backToAccounts')}</span>
              </button>
            )}

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-[#FFF6E5] block mb-1.5">
                    {t('auth.accountName')}
                  </label>
                  <Input
                    placeholder={t('auth.accountNamePlaceholder')}
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                {/* Choix de la couleur d'avatar */}
                <div>
                  <label className="text-xs font-semibold text-[#A9ABC4] block mb-2">
                    {t('auth.chooseColor')}
                  </label>
                  <div className="flex items-center gap-2.5">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform flex items-center justify-center ${
                          selectedColor === color
                            ? 'scale-110 border-white shadow-md'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        {selectedColor === color && (
                          <Check className="w-4 h-4 text-[#0E1020] stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 bg-[#20243F] border border-[#2D3357] rounded-2xl flex items-start gap-3 mt-2">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#19D3C5] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#FFF6E5]">
                      {t('auth.step1Title')}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#A9ABC4] mt-1 leading-relaxed">
                      {t('auth.step1Desc')}
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full min-h-[44px]"
                  size="lg"
                  onClick={() => {
                    if (!accountName.trim()) {
                      setLocalError('Veuillez donner un nom à ce profil.');
                      return;
                    }
                    setLocalError(null);
                    setStep(2);
                  }}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Continuer
                </Button>
                {localError && (
                  <p className="text-xs text-[#FF4D6D] font-medium">{localError}</p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="p-3.5 sm:p-4 bg-[#FF4D6D]/15 border-2 border-[#FF4D6D] rounded-2xl flex items-start gap-3">
                  <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF4D6D] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#FFF6E5]">
                      {t('auth.step2Title')}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#FFF6E5]/90 mt-1 leading-relaxed">
                      {t('auth.step2Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1 min-h-[44px]"
                    onClick={() => setStep(1)}
                  >
                    Retour
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 min-h-[44px]"
                    onClick={() => setStep(3)}
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    J'ai compris
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleCreateAccount}
                className="space-y-3.5 sm:space-y-4"
              >
                <Input
                  label={t('auth.step3Title')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.masterPasswordPlaceholder')}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  isMono
                  autoFocus
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#A9ABC4] hover:text-[#FFF6E5] p-2 min-h-[40px] min-w-[40px] flex items-center justify-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />

                <StrengthMeter password={masterPassword} />

                <Input
                  label={t('auth.confirmPasswordPlaceholder')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  isMono
                  required
                />

                {(localError || error) && (
                  <p className="text-xs text-[#FF4D6D] font-medium bg-[#FF4D6D]/10 p-2.5 rounded-xl border border-[#FF4D6D]/30">
                    {localError || t(error as string)}
                  </p>
                )}

                <div className="flex gap-2 pt-1 sm:pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-[44px]"
                    onClick={() => setStep(2)}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 min-h-[44px]"
                    size="lg"
                    isLoading={isLoading}
                    icon={<CheckCircle2 className="w-5 h-5" />}
                  >
                    {t('auth.createVaultBtn')}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Stepper dots */}
            <div className="flex justify-center gap-2 mt-5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    step === s ? 'w-6 bg-[#FFB400]' : 'w-2 bg-[#2D3357]'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* --- CAS 2 : SÉLECTION DU COMPTE & DÉVERROUILLAGE --- */
          <div className="space-y-4">
            {/* Header de sélection du compte */}
            <div className="flex items-center justify-between pb-2 border-b border-[#2D3357]">
              <div>
                <h3 className="text-sm font-bold text-[#FFF6E5]">
                  {t('auth.selectAccount')}
                </h3>
                <p className="text-[11px] text-[#A9ABC4]">
                  {accounts.length} {accounts.length > 1 ? 'profils enregistrés' : 'profil enregistré'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAccountName('');
                  setStep(1);
                  setIsCreatingNewAccount(true);
                }}
                className="px-2.5 py-1.5 bg-[#20243F] hover:bg-[#2D3357] text-[#FFB400] text-xs font-bold rounded-xl border border-[#2D3357] hover:border-[#FFB400] flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('auth.newAccount')}</span>
              </button>
            </div>

            {/* Liste horizontale/grille des comptes disponibles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {accounts.map((acc) => {
                const isSelected = selectedAccount?.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setSelectedAccount(acc);
                      setUnlockPassword('');
                      clearError();
                    }}
                    className={`p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition-all ${
                      isSelected
                        ? 'bg-[#20243F] border-[#FFB400] shadow-[2px_2px_0px_#FFB400]'
                        : 'bg-[#0E1020] border-[#2D3357] text-[#A9ABC4] hover:border-[#19D3C5]'
                    }`}
                  >
                    <div
                      style={{ backgroundColor: acc.avatarColor }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[#0E1020] font-black text-sm shrink-0"
                    >
                      {acc.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs sm:text-sm text-[#FFF6E5] truncate">
                        {acc.name}
                      </div>
                      <div className="text-[10px] text-[#A9ABC4] font-mono">
                        {acc.lastLoginAt
                          ? new Date(acc.lastLoginAt).toLocaleDateString()
                          : 'Nouveau'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Formulaire de déverrouillage pour le compte sélectionné */}
            {selectedAccount && (
              <form onSubmit={handleUnlock} className="space-y-4 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#A9ABC4]">
                      Déverrouiller <strong className="text-[#FFF6E5]">{selectedAccount.name}</strong>
                    </span>
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.masterPasswordPlaceholder')}
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    isMono
                    autoFocus
                    required
                    error={error ? t(error) : undefined}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#A9ABC4] hover:text-[#FFF6E5] p-2 min-h-[40px] min-w-[40px] flex items-center justify-center"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full min-h-[46px]"
                  isLoading={isLoading}
                  icon={<Lock className="w-5 h-5" />}
                >
                  {t('auth.unlockBtn')}
                </Button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
