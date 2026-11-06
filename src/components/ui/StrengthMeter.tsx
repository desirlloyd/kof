import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { evaluatePasswordStrength } from '../../core/crypto/entropy';

interface StrengthMeterProps {
  password: string;
  className?: string;
  showDetails?: boolean;
}

export const StrengthMeter: React.FC<StrengthMeterProps> = ({
  password,
  className = '',
  showDetails = true,
}) => {
  const { t } = useTranslation();
  const strength = evaluatePasswordStrength(password);

  const segments = [0, 1, 2, 3, 4];

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {/* 5 barres horizontales */}
      <div className="flex gap-1.5 h-2 w-full">
        {segments.map((index) => {
          const isActive = password.length > 0 && index <= strength.score;
          return (
            <motion.div
              key={index}
              className="h-full flex-1 rounded-full bg-[#20243F] overflow-hidden"
              initial={false}
            >
              <motion.div
                className="h-full w-full"
                style={{
                  backgroundColor: isActive ? strength.color : 'transparent',
                }}
                animate={{
                  scaleX: isActive ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Label de force */}
      {password.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold" style={{ color: strength.color }}>
            {t(strength.labelKey)}
          </span>
          {showDetails && (
            <span className="text-[#A9ABC4] text-[11px]">
              {password.length} caractères
            </span>
          )}
        </div>
      )}

      {/* Critères d'aide */}
      {showDetails && password.length > 0 && (
        <div className="flex flex-wrap gap-2 text-[11px] pt-1">
          <span
            className={`px-2 py-0.5 rounded border transition-colors ${
              strength.hasMinLength
                ? 'border-[#B6F23A]/50 text-[#B6F23A] bg-[#B6F23A]/10'
                : 'border-[#2D3357] text-[#A9ABC4]'
            }`}
          >
            ≥ 12 car.
          </span>
          <span
            className={`px-2 py-0.5 rounded border transition-colors ${
              strength.hasUppercase
                ? 'border-[#B6F23A]/50 text-[#B6F23A] bg-[#B6F23A]/10'
                : 'border-[#2D3357] text-[#A9ABC4]'
            }`}
          >
            A-Z
          </span>
          <span
            className={`px-2 py-0.5 rounded border transition-colors ${
              strength.hasLowercase
                ? 'border-[#B6F23A]/50 text-[#B6F23A] bg-[#B6F23A]/10'
                : 'border-[#2D3357] text-[#A9ABC4]'
            }`}
          >
            a-z
          </span>
          <span
            className={`px-2 py-0.5 rounded border transition-colors ${
              strength.hasNumber
                ? 'border-[#B6F23A]/50 text-[#B6F23A] bg-[#B6F23A]/10'
                : 'border-[#2D3357] text-[#A9ABC4]'
            }`}
          >
            0-9
          </span>
          <span
            className={`px-2 py-0.5 rounded border transition-colors ${
              strength.hasSymbol
                ? 'border-[#B6F23A]/50 text-[#B6F23A] bg-[#B6F23A]/10'
                : 'border-[#2D3357] text-[#A9ABC4]'
            }`}
          >
            !@#$
          </span>
        </div>
      )}
    </div>
  );
};
