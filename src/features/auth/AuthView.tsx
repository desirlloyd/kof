import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, KeyRound, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from './authStore';
import { TiKof } from '../../components/mascot/TiKof';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StrengthMeter } from '../../components/ui/StrengthMeter';
import { evaluatePasswordStrength } from '../../core/crypto/entropy';
import type { MascotMood } from '../../types';

export const AuthView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isInitialized, setupVault, unlockVault, isLoading, error, clearError } = useAuthStore();

  // Onboarding state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Unlock state
  const [unlockPassword, setUnlockPassword] = useState('');

  // Password evaluation for mascot reaction
  const currentStrength = evaluatePasswordStrength(isInitialized ? unlockPassword : masterPassword);
  
  let mascotMood: MascotMood = 'neutral';
  let mascotBubble = t('mascot.welcome');

  if (!isInitialized) {
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

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (masterPassword.length < 8) {
      setLocalError('Le mot de passe maître doit comporter au moins 8 caractères.');
      return;
    }
    if (masterPassword !== confirmPassword) {
      setLocalError(t('auth.passwordMismatch'));
      return;
    }

    await setupVault(masterPassword);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!unlockPassword) return;
    await unlockVault(unlockPassword);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0E1020] tap-bg-pattern relative overflow-hidden">
      {/* Halo décoratif inspiré du soleil créole */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#FFB400]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#19D3C5]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher en haut à droite */}
      <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-[#171A30] border-2 border-[#2D3357] p-1 rounded-xl text-xs font-semibold z-10">
        {(['fr', 'ht', 'en'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => {
              i18n.changeLanguage(lang);
              localStorage.setItem('kof_language', lang);
            }}
            className={`px-2.5 py-1 rounded-lg uppercase transition-colors ${
              i18n.language === lang
                ? 'bg-[#FFB400] text-[#0E1020]'
                : 'text-[#A9ABC4] hover:text-[#FFF6E5]'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#171A30] border-2 border-[#2D3357] rounded-3xl p-6 md:p-8 tap-shadow-solid relative z-10"
      >
        {/* Mascotte Ti Kòf avec bulle d'expression */}
        <div className="flex flex-col items-center mb-6">
          <TiKof mood={mascotMood} size="lg" bubbleText={mascotBubble} />
          <h1 className="text-3xl font-extrabold text-[#FFF6E5] tracking-tight mt-3 text-center">
            Kòf
          </h1>
          <p className="text-xs md:text-sm text-[#FFB400] font-medium tracking-wide">
            {t('app.tagline')}
          </p>
        </div>

        {/* --- CAS 1 : ONBOARDING & CRÉATION DU COFFRE --- */}
        {!isInitialized ? (
          <div>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-[#20243F] border border-[#2D3357] rounded-2xl flex items-start gap-3">
                  <Shield className="w-6 h-6 text-[#19D3C5] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[#FFF6E5]">
                      {t('auth.step1Title')}
                    </h3>
                    <p className="text-xs text-[#A9ABC4] mt-1 leading-relaxed">
                      {t('auth.step1Desc')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => setStep(2)}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Continuer
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-[#FF4D6D]/15 border-2 border-[#FF4D6D] rounded-2xl flex items-start gap-3">
                  <KeyRound className="w-6 h-6 text-[#FF4D6D] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[#FFF6E5]">
                      {t('auth.step2Title')}
                    </h3>
                    <p className="text-xs text-[#FFF6E5]/90 mt-1 leading-relaxed">
                      {t('auth.step2Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Retour
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
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
                onSubmit={handleCreateVault}
                className="space-y-4"
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
                      className="text-[#A9ABC4] hover:text-[#FFF6E5] p-1"
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

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(2)}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
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
            <div className="flex justify-center gap-2 mt-6">
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
          /* --- CAS 2 : DÉVERROUILLAGE DU COFFRE EXISTANT --- */
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <Input
                label={t('auth.unlockVaultTitle')}
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
                    className="text-[#A9ABC4] hover:text-[#FFF6E5] p-1"
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
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<Lock className="w-5 h-5" />}
            >
              {t('auth.unlockBtn')}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
