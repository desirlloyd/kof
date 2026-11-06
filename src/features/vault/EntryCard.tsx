import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Key,
  Copy,
  Check,
  Star,
  CreditCard,
  FileText,
  Server,
  UserCheck,
} from 'lucide-react';
import type { VaultEntry, VaultCategory } from '../../types';
import { useVaultStore } from './vaultStore';
import { Badge } from '../../components/ui/Badge';

interface EntryCardProps {
  entry: VaultEntry;
  isSelected?: boolean;
  onSelect: () => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  isSelected = false,
  onSelect,
}) => {
  const { t } = useTranslation();
  const { copyToClipboard, toggleFavorite } = useVaultStore();
  const [copiedField, setCopiedField] = useState<'user' | 'pass' | null>(null);

  const getCategoryIcon = (category: VaultCategory) => {
    switch (category) {
      case 'card':
        return <CreditCard className="w-5 h-5 text-[#FFB400]" />;
      case 'note':
        return <FileText className="w-5 h-5 text-[#B6F23A]" />;
      case 'server':
        return <Server className="w-5 h-5 text-[#FF4D6D]" />;
      case 'identity':
        return <UserCheck className="w-5 h-5 text-purple-400" />;
      case 'login':
      default:
        return <Globe className="w-5 h-5 text-[#19D3C5]" />;
    }
  };

  const handleCopy = async (e: React.MouseEvent, text?: string, field?: 'user' | 'pass') => {
    e.stopPropagation();
    if (!text || !field) return;
    await copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(entry.id);
  };

  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -2 }}
      className={`p-4 rounded-2xl cursor-pointer transition-all border-2 select-none ${
        isSelected
          ? 'bg-[#20243F] border-[#FFB400] shadow-[4px_4px_0px_#FFB400]'
          : 'bg-[#171A30] border-[#2D3357] hover:border-[#19D3C5] shadow-[3px_3px_0px_rgba(0,0,0,0.4)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#20243F] border border-[#2D3357] flex items-center justify-center shrink-0">
            {getCategoryIcon(entry.category)}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm md:text-base text-[#FFF6E5] truncate">
              {entry.title}
            </h3>
            <p className="text-xs text-[#A9ABC4] truncate font-mono">
              {entry.username || entry.url || t(`vault.categories.${entry.category}`)}
            </p>
          </div>
        </div>

        {/* Favorite toggle */}
        <button
          onClick={handleFavoriteClick}
          className="text-[#A9ABC4] hover:text-[#FFB400] p-1 rounded-lg"
        >
          <Star
            className={`w-4 h-4 ${
              entry.favorite ? 'fill-[#FFB400] text-[#FFB400]' : ''
            }`}
          />
        </button>
      </div>

      {/* Quick Action Buttons & Tags */}
      <div className="mt-3 pt-3 border-t border-[#2D3357]/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Badge variant={entry.category}>
            {t(`vault.categories.${entry.category}`)}
          </Badge>
          {entry.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-[#A9ABC4] bg-[#20243F] px-1.5 py-0.5 rounded border border-[#2D3357] truncate"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {entry.username && (
            <button
              onClick={(e) => handleCopy(e, entry.username, 'user')}
              title={t('vault.username')}
              className="px-2 py-1 bg-[#20243F] hover:bg-[#2D3357] text-[#A9ABC4] hover:text-[#FFF6E5] rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
            >
              {copiedField === 'user' ? (
                <Check className="w-3.5 h-3.5 text-[#B6F23A]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline text-[10px]">User</span>
            </button>
          )}

          {entry.password && (
            <button
              onClick={(e) => handleCopy(e, entry.password, 'pass')}
              title={t('vault.password')}
              className="px-2 py-1 bg-[#20243F] hover:bg-[#2D3357] text-[#FFB400] hover:text-[#ffbe1a] rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
            >
              {copiedField === 'pass' ? (
                <Check className="w-3.5 h-3.5 text-[#B6F23A]" />
              ) : (
                <Key className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline text-[10px]">Pass</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
