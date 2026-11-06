import type { EncryptedPayload } from '../../types';
import { bufferToBase64, base64ToUint8Array, stringToBuffer, bufferToString } from './utils';

export const AUTH_VERIFICATION_TOKEN = 'KOF_VAULT_AUTH_VALID_v1';
export const CURRENT_PAYLOAD_VERSION = 1;
export const IV_LENGTH_BYTES = 12; // 96-bit standard for AES-GCM

/**
 * Chiffre une chaîne de caractères avec AES-256-GCM et un IV unique de 12 octets.
 */
export async function encryptData(
  plainText: string,
  key: CryptoKey,
): Promise<EncryptedPayload> {
  const iv = new Uint8Array(IV_LENGTH_BYTES);
  crypto.getRandomValues(iv);

  const encodedData = stringToBuffer(plainText);
  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    encodedData as unknown as BufferSource,
  );

  return {
    version: CURRENT_PAYLOAD_VERSION,
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(cipherBuffer),
  };
}

/**
 * Déchiffre un payload chiffré avec AES-256-GCM.
 * Lève une exception si l'intégrité (tag d'authentification) est compromise ou la clé incorrecte.
 */
export async function decryptData(
  payload: EncryptedPayload,
  key: CryptoKey,
): Promise<string> {
  const iv = base64ToUint8Array(payload.iv);
  const cipherBuffer = base64ToUint8Array(payload.ciphertext);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    cipherBuffer as unknown as BufferSource,
  );

  return bufferToString(decryptedBuffer);
}

/**
 * Crée le jeton de vérification utilisé pour tester le mot de passe maître sans tout déchiffrer.
 */
export async function createAuthCheckToken(key: CryptoKey): Promise<EncryptedPayload> {
  return encryptData(AUTH_VERIFICATION_TOKEN, key);
}

/**
 * Vérifie si une clé peut déchiffrer le jeton de validation.
 */
export async function verifyAuthCheckToken(
  authCheck: EncryptedPayload,
  key: CryptoKey,
): Promise<boolean> {
  try {
    const decrypted = await decryptData(authCheck, key);
    return decrypted === AUTH_VERIFICATION_TOKEN;
  } catch {
    return false;
  }
}
