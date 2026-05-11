import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  /** Short headline. Default: "Upgrade to save spots". */
  title?: string;
  /** Sub-copy shown under the title. */
  body?: string;
  ctaLabel?: string;
  onClose: () => void;
  onUpgrade: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  title = 'Upgrade to save spots',
  body = 'Saving favourites is a Hey Lola Club perk. Pick a plan and start a 7-day free trial — cancel anytime.',
  ctaLabel = 'See Club plans',
  onClose,
  onUpgrade,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-charcoal/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full text-stone-400 hover:text-charcoal hover:bg-stone-50 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
              <Sparkles size={12} /> Hey Lola Club
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif italic text-charcoal tracking-tight">{title}</h2>
              <p className="text-sm text-stone-500 italic leading-snug">{body}</p>
            </div>

            <ul className="space-y-2 text-sm text-charcoal/80">
              <li className="flex items-start gap-2"><span className="text-brand-orange shrink-0">✦</span> Save unlimited venues across all cities</li>
              <li className="flex items-start gap-2"><span className="text-brand-orange shrink-0">✦</span> Member perks at partner places</li>
              <li className="flex items-start gap-2"><span className="text-brand-orange shrink-0">✦</span> 7-day free trial, cancel anytime</li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={onUpgrade}
                className="flex-1 bg-charcoal text-white py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
              >
                {ctaLabel} <ArrowRight size={14} />
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 border border-stone-100 text-stone-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-50 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
