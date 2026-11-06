import { describe, it, expect } from 'vitest';
import {
  generateSecurePassword,
  DEFAULT_GENERATOR_OPTIONS,
} from '../src/features/generator/generatorService';

describe('Password & Passphrase Generator', () => {
  it('should generate a complex password matching options length', () => {
    const password = generateSecurePassword({
      ...DEFAULT_GENERATOR_OPTIONS,
      length: 24,
    });
    expect(password.length).toBe(24);
    expect(/[a-z]/.test(password)).toBe(true);
    expect(/[A-Z]/.test(password)).toBe(true);
    expect(/[0-9]/.test(password)).toBe(true);
  });

  it('should generate a memorable passphrase with the requested word count', () => {
    const passphrase = generateSecurePassword({
      ...DEFAULT_GENERATOR_OPTIONS,
      mode: 'passphrase',
      wordCount: 4,
      separator: '-',
    });
    // e.g. "soley-mango-kay-zetwal-42"
    const parts = passphrase.split('-');
    expect(parts.length).toBe(5); // 4 words + 1 numeric suffix
    expect(Number(parts[parts.length - 1])).toBeGreaterThan(0);
  });
});
