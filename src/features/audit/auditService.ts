import type { VaultEntry, SecurityAuditResult, SecurityScoreItem } from '../../types';
import { evaluatePasswordStrength } from '../../core/crypto/entropy';

export function runSecurityAudit(entries: VaultEntry[]): SecurityAuditResult {
  if (entries.length === 0) {
    return {
      score: 100,
      total: 0,
      weakCount: 0,
      reusedCount: 0,
      oldCount: 0,
      duplicates: new Map(),
      issues: [],
    };
  }

  const issues: SecurityScoreItem[] = [];
  const passwordMap = new Map<string, string[]>(); // password -> [entryIds]
  let weakCount = 0;
  let oldCount = 0;

  const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  entries.forEach((entry) => {
    if (!entry.password) return;

    // Check strength
    const strength = evaluatePasswordStrength(entry.password);
    if (strength.score < 2 || entry.password.length < 10) {
      weakCount += 1;
      issues.push({
        type: 'weak',
        entryId: entry.id,
        title: entry.title,
        reason: 'Mot de passe trop court ou trop simple.',
      });
    }

    // Check age
    if (now - entry.updatedAt > SIX_MONTHS_MS) {
      oldCount += 1;
      issues.push({
        type: 'old',
        entryId: entry.id,
        title: entry.title,
        reason: 'Non renouvelé depuis plus de 6 mois.',
      });
    }

    // Check reuse
    const existing = passwordMap.get(entry.password) || [];
    existing.push(entry.id);
    passwordMap.set(entry.password, existing);
  });

  // Reused count
  let reusedCount = 0;
  const duplicates = new Map<string, string[]>();

  passwordMap.forEach((entryIds, password) => {
    if (entryIds.length > 1) {
      reusedCount += entryIds.length;
      duplicates.set(password, entryIds);

      entryIds.forEach((id) => {
        const found = entries.find((e) => e.id === id);
        if (found) {
          issues.push({
            type: 'reused',
            entryId: id,
            title: found.title,
            reason: `Utilisé dans ${entryIds.length} comptes différents.`,
          });
        }
      });
    }
  });

  // Calculate global score:
  // Starts at 100
  // Each weak password: -15
  // Each reused password: -10
  // Each old password: -5
  let score = 100;
  score -= weakCount * 15;
  score -= reusedCount * 10;
  score -= oldCount * 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    total: entries.length,
    weakCount,
    reusedCount,
    oldCount,
    duplicates,
    issues,
  };
}
