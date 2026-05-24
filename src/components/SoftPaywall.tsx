import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PawPrint, ArrowRight, Sparkles } from 'lucide-react';
import { track } from '../lib/analytics';

interface SoftPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (mode: 'login' | 'signup') => void;
  title?: string;
  message?: string;
}

export const SoftPaywall: React.FC<SoftPaywallProps> = ({ isOpen, onClose, onAuth, title, message }) => {
  useEffect(() => {
    if (!isOpen) return;
    track('softpaywall_shown');
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleAuth = (mode: 'login' | 'signup') => {
    track('softpaywall_converted', { mode });
    onAuth(mode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm cursor-default"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-bone w-full max-w-md rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] relative z-10 border border-stone-100"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2.5 text-stone-300 hover:text-charcoal transition-colors rounded-full hover:bg-stone-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Decorative gradient band */}
            <div className="h-px w-full bg-stone-200" />

            <div className="p-6 sm:p-8 text-center space-y-8">
              <div className="w-20 h-20 bg-stone-50 rounded-[2rem] flex items-center justify-center text-charcoal mx-auto border border-stone-100">
                <Sparkles size={36} strokeWidth={1.5} />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-serif italic tracking-tight text-charcoal leading-tight">
                  {title || 'The finest spots await.'}
                </h2>
                <p className="text-stone-400 leading-relaxed font-light italic text-base px-2">
                  {message || 'Create your free HeyLola account to keep exploring — save favourites, build your pet\'s passport, and join the community.'}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleAuth("signup")}
                  className="w-full h-11 bg-charcoal text-white rounded-full font-black font-sans text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-stone-800 hover:shadow-xl transition-all duration-500 group"
                >
                  Join for Free
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => handleAuth("login")}
                  className="w-full h-12 text-stone-400 font-black font-sans text-[10px] uppercase tracking-[0.3em] hover:text-charcoal transition-colors"
                >
                  Already a member? Sign in
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[9px] text-stone-300 font-black uppercase tracking-[0.3em]">
                <PawPrint size={12} className="text-stone-300" />
                Refined Travel for Companions
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
