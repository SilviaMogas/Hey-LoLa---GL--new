import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FoundingMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoundingMemberModal: React.FC<FoundingMemberModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.3)] font-boutique"
          >
            {/* Header / Logo Section */}
            <div className="bg-charcoal p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="relative z-10 space-y-4">
                <div className="flex justify-center">
                  <BrandLogo variant="white" size="lg" />
                </div>
                <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                  <Sparkles size={12} /> Founding Member
                </div>
                <h2 className="text-3xl font-serif italic text-white tracking-tight">
                  The <span className="text-white/40">Founding Circle</span><span className="brand-dot" aria-hidden="true" />
                </h2>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 sm:p-10 space-y-8">
              <div className="space-y-4">
                <p className="text-lg text-charcoal font-serif italic leading-snug">
                  "Become part of the foundation. Help us build the world's most exclusive dog travel network."
                </p>
                <p className="text-stone-500 font-light leading-relaxed">
                  The Black membership is our most exclusive tier, designed for those who believe in our mission from day one.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
                    <ShieldCheck size={20} className="text-brand-orange" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-charcoal">Founding Member Badge</h4>
                    <p className="text-sm text-stone-500 font-light">A permanent badge on your profile and passport, recognizing your support from the very beginning.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
                    <Check size={20} className="text-brand-orange" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-charcoal">Price Guaranteed Forever</h4>
                    <p className="text-sm text-stone-500 font-light">As a Founding Member, your introductory price will never increase, even as we add more global cities and premium services.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
                    <Sparkles size={20} className="text-brand-orange" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-charcoal">Progressive Perk Rollout</h4>
                    <p className="text-sm text-stone-500 font-light">New cities, exclusive venue partnerships, and travel concierge services will be rolled out gradually to our founding circle first.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-charcoal text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] hover:bg-stone-800 transition-all shadow-xl active:scale-95"
              >
                Understood, Join Waitlist
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
