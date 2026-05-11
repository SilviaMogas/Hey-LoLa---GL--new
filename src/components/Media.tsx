import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Newspaper } from 'lucide-react';

interface MediaProps {
  onBack: () => void;
}

export const Media: React.FC<MediaProps> = ({ onBack }) => {
  return (
    <div className="bg-white page-shell font-boutique text-charcoal min-h-screen flex flex-col">
      <section className="relative flex-1 flex items-center justify-center px-5 sm:px-6 py-20 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -left-40 w-[900px] h-[900px] bg-stone-100/40 rounded-full blur-[180px]"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-60 -right-40 w-[700px] h-[700px] bg-brand-orange/5 rounded-full blur-[180px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full text-center space-y-10 relative z-10"
        >
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft size={12} /> Back
          </button>

          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">
              <Newspaper size={11} /> Press &amp; Media
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif italic tracking-tight leading-[0.9]">
              Media room<br />
              <span className="text-stone-300">coming soon</span><span className="text-brand-orange">.</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-500 font-light italic leading-snug max-w-md mx-auto">
              We're putting together press materials, brand assets and concierge interviews. The Hey Lola media room opens with our Miami launch.
            </p>
          </div>

          <div className="space-y-4 max-w-sm mx-auto pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
              Press enquiries
            </p>
            <a
              href="mailto:hey@heylola.co?subject=Press%20enquiry"
              className="luxury-button-primary w-full h-12 text-[11px] flex items-center justify-center gap-2 shadow-lg"
            >
              <Mail size={14} /> hey@heylola.co
            </a>
            <p className="text-[11px] text-stone-400 font-light italic">
              We typically reply within 2 business days.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
