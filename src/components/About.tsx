import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';
import { BrandLogo } from './BrandLogo';

interface AboutProps {
  onBack?: () => void;
  onExplore?: () => void;
}

export const About: React.FC<AboutProps> = ({ onBack, onExplore }) => {
  const { t } = useTranslation();
  return (
    <div className="page-shell bg-stone-50/60 text-charcoal">
      {/* Hero Section */}
      <section className="relative py-10 sm:py-10 md:py-10 px-5 sm:px-6 overflow-hidden pt-28 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6 lg:gap-6 items-center relative z-10"
        >
          <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[2rem] sm:rounded-[3rem] shadow-[0_30px_70px_rgba(0,0,0,0.12)] md:shadow-[0_45px_100px_rgba(0,0,0,0.12)] border-[6px] sm:border-[10px] md:border-[12px] border-white ring-1 ring-stone-100">
            <img
              src="/lola.png"
              alt="Hey Lola Manifesto"
              className="w-full h-full object-cover bg-white"
            />
          </div>

          <div className="space-y-6 md:space-y-8 text-center md:text-left">
            <div className="inline-flex flex-col items-center md:items-start gap-4">
              <BrandLogo size="lg" />
              <div className="h-12 w-px bg-stone-200" />
              <div className="px-5 py-2 bg-charcoal text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                {t.about.tagline}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif tracking-tight leading-[0.9] sm:leading-[0.85] text-charcoal/90">
              {t.about.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-stone-500 font-light max-w-xl leading-relaxed italic md:border-l md:border-stone-100 md:pl-6">
              {t.about.subtitle}
            </p>
          </div>
        </motion.div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-stone-50/40 rounded-full blur-[140px] pointer-events-none -z-0" />
      </section>

      {/* Story Section */}
      <section className="py-8 sm:py-10 px-5 sm:px-6 max-w-4xl mx-auto border-t border-stone-100 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 md:space-y-6 lg:space-y-6 relative"
        >
          <div className="space-y-8 md:space-y-8">
            <div className="space-y-5 sm:space-y-6 md:space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-stone-400">The Genesis</span>
                <div className="h-px w-12 bg-stone-200" />
              </div>
              <h2 className="text-3xl sm:text-3xl md:text-4xl text-charcoal/90 leading-[1.15] sm:leading-[1.1] font-serif italic tracking-tight">
                {t.about.story1}
              </h2>
            </div>

            <div className="space-y-5 sm:space-y-6 md:space-y-8">
              <p className="text-base sm:text-lg md:text-xl text-stone-500 leading-relaxed font-light italic tracking-wide max-w-xl">
                {t.about.story2}
              </p>
              <div className="h-0.5 w-20 md:w-24 bg-charcoal" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-8 border-t border-stone-100 pt-8 md:pt-12">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">The Mission</span>
                <p className="text-lg font-serif italic text-charcoal/80 leading-snug">Refining the coexistence of pets and their sophisticated humans.</p>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">The Context</span>
                <p className="text-lg font-serif italic text-charcoal/80 leading-snug">The world's first curated ecosystem for the modern companion.</p>
              </div>
            </div>

            <div className="pt-6 md:pt-8 flex flex-col items-start gap-4">
              <p className="text-3xl md:text-3xl text-charcoal/90 leading-none font-black uppercase tracking-tighter opacity-10 font-sans italic">
                {t.about.story3}
              </p>
              <div className="flex items-center gap-4 w-full">
                <div className="h-px bg-stone-200 flex-grow" />
                <p className="text-stone-400 font-black text-[10px] tracking-[0.6em] whitespace-nowrap uppercase">
                  Legacy Series
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="py-8 sm:py-10 md:py-10 px-5 sm:px-6 bg-charcoal text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 md:p-20 opacity-5 pointer-events-none hidden md:block">
          <BrandLogo size="8xl" variant="white" className="-rotate-12" />
        </div>

        <div className="max-w-4xl mx-auto space-y-8 md:space-y-8 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-stone-400">The Lola Philosophy</span>
          <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif italic font-light tracking-tight leading-[1.15] sm:leading-[1.1]">
            "We believe sophistication shouldn't stop where our leash begins."
          </h2>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 sm:w-16 h-px bg-stone-300" />
            <p className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-stone-400">— Silvia Mogas, Founder</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 sm:py-10 px-5 sm:px-6 text-center bg-stone-50/60 relative">
        <div className="max-w-2xl mx-auto space-y-6 md:space-y-6 relative z-10">
          <div className="space-y-3 md:space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] sm:tracking-[0.4em] text-stone-400">The Next Chapter</span>
            <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif italic text-charcoal leading-[1.05] sm:leading-none tracking-tight">{t.about.ctaTitle}</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-charcoal text-white rounded-full font-black text-[11px] uppercase tracking-[0.22em] sm:tracking-[0.25em] shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:bg-neutral-800 hover:scale-105 transition-all duration-500 group flex items-center justify-center gap-3"
            >
              {t.about.ctaPrimary} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-white border-2 border-stone-100 text-charcoal rounded-full font-black text-[11px] uppercase tracking-[0.22em] sm:tracking-[0.25em] hover:border-stone-200 hover:bg-stone-50 transition-all duration-300"
            >
              {t.about.ctaSecondary}
            </button>
          </div>

          <div className="pt-12 md:pt-10 opacity-20">
            <BrandLogo size="md" />
          </div>
        </div>

        <div className="absolute inset-0 opacity-[0.02] pointer-events-none grayscale" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />
      </section>
    </div>
  );
};
