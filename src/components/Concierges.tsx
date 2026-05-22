import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CONCIERGES, type ConciergeProfile } from '../data/concierges';
import { ConciergeAvatar } from './ConciergeAvatar';
import { EditorialPoster, type PosterTone } from './editorial/EditorialPoster';
import { SEO } from '../lib/seo';

interface ConciergesProps {
  onBack: () => void;
  onOpenCharacter: (id: ConciergeProfile['id']) => void;
}

const BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'The Concierges', item: '/concierges' },
];

// Alternating editorial tones so the grid reads as a curated set,
// not four identical cards. Matches the reference poster system.
const TONES: PosterTone[] = ['light', 'dark', 'orange', 'light'];

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

      {/* Editorial poster grid */}
      <section className="py-14 sm:py-16 px-5 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 max-w-sm mx-auto gap-5">
          {CONCIERGES.map((c, i) => {
            const tone = TONES[i % TONES.length];
            if (!c.revealed) {
              return (
                <article
                  key={c.id}
                  className="rounded-[1.75rem] overflow-hidden bg-stone-50 border border-dashed border-stone-200 flex flex-col"
                  aria-label={`Concierge starting with ${c.name[0]} — coming soon`}
                >
                  <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200/60 flex items-center justify-center relative overflow-hidden">
                    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-[10rem] font-serif italic text-stone-300/40 select-none blur-[2px]">?</span>
                    <span className="relative text-8xl font-serif italic text-stone-400 select-none tracking-tight">{c.name[0]}…</span>
                    <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-[0.3em] bg-white/85 backdrop-blur text-stone-500 rounded-full px-2.5 py-1 border border-stone-100">
                      Coming soon
                    </span>
                  </div>
                  <div className="p-6 sm:p-7 flex-1 flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-stone-400">Coming soon</span>
                    <h3 className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-[0.95] text-stone-500">
                      Hey, {c.name[0]}…<span className="brand-dot brand-dot--soft" aria-hidden="true" />
                    </h3>
                    <p className="text-sm font-light italic text-stone-400 leading-snug">A new face joining the pack soon.</p>
                  </div>
                </article>
              );
            }
            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => onOpenCharacter(c.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group text-left rounded-[1.75rem] overflow-hidden hover:-translate-y-1 transition-transform duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
                aria-label={`Open ${c.name}'s page — ${c.role}`}
              >
                <EditorialPoster
                  tone={tone}
                  accent={c.accent}
                  kicker={c.role}
                  title={`Hey, ${c.name}`}
                  caption={c.tagline}
                  className="h-full"
                  media={
                    <div className={`absolute inset-0 ${tone === 'dark' ? 'bg-white/[0.04]' : tone === 'orange' ? 'bg-black/[0.04]' : c.color} flex items-center justify-center`}>
                      <ConciergeAvatar
                        id={c.id}
                        poseIndex={1}
                        rounded="none"
                        alt={`${c.name} — ${c.role}`}
                        className="w-full h-full !object-contain group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  }
                  footer={
                    <span className={`text-[11px] font-black uppercase tracking-[0.25em] inline-flex items-center gap-1 ${tone === 'dark' ? 'text-white' : 'text-charcoal'}`}>
                      Open ficha <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  }
                />
              </motion.button>
            );
          })}
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
