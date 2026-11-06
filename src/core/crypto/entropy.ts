import type { MascotMood } from '../../types';

export interface PasswordStrength {
  score: number; // 0 (très faible) à 4 (cyclone)
  labelKey: string; // clé i18n
  color: string;
  mascotMood: MascotMood;
  feedbackKey?: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      labelKey: 'auth.strength.veryWeak',
      color: '#FF4D6D',
      mascotMood: 'sleeping',
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSymbol: false,
    };
  }

  const length = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = length >= 12;

  // Calcul du pool de caractères
  let poolSize = 0;
  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 33;

  // Bits d'entropie approximatifs: L * log2(poolSize)
  const entropy = poolSize > 0 ? length * Math.log2(poolSize) : 0;

  let score = 0;
  let labelKey = 'auth.strength.veryWeak';
  let color = '#FF4D6D';
  let mascotMood: MascotMood = 'worried';

  if (length < 8 || entropy < 30) {
    score = 0;
    labelKey = 'auth.strength.veryWeak';
    color = '#FF4D6D';
    mascotMood = 'worried';
  } else if (length < 12 || entropy < 50) {
    score = 1;
    labelKey = 'auth.strength.weak';
    color = '#FF8C42';
    mascotMood = 'worried';
  } else if (entropy < 70) {
    score = 2;
    labelKey = 'auth.strength.fair';
    color = '#FFB400';
    mascotMood = 'neutral';
  } else if (entropy < 90 || length < 16) {
    score = 3;
    labelKey = 'auth.strength.strong';
    color = '#19D3C5';
    mascotMood = 'happy';
  } else {
    score = 4;
    labelKey = 'auth.strength.cyclone';
    color = '#B6F23A';
    mascotMood = 'happy';
  }

  return {
    score,
    labelKey,
    color,
    mascotMood,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
  };
}
