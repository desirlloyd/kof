import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Copy, Check, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../../components/ui/Button';
import {
  generateSecurePassword,
  DEFAULT_GENERATOR_OPTIONS,
  type GeneratorOptions,
} from './generatorService';
import { StrengthMeter } from '../../components/ui/StrengthMeter';
import { useVaultStore } from '../vault/vaultStore';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassword?: (password: string) => void;
}

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  onClose,
  onSelectPassword,
}) => {
  const { t } = useTranslation();
  const { copyToClipboard } = useVaultStore();

  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_GENERATOR_OPTIONS);
  const [generatedPassword, setGeneratedPassword] = useState(() =>
    generateSecurePassword(DEFAULT_GENERATOR_OPTIONS),
  );
  const [copied, setCopied] = useState(false);

  const handleRegenerate = () => {
    setGeneratedPassword(generateSecurePassword(options));
  };

  const updateOption = <K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]) => {
    const updated = { ...options, [key]: value };
    setOptions(updated);
    setGeneratedPassword(generateSecurePassword(updated));
  };

  const handleCopy = async () => {
    await copyToClipboard(generatedPassword);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFB400', '#19D3C5', '#FF4D6D', '#B6F23A'],
    });
    setTimeout(() => setCopied(false), 2000);

    if (onSelectPassword) {
      onSelectPassword(generatedPassword);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-lg bg-[#171A30] border-2 border-[#FFB400] rounded-3xl p-6 tap-shadow-safran"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2D3357]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFB400]" />
                <h2 className="text-xl font-bold text-[#FFF6E5]">
                  {t('generator.title')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-[#A9ABC4] hover:text-[#FFF6E5] p-1.5 rounded-lg hover:bg-[#20243F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Display de la clé générée */}
            <div className="my-5 p-4 bg-[#0E1020] border-2 border-[#2D3357] rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 overflow-hidden">
                <span className="font-mono text-base md:text-lg text-[#FFF6E5] break-all select-all font-semibold tracking-wide">
                  {generatedPassword}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleRegenerate}
                    aria-label={t('generator.regenerate')}
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    {''}
                  </Button>
                </div>
              </div>

              <StrengthMeter password={generatedPassword} showDetails={false} />
            </div>

            {/* Sélecteur de Mode */}
            <div className="flex bg-[#0E1020] p-1 rounded-xl border border-[#2D3357] mb-4">
              <button
                onClick={() => updateOption('mode', 'password')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  options.mode === 'password'
                    ? 'bg-[#FFB400] text-[#0E1020]'
                    : 'text-[#A9ABC4] hover:text-[#FFF6E5]'
                }`}
              >
                {t('generator.modePassword')}
              </button>
              <button
                onClick={() => updateOption('mode', 'passphrase')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  options.mode === 'passphrase'
                    ? 'bg-[#19D3C5] text-[#0E1020]'
                    : 'text-[#A9ABC4] hover:text-[#FFF6E5]'
                }`}
              >
                {t('generator.modePassphrase')}
              </button>
            </div>

            {/* Options selon le mode */}
            {options.mode === 'password' ? (
              <div className="space-y-4">
                {/* Longueur */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-[#FFF6E5]">
                    <span>{t('generator.length')}</span>
                    <span className="font-mono text-[#FFB400] text-sm">
                      {options.length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    value={options.length}
                    onChange={(e) => updateOption('length', parseInt(e.target.value, 10))}
                    className="w-full accent-[#FFB400] cursor-pointer"
                  />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-[#FFF6E5]">
                  <label className="flex items-center gap-2 p-2 bg-[#20243F] rounded-xl cursor-pointer hover:border-[#FFB400] border border-transparent">
                    <input
                      type="checkbox"
                      checked={options.uppercase}
                      onChange={(e) => updateOption('uppercase', e.target.checked)}
                      className="accent-[#FFB400]"
                    />
                    <span>{t('generator.uppercase')}</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-[#20243F] rounded-xl cursor-pointer hover:border-[#FFB400] border border-transparent">
                    <input
                      type="checkbox"
                      checked={options.lowercase}
                      onChange={(e) => updateOption('lowercase', e.target.checked)}
                      className="accent-[#FFB400]"
                    />
                    <span>{t('generator.lowercase')}</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-[#20243F] rounded-xl cursor-pointer hover:border-[#FFB400] border border-transparent">
                    <input
                      type="checkbox"
                      checked={options.numbers}
                      onChange={(e) => updateOption('numbers', e.target.checked)}
                      className="accent-[#FFB400]"
                    />
                    <span>{t('generator.numbers')}</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-[#20243F] rounded-xl cursor-pointer hover:border-[#FFB400] border border-transparent">
                    <input
                      type="checkbox"
                      checked={options.symbols}
                      onChange={(e) => updateOption('symbols', e.target.checked)}
                      className="accent-[#FFB400]"
                    />
                    <span>{t('generator.symbols')}</span>
                  </label>
                </div>
              </div>
            ) : (
              /* Options Mode Passphrase */
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-[#FFF6E5]">
                    <span>{t('generator.wordsCount')}</span>
                    <span className="font-mono text-[#19D3C5] text-sm">
                      {options.wordCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="6"
                    value={options.wordCount}
                    onChange={(e) =>
                      updateOption('wordCount', parseInt(e.target.value, 10))
                    }
                    className="w-full accent-[#19D3C5] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <Button
                variant="primary"
                className="w-full"
                size="lg"
                onClick={handleCopy}
                icon={copied ? <Check className="w-5 h-5 text-[#0E1020]" /> : <Copy className="w-5 h-5" />}
              >
                {copied ? t('vault.copied') : t('generator.copy')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
