import { describe, it, expect } from 'vitest';
import { deriveKeyFromPassword, generateSalt } from '../src/core/crypto/kdf';
import {
  encryptData,
  decryptData,
  createAuthCheckToken,
  verifyAuthCheckToken,
} from '../src/core/crypto/aes';
import { bufferToBase64 } from '../src/core/crypto/utils';
import { evaluatePasswordStrength } from '../src/core/crypto/entropy';

describe('Web Crypto - KDF & AES-256-GCM', () => {
  it('should generate a 16-byte cryptographic salt', () => {
    const salt = generateSalt();
    expect(salt).toBeInstanceOf(Uint8Array);
    expect(salt.length).toBe(16);
  });

  it('should derive a valid CryptoKey and encrypt/decrypt correctly (round-trip)', async () => {
    const password = 'MonSuperMotDePasseKof2026!';
    const salt = generateSalt();
    // For test speed, test with 10 000 iterations in test suite
    const key = await deriveKeyFromPassword(password, salt, 10_000);

    const secretData = JSON.stringify({
      title: 'Mon Compte Secret',
      username: 'ayiti@kof.ht',
      password: 'ExtremelySecretValue123$',
    });

    const encrypted = await encryptData(secretData, key);
    expect(encrypted.version).toBe(1);
    expect(encrypted.iv).toBeTruthy();
    expect(encrypted.ciphertext).toBeTruthy();

    const decrypted = await decryptData(encrypted, key);
    expect(decrypted).toBe(secretData);
    expect(JSON.parse(decrypted).username).toBe('ayiti@kof.ht');
  });

  it('should fail decryption when using a wrong password key', async () => {
    const salt = generateSalt();
    const correctKey = await deriveKeyFromPassword('GoodPassword#123', salt, 5000);
    const wrongKey = await deriveKeyFromPassword('WrongPassword#999', salt, 5000);

    const encrypted = await encryptData('Ultra sensitive text', correctKey);

    await expect(decryptData(encrypted, wrongKey)).rejects.toThrow();
  });

  it('should fail decryption when ciphertext is tampered (integrity verification)', async () => {
    const salt = generateSalt();
    const key = await deriveKeyFromPassword('PasswordSafe123!', salt, 5000);
    const encrypted = await encryptData('Original data', key);

    // Corrupt one character in the Base64 ciphertext
    const rawCipher = atob(encrypted.ciphertext);
    const tamperedCipher =
      rawCipher.slice(0, 4) +
      String.fromCharCode(rawCipher.charCodeAt(4) ^ 0xff) +
      rawCipher.slice(5);
    const tamperedPayload = {
      ...encrypted,
      ciphertext: btoa(tamperedCipher),
    };

    await expect(decryptData(tamperedPayload, key)).rejects.toThrow();
  });

  it('should verify auth token successfully for valid key and reject invalid key', async () => {
    const salt = generateSalt();
    const validKey = await deriveKeyFromPassword('ValidKeyPass#1', salt, 5000);
    const invalidKey = await deriveKeyFromPassword('InvalidKeyPass#2', salt, 5000);

    const token = await createAuthCheckToken(validKey);
    const isValid = await verifyAuthCheckToken(token, validKey);
    const isInvalid = await verifyAuthCheckToken(token, invalidKey);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });
});

describe('Entropy & Password Strength Evaluation', () => {
  it('should rate empty or short passwords as very weak', () => {
    const emptyResult = evaluatePasswordStrength('');
    expect(emptyResult.score).toBe(0);
    expect(emptyResult.mascotMood).toBe('sleeping');

    const shortResult = evaluatePasswordStrength('12345');
    expect(shortResult.score).toBe(0);
    expect(shortResult.mascotMood).toBe('worried');
  });

  it('should rate strong and complex passwords as cyclone-level', () => {
    const strongResult = evaluatePasswordStrength('Kof-Sekirite-2026-Ayiti!#Solid');
    expect(strongResult.score).toBe(4);
    expect(strongResult.mascotMood).toBe('happy');
    expect(strongResult.hasMinLength).toBe(true);
    expect(strongResult.hasUppercase).toBe(true);
    expect(strongResult.hasLowercase).toBe(true);
    expect(strongResult.hasNumber).toBe(true);
    expect(strongResult.hasSymbol).toBe(true);
  });
});
