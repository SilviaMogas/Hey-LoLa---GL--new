import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CONCIERGES, conciergePose, type ConciergeProfile } from '../data/concierges';
import { SEO } from '../lib/seo';

interface ConciergesProps {
  onBack: () => void;
  onOpenCharacter: (id: ConciergeProfile['id']) => void;
}

const BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'The Concierges', item: '/concierges' },
];

export const Concierges: React.FC<ConciergesProps> = ({ onBack, onOpenCharacter }) => {
  return (
    <main className="bg-white page-shell font-boutique text-charcoal" aria-labelledby="concierges-heading">
      <SEO
        title="The Hey Lola Concierges — Lola, Taco, Nuc & Toby"
        description="Meet the four Hey Lola concierges. Each one represents a facet of the boutique lifestyle concierge for dog parents — from corner-table brunches to weekend road trips."
        url="/concierges"
        breadcrumbs={BREADCRUMBS}
      />

      {/* Hero */}
      <section className="relative bg-charcoal overflow-hidden pt-14 pb-12 px-5 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative z-10 space-y-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
            aria-label="Go back"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">The Concierges</span>
            <h1 id="concierges-heading" className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9] text-white">
              Meet the four concierges<span className="brand-dot" aria-hidden="true" />
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug max-w-2xl">
              Four illustrated concierges, four personalities. Together they shape how Hey Lola sounds, feels and moves. Tap any face to open their full page.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Fichas */}
      <section className="py-14 sm:py-16 px-5 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CONCIERGES.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onOpenCharacter(c.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative flex flex-col h-full rounded-[2rem] bg-white border border-stone-100 overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
              aria-label={`Open ${c.name}'s page — ${c.role}`}
            >
              <div className={`aspect-square ${c.color} flex items-center justify-center relative overflow-hidden`}>
                <img
                  src={conciergePose(c.id, 1)}
                  alt={`${c.name} — ${c.role}`}
                  className="relative z-10 w-full h-full object-contain group-hover:scale-110 transition-all duration-700"
                />
              </div>
              <div className="p-6 space-y-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] ${c.badgeColor}`}>
                  {c.role}
                </span>
                <h2 className="text-3xl font-serif italic tracking-tight leading-none">
                  {c.name}<span className="brand-dot" aria-hidden="true" style={{ backgroundColor: c.accent }} />
                </h2>
                <p className="text-sm text-stone-500 font-light italic leading-snug">{c.tagline}</p>
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-charcoal inline-flex items-center gap-1 pt-2">
                  Open ficha <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Link to brand book */}
      <section className="py-12 px-5 sm:px-6 bg-stone-50 border-t border-stone-100 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-3">Looking for assets?</p>
        <p className="text-base sm:text-lg font-serif italic text-charcoal/80 max-w-md mx-auto mb-5">
          Logos, palette, typography and usage guidelines live in the Brand Book.
        </p>
        <a
          href="/brand-book"
          className="inline-flex items-center gap-2 luxury-button border border-stone-200 text-stone-600 hover:text-charcoal hover:border-charcoal h-12 px-8 text-[10px] font-black tracking-[0.25em] uppercase transition-colors"
        >
          Open Brand Book <ArrowRight size={12} />
        </a>
      </section>
    </main>
  );
};
