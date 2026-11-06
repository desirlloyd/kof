import type { VaultMetadata, EncryptedPayload } from '../../types';
import { getMetadata, getEncryptedVaultEntries } from '../../core/storage/repository';
import { useVaultStore } from '../vault/vaultStore';

export interface KofBackupFile {
  format: 'KOF_ENCRYPTED_BACKUP_V1';
  timestamp: number;
  metadata: VaultMetadata;
  vaultPayload: EncryptedPayload;
}

/**
 * Télécharge un fichier chiffré .kof complet
 */
export async function exportEncryptedBackup(): Promise<boolean> {
  try {
    const metadata = await getMetadata();
    const vaultPayload = await getEncryptedVaultEntries();

    if (!metadata || !vaultPayload) {
      throw new Error('Données du coffre introuvables.');
    }

    const backupData: KofBackupFile = {
      format: 'KOF_ENCRYPTED_BACKUP_V1',
      timestamp: Date.now(),
      metadata,
      vaultPayload,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kof-backup-${new Date().toISOString().slice(0, 10)}.kof`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Export failed:', err);
    return false;
  }
}

/**
 * Lit et parse un fichier CSV pour importer des comptes dans le coffre actuel
 */
export async function parseAndImportCsv(fileText: string): Promise<number> {
  const lines = fileText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return 0;

  // Simple CSV parser supporting quotes
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const header = parseLine(lines[0]).map((h) => h.toLowerCase());
  const titleIdx = header.findIndex((h) => h.includes('name') || h.includes('title') || h.includes('titre'));
  const urlIdx = header.findIndex((h) => h.includes('url') || h.includes('website') || h.includes('site'));
  const userIdx = header.findIndex((h) => h.includes('user') || h.includes('login') || h.includes('identifiant') || h.includes('email'));
  const passIdx = header.findIndex((h) => h.includes('pass') || h.includes('mot de passe'));
  const notesIdx = header.findIndex((h) => h.includes('note') || h.includes('comment'));

  let importedCount = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const title = titleIdx !== -1 && cols[titleIdx] ? cols[titleIdx] : `Compte importé #${i}`;
    const url = urlIdx !== -1 ? cols[urlIdx] : undefined;
    const username = userIdx !== -1 ? cols[userIdx] : undefined;
    const password = passIdx !== -1 ? cols[passIdx] : undefined;
    const notes = notesIdx !== -1 ? cols[notesIdx] : undefined;

    if (!title && !username && !password) continue;

    const success = await useVaultStore.getState().addEntry({
      title,
      url,
      username,
      password,
      notes,
      category: 'login',
      tags: ['import-csv'],
      favorite: false,
    });

    if (success) importedCount += 1;
  }

  return importedCount;
}
