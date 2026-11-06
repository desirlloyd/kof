import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Key,
  Copy,
  Check,
  Star,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  Clock,
  Tag,
  FileText,
  User,
} from 'lucide-react';
import type { VaultEntry } from '../../types';
import { useVaultStore } from './vaultStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StrengthMeter } from '../../components/ui/StrengthMeter';

interface EntryDetailViewProps {
  entry: VaultEntry;
  onEdit: () => void;
  onClose?: () => void;
}

export const EntryDetailView: React.FC<EntryDetailViewProps> = ({
  entry,
  onEdit,
  onClose,
}) => {
  const { t } = useTranslation();
  const { copyToClipboard, deleteEntry, toggleFavorite } = useVaultStore();

  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-hide password after 15 seconds of visibility for security
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showPassword) {
      timer = setTimeout(() => {
        setShowPassword(false);
      }, 15000);
    }
    return () => clearTimeout(timer);
  }, [showPassword]);

  const handleCopy = async (text?: string, fieldName = 'field') => {
    if (!text) return;
    await copyToClipboard(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm(t('vault.deleteConfirm'))) {
      setIsDeleting(true);
      await deleteEntry(entry.id);
      if (onClose) onClose();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#171A30] border-2 border-[#2D3357] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 tap-shadow-solid overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 sm:pb-6 border-b border-[#2D3357] gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <Badge variant={entry.category}>
              {t(`vault.categories.${entry.category}`)}
            </Badge>
            {entry.favorite && (
              <span className="text-xs text-[#FFB400] font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#FFB400]" />
                {t('vault.favorites')}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#FFF6E5] break-words">
            {entry.title}
          </h2>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toggleFavorite(entry.id)}
            aria-label="Toggle Favorite"
            className="min-h-[38px] min-w-[38px] p-2"
            icon={
              <Star
                className={`w-4 h-4 ${
                  entry.favorite ? 'fill-[#FFB400] text-[#FFB400]' : ''
                }`}
              />
            }
          >
            {''}
          </Button>

          <Button
            size="sm"
            variant="turquoise"
            onClick={onEdit}
            icon={<Edit3 className="w-4 h-4" />}
            className="min-h-[38px] text-xs font-bold px-3"
          >
            {t('vault.editEntry')}
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            icon={<Trash2 className="w-4 h-4" />}
            className="min-h-[38px] min-w-[38px] p-2"
          >
            {''}
          </Button>
        </div>
      </div>

      {/* Fields */}
      <div className="py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* URL Field */}
        {entry.url && (
          <div className="p-3.5 sm:p-4 bg-[#20243F] rounded-2xl border border-[#2D3357]">
            <span className="text-xs font-semibold text-[#A9ABC4] block mb-1">
              {t('vault.url')}
            </span>
            <div className="flex items-center justify-between gap-3">
              <a
                href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-mono text-[#19D3C5] hover:underline flex items-center gap-1.5 truncate"
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span className="truncate">{entry.url}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
              <button
                onClick={() => handleCopy(entry.url, 'url')}
                className="p-2 text-[#A9ABC4] hover:text-[#FFF6E5] rounded-lg hover:bg-[#171A30] min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                aria-label="Copier l'URL"
              >
                {copiedField === 'url' ? (
                  <Check className="w-4 h-4 text-[#B6F23A]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Username Field */}
        {entry.username && (
          <div className="p-3.5 sm:p-4 bg-[#20243F] rounded-2xl border border-[#2D3357]">
            <span className="text-xs font-semibold text-[#A9ABC4] block mb-1">
              {t('vault.username')}
            </span>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm md:text-base font-mono text-[#FFF6E5] font-semibold truncate flex items-center gap-2">
                <User className="w-4 h-4 text-[#A9ABC4] shrink-0" />
                <span className="truncate">{entry.username}</span>
              </span>
              <button
                onClick={() => handleCopy(entry.username, 'user')}
                className="px-3 py-1.5 bg-[#171A30] hover:bg-[#2D3357] text-[#FFF6E5] rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#2D3357] min-h-[36px] shrink-0"
              >
                {copiedField === 'user' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#B6F23A]" />
                    <span className="text-[#B6F23A]">{t('vault.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Password Field */}
        {entry.password && (
          <div className="p-3.5 sm:p-4 bg-[#20243F] rounded-2xl border-2 border-[#FFB400]/40 space-y-3">
            <span className="text-xs font-semibold text-[#FFB400] block">
              {t('vault.password')}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 overflow-hidden min-w-0">
                <Key className="w-4 h-4 text-[#FFB400] shrink-0" />
                <span className="text-sm sm:text-base md:text-lg font-mono text-[#FFF6E5] font-bold tracking-wider truncate">
                  {showPassword ? entry.password : '••••••••••••••••'}
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-[#A9ABC4] hover:text-[#FFF6E5] rounded-xl hover:bg-[#171A30] min-h-[38px] min-w-[38px] flex items-center justify-center"
                  aria-label="Afficher ou masquer le mot de passe"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleCopy(entry.password, 'pass')}
                  className="min-h-[38px] px-3.5 text-xs font-bold"
                  icon={
                    copiedField === 'pass' ? (
                      <Check className="w-3.5 h-3.5 text-[#0E1020]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {copiedField === 'pass' ? t('vault.copied') : 'Copier'}
                </Button>
              </div>
            </div>
            <StrengthMeter password={entry.password} />
          </div>
        )}

        {/* Notes Field */}
        {entry.notes && (
          <div className="p-3.5 sm:p-4 bg-[#20243F] rounded-2xl border border-[#2D3357]">
            <span className="text-xs font-semibold text-[#A9ABC4] block mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {t('vault.notes')}
            </span>
            <p className="text-xs md:text-sm text-[#FFF6E5] whitespace-pre-wrap leading-relaxed font-sans">
              {entry.notes}
            </p>
          </div>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-[#A9ABC4]" />
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2.5 py-1 bg-[#20243F] text-[#19D3C5] rounded-xl border border-[#2D3357]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Dates */}
      <div className="mt-auto pt-4 border-t border-[#2D3357] flex items-center justify-between text-[11px] text-[#A9ABC4]">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {t('vault.lastUpdated', {
            date: new Date(entry.updatedAt).toLocaleDateString(),
          })}
        </span>
      </div>
    </div>
  );
};
