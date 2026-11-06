import { bufferToBase64, base64ToUint8Array, stringToBuffer } from './utils';

export const PBKDF2_ITERATIONS = 600_000;
export const SALT_LENGTH_BYTES = 16;

/**
 * Génère un sel cryptographique sécurisé
 */
export function generateSalt(length = SALT_LENGTH_BYTES): Uint8Array {
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Dérive une CryptoKey AES-256-GCM à partir d'un mot de passe maître et d'un sel.
 * Utilise PBKDF2 avec SHA-256 et au minimum 600 000 itérations.
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array | string,
  iterations = PBKDF2_ITERATIONS,
): Promise<CryptoKey> {
  const saltBytes = typeof salt === 'string' ? base64ToUint8Array(salt) : salt;
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password) as unknown as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

export { bufferToBase64, base64ToUint8Array };
