import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Eye, EyeOff, Sparkles, Star, Globe, Lock, User, FileText, Tag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StrengthMeter } from '../../components/ui/StrengthMeter';
import { GeneratorModal } from '../generator/GeneratorModal';
import { useVaultStore } from './vaultStore';
import type { VaultEntry, VaultCategory } from '../../types';

interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: VaultEntry | null;
}

export const EntryFormModal: React.FC<EntryFormModalProps> = ({
  isOpen,
  onClose,
  entryToEdit,
}) => {
  const { t } = useTranslation();
  const { addEntry, updateEntry } = useVaultStore();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<VaultCategory>('login');
  const [tagsInput, setTagsInput] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (entryToEdit) {
      setTitle(entryToEdit.title);
      setUrl(entryToEdit.url || '');
      setUsername(entryToEdit.username || '');
      setPassword(entryToEdit.password || '');
      setNotes(entryToEdit.notes || '');
      setCategory(entryToEdit.category);
      setTagsInput(entryToEdit.tags ? entryToEdit.tags.join(', ') : '');
      setFavorite(entryToEdit.favorite || false);
    } else {
      setTitle('');
      setUrl('');
      setUsername('');
      setPassword('');
      setNotes('');
      setCategory('login');
      setTagsInput('');
      setFavorite(false);
    }
  }, [entryToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const payload = {
      title: title.trim(),
      url: url.trim() || undefined,
      username: username.trim() || undefined,
      password: password || undefined,
      notes: notes.trim() || undefined,
      category,
      tags,
      favorite,
    };

    if (entryToEdit) {
      await updateEntry(entryToEdit.id, payload);
    } else {
      await addEntry(payload);
    }

    setIsSubmitting(false);
    onClose();
  };

  const categories: VaultCategory[] = ['login', 'card', 'note', 'server', 'identity'];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-[#171A30] border-2 border-[#2D3357] rounded-3xl p-6 md:p-8 tap-shadow-solid my-8 relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#2D3357] mb-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFavorite(!favorite)}
                    className="p-1.5 rounded-xl hover:bg-[#20243F] transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        favorite ? 'fill-[#FFB400] text-[#FFB400]' : 'text-[#A9ABC4]'
                      }`}
                    />
                  </button>
                  <h2 className="text-xl md:text-2xl font-bold text-[#FFF6E5]">
                    {entryToEdit ? t('vault.editEntry') : t('vault.newEntry')}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#A9ABC4] hover:text-[#FFF6E5] p-2 rounded-xl hover:bg-[#20243F]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Catégories chips */}
                <div className="flex flex-wrap gap-2 pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize border-2 transition-all ${
                        category === cat
                          ? 'border-[#FFB400] bg-[#FFB400]/20 text-[#FFB400]'
                          : 'border-[#2D3357] bg-[#20243F] text-[#A9ABC4] hover:text-[#FFF6E5]'
                      }`}
                    >
                      {t(`vault.categories.${cat}`)}
                    </button>
                  ))}
                </div>

                {/* Titre */}
                <Input
                  label={t('vault.title')}
                  placeholder="ex: Google, GitHub, Banque..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                />

                {/* URL */}
                <Input
                  label={t('vault.url')}
                  icon={<Globe className="w-4 h-4" />}
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                {/* Username */}
                <Input
                  label={t('vault.username')}
                  icon={<User className="w-4 h-4" />}
                  placeholder="nom@exemple.com ou pseudo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                {/* Password + Generator button */}
                <div className="space-y-1.5">
                  <Input
                    label={t('vault.password')}
                    icon={<Lock className="w-4 h-4" />}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isMono
                    rightElement={
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setIsGeneratorOpen(true)}
                          className="p-1.5 text-[#FFB400] hover:text-[#ffbe1a] rounded-lg hover:bg-[#20243F]"
                          title={t('vault.generate')}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1.5 text-[#A9ABC4] hover:text-[#FFF6E5] rounded-lg hover:bg-[#20243F]"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    }
                  />
                  {password && <StrengthMeter password={password} />}
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs md:text-sm font-semibold text-[#FFF6E5] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#A9ABC4]" />
                    <span>{t('vault.notes')}</span>
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Codes de récupération, questions secrètes..."
                    className="w-full bg-[#171A30] text-[#FFF6E5] placeholder-[#A9ABC4]/50 border-2 border-[#2D3357] rounded-xl p-3 text-sm outline-none transition-all focus:border-[#FFB400] focus:shadow-[3px_3px_0px_#FFB400]"
                  />
                </div>

                {/* Tags */}
                <Input
                  label={t('vault.tags')}
                  icon={<Tag className="w-4 h-4" />}
                  placeholder="travail, perso, crypto..."
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#2D3357]">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    {t('vault.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  >
                    {t('vault.save')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <GeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onSelectPassword={(newPass) => setPassword(newPass)}
      />
    </>
  );
};
