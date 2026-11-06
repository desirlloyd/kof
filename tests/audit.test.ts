import { describe, it, expect } from 'vitest';
import { runSecurityAudit } from '../src/features/audit/auditService';
import type { VaultEntry } from '../src/types';

describe('Security Health Audit', () => {
  it('should score 100 on an empty vault', () => {
    const audit = runSecurityAudit([]);
    expect(audit.score).toBe(100);
    expect(audit.issues.length).toBe(0);
  });

  it('should identify weak and reused passwords and drop the score accordingly', () => {
    const mockEntries: VaultEntry[] = [
      {
        id: '1',
        title: 'Email',
        username: 'jean@kof.ht',
        password: '123', // Very weak
        category: 'login',
        tags: [],
        favorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '2',
        title: 'Social',
        username: 'jean',
        password: 'PassPhraseUniqueEtSolide#99!', // Reused in #3
        category: 'login',
        tags: [],
        favorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '3',
        title: 'Forum',
        username: 'jean',
        password: 'PassPhraseUniqueEtSolide#99!', // Reused
        category: 'login',
        tags: [],
        favorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '4',
        title: 'Old Account',
        username: 'jean',
        password: 'AutreSuperPassUnique2025$#',
        category: 'login',
        tags: [],
        favorite: false,
        createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 200 * 24 * 60 * 60 * 1000, // > 6 months
      },
    ];

    const audit = runSecurityAudit(mockEntries);
    expect(audit.weakCount).toBe(1);
    expect(audit.reusedCount).toBe(2);
    expect(audit.oldCount).toBe(1);
    expect(audit.score).toBeLessThan(80);
    expect(audit.issues.length).toBeGreaterThanOrEqual(4);
  });
});
