/**
 * Générateur cryptographique sécurisé (100% crypto.getRandomValues)
 */

export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  mode: 'password' | 'passphrase';
  wordCount: number;
  separator: string;
}

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  length: 18,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  mode: 'password',
  wordCount: 4,
  separator: '-',
};

const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Dictionnaire de mots courts, mémorables et chaleureux
const PASSPHRASE_WORDLIST = [
  'soley', 'mòn', 'lanmè', 'kòf', 'kay', 'pyebwa', 'zetwal', 'rivyè', 'mango',
  'kle', 'lapli', 'flè', 'van', 'zanmi', 'bato', 'briz', 'chimen', 'dous',
  'fòs', 'kouraj', 'koulè', 'taptap', 'tanbou', 'danse', 'chante', 'limyè',
  'lalin', 'zwazo', 'kafe', 'koko', 'bannann', 'sitwon', 'zaboka', 'kokoye',
  'solide', 'bouclier', 'citadelle', 'bastion', 'sentinelle', 'refuge', 'gardien',
  'eclair', 'aurore', 'cascade', 'ambre', 'corail', 'horizon', 'safari', 'flamme',
  'harbor', 'summit', 'falcon', 'galaxy', 'canyon', 'phoenix', 'timber', 'beacon',
];

/**
 * Entier aléatoire sécurisé entre 0 et max (exclus)
 */
function secureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  const maxUint = 0xffffffff;
  const limit = maxUint - (maxUint % max);

  let val: number;
  do {
    crypto.getRandomValues(array);
    val = array[0];
  } while (val >= limit);

  return val % max;
}

export function generateSecurePassword(options: GeneratorOptions): string {
  if (options.mode === 'passphrase') {
    const words: string[] = [];
    for (let i = 0; i < options.wordCount; i++) {
      const idx = secureRandomInt(PASSPHRASE_WORDLIST.length);
      const word = PASSPHRASE_WORDLIST[idx];
      // Capitalize occasionally or keep lowercase
      words.push(word);
    }
    // Add a secure random number at the end for extra entropy
    const suffixNum = secureRandomInt(99) + 1;
    return `${words.join(options.separator)}${options.separator}${suffixNum}`;
  }

  let charset = '';
  const mandatoryChars: string[] = [];

  if (options.lowercase) {
    charset += LOWERCASE_CHARS;
    mandatoryChars.push(LOWERCASE_CHARS[secureRandomInt(LOWERCASE_CHARS.length)]);
  }
  if (options.uppercase) {
    charset += UPPERCASE_CHARS;
    mandatoryChars.push(UPPERCASE_CHARS[secureRandomInt(UPPERCASE_CHARS.length)]);
  }
  if (options.numbers) {
    charset += NUMBER_CHARS;
    mandatoryChars.push(NUMBER_CHARS[secureRandomInt(NUMBER_CHARS.length)]);
  }
  if (options.symbols) {
    charset += SYMBOL_CHARS;
    mandatoryChars.push(SYMBOL_CHARS[secureRandomInt(SYMBOL_CHARS.length)]);
  }

  if (charset.length === 0) {
    charset = LOWERCASE_CHARS + NUMBER_CHARS;
  }

  const result: string[] = [...mandatoryChars];
  for (let i = result.length; i < options.length; i++) {
    result.push(charset[secureRandomInt(charset.length)]);
  }

  // Mélange de Fisher-Yates cryptographique
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result.join('');
}
