import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, AlertTriangle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { runSecurityAudit } from './auditService';
import { useVaultStore } from '../vault/vaultStore';
import { Button } from '../../components/ui/Button';
import { TiKof } from '../../components/mascot/TiKof';
import type { MascotMood } from '../../types';

interface AuditViewProps {
  onSelectEntryToFix: (id: string) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({ onSelectEntryToFix }) => {
  const { t } = useTranslation();
  const { entries } = useVaultStore();

  const audit = runSecurityAudit(entries);

  let scoreColor = '#B6F23A';
  let mascotMood: MascotMood = 'happy';
  let scoreHeadline = t('audit.excellent');

  if (audit.score < 50) {
    scoreColor = '#FF4D6D';
    mascotMood = 'worried';
    scoreHeadline = t('audit.critical');
  } else if (audit.score < 80) {
    scoreColor = '#FFB400';
    mascotMood = 'neutral';
    scoreHeadline = t('audit.warning');
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-6">
      {/* Top Banner avec Score & Ti Kòf */}
      <div className="p-4 sm:p-6 md:p-8 bg-[#171A30] border-2 border-[#2D3357] rounded-2xl sm:rounded-3xl tap-shadow-solid flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <TiKof mood={mascotMood} size="md" />
          <div>
            <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-wider text-[#A9ABC4]">
              {t('audit.title')}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#FFF6E5] mt-1">
              {scoreHeadline}
            </h2>
            <p className="text-xs sm:text-sm text-[#A9ABC4] mt-1">
              {audit.total} {audit.total > 1 ? 'comptes analysés' : 'compte analysé'} dans ton Kòf local.
            </p>
          </div>
        </div>

        {/* Jauge Score */}
        <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-[#20243F] border-2 border-[#2D3357] rounded-2xl min-w-[120px] sm:min-w-[140px] shrink-0">
          <span
            className="text-3xl sm:text-4xl md:text-5xl font-black font-display"
            style={{ color: scoreColor }}
          >
            {audit.score}%
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-[#A9ABC4] mt-0.5 sm:mt-1">
            {t('audit.score')}
          </span>
        </div>
      </div>

      {/* 3 Cartes Métriques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Faibles */}
        <div className="p-4 sm:p-5 bg-[#171A30] border-2 border-[#2D3357] rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#FF4D6D]">
              {audit.weakCount}
            </span>
            <h3 className="text-xs font-semibold text-[#FFF6E5] mt-1">
              {t('audit.weakPasswords')}
            </h3>
          </div>
          <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF4D6D]/40 shrink-0" />
        </div>

        {/* Réutilisés */}
        <div className="p-4 sm:p-5 bg-[#171A30] border-2 border-[#2D3357] rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#FFB400]">
              {audit.reusedCount}
            </span>
            <h3 className="text-xs font-semibold text-[#FFF6E5] mt-1">
              {t('audit.reusedPasswords')}
            </h3>
          </div>
          <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 text-[#FFB400]/40 shrink-0" />
        </div>

        {/* Anciens */}
        <div className="p-4 sm:p-5 bg-[#171A30] border-2 border-[#2D3357] rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#19D3C5]">
              {audit.oldCount}
            </span>
            <h3 className="text-xs font-semibold text-[#FFF6E5] mt-1">
              {t('audit.oldPasswords')}
            </h3>
          </div>
          <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-[#19D3C5]/40 shrink-0" />
        </div>
      </div>

      {/* Liste des vulnérabilités détaillées */}
      <div className="p-4 sm:p-6 bg-[#171A30] border-2 border-[#2D3357] rounded-2xl sm:rounded-3xl tap-shadow-solid">
        <h3 className="text-base sm:text-lg font-bold text-[#FFF6E5] mb-3 sm:mb-4">
          Actions recommandées ({audit.issues.length})
        </h3>

        {audit.issues.length === 0 ? (
          <div className="text-center py-8 sm:py-10">
            <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-[#B6F23A] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#FFF6E5]">
              Aucune vulnérabilité trouvée !
            </p>
            <p className="text-xs text-[#A9ABC4] mt-1">
              Tous tes mots de passe sont uniques, solides et à jour.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {audit.issues.map((issue, idx) => (
              <div
                key={`${issue.entryId}-${idx}`}
                className="p-3.5 sm:p-4 bg-[#20243F] border border-[#2D3357] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#FFB400] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        issue.type === 'weak'
                          ? 'bg-[#FF4D6D]'
                          : issue.type === 'reused'
                          ? 'bg-[#FFB400]'
                          : 'bg-[#19D3C5]'
                      }`}
                    />
                    <h4 className="font-bold text-xs sm:text-sm text-[#FFF6E5]">
                      {issue.title}
                    </h4>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#A9ABC4] mt-1 ml-4">
                    {issue.reason}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="turquoise"
                  onClick={() => onSelectEntryToFix(issue.entryId)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="w-full sm:w-auto min-h-[36px] text-xs font-bold"
                >
                  {t('audit.fixNow')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
