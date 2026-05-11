import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Download, Type, Palette, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CONCIERGES, POSE_COUNT, conciergePose, type ConciergeProfile } from '../data/concierges';

interface BrandBookProps {
  onBack: () => void;
  onOpenCharacter: (id: ConciergeProfile['id']) => void;
}

const PALETTE = [
  { name: 'Charcoal', hex: '#1A1A1A', role: 'Primary text' },
  { name: 'Brand Orange', hex: '#C4622D', role: 'Brand accent' },
  { name: 'Sage', hex: '#6E8C5D', role: 'Secondary accent' },
  { name: 'Bone', hex: '#F5F0E8', role: 'Surfaces' },
  { name: 'Stone 50', hex: '#FAFAF9', role: 'Backgrounds' },
  { name: 'Stone 400', hex: '#A8A29E', role: 'Muted text' },
];

const TYPOGRAPHY = [
  {
    family: 'Serif Italic',
    sample: 'Your dog\'s lifestyle concierge.',
    use: 'Headlines, editorial moments, brand voice.',
    css: 'font-serif italic',
  },
  {
    family: 'Boutique Sans',
    sample: 'A boutique lifestyle concierge for life with your dog.',
    use: 'Body copy, supporting text.',
    css: 'font-boutique',
  },
  {
    family: 'Mono Caps',
    sample: 'MEMBERSHIP · CITY GUIDE · CONCIERGE',
    use: 'Kickers, labels, navigation.',
    css: 'font-sans uppercase tracking-[0.4em] text-xs font-black',
  },
];

const VOICE = [
  { label: 'Premium', body: 'Curated, considered, never loud.' },
  { label: 'Warm', body: 'A friend who happens to know all the best places.' },
  { label: 'Helpful', body: 'Clear, useful, written like a concierge — not an app.' },
  { label: 'Lifestyle-led', body: 'About living with your dog, not just owning one.' },
];

export const BrandBook: React.FC<BrandBookProps> = ({ onBack, onOpenCharacter }) => {
  return (
    <main className="bg-white page-shell font-boutique text-charcoal" aria-labelledby="brandbook-heading">
      {/* Hero */}
      <section className="relative bg-charcoal overflow-hidden pt-14 pb-12 px-5 sm:px-6" aria-labelledby="brandbook-heading">
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
            <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">Brand Kit</span>
            <h1 id="brandbook-heading" className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9] text-white">
              Hey Lola Brand Book<span className="text-brand-orange">.</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug max-w-2xl">
              The visual and verbal system behind a boutique lifestyle concierge for dog parents. Logos, palette, type, voice and the four concierges.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Table of contents */}
      <nav aria-label="Brand book sections" className="border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-5 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
          <a href="#logos" className="hover:text-charcoal transition-colors">01 — Logos</a>
          <a href="#colors" className="hover:text-charcoal transition-colors">02 — Colours</a>
          <a href="#typography" className="hover:text-charcoal transition-colors">03 — Typography</a>
          <a href="#voice" className="hover:text-charcoal transition-colors">04 — Voice</a>
          <a href="#concierges" className="hover:text-charcoal transition-colors">05 — Concierges</a>
        </div>
      </nav>

      {/* 01 — Logos */}
      <section id="logos" aria-labelledby="logos-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">01 — Logos</span>
          <h2 id="logos-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">The Hey Lola wordmark<span className="text-brand-orange">.</span></h2>
          <p className="text-sm text-stone-500 font-light italic max-w-xl leading-relaxed">
            One wordmark, three surfaces. Keep clear space equal to the height of the "H".
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <LogoCard label="Light" surface="bg-white" textTone="charcoal" />
          <LogoCard label="Cream" surface="bg-stone-50" textTone="charcoal" />
          <LogoCard label="Dark" surface="bg-charcoal" textTone="white" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
          <a
            href="/logo.svg"
            download
            className="inline-flex items-center gap-2 bg-charcoal text-white px-4 py-2 rounded-full hover:bg-charcoal/80 transition-colors"
          >
            <Download size={11} /> SVG
          </a>
          <a
            href="/favicon.svg"
            download
            className="inline-flex items-center gap-2 border border-stone-200 text-stone-500 px-4 py-2 rounded-full hover:text-charcoal hover:border-charcoal transition-colors"
          >
            <Download size={11} /> Favicon
          </a>
        </div>
      </section>

      {/* 02 — Colours */}
      <section id="colors" aria-labelledby="colors-heading" className="py-14 sm:py-16 px-5 sm:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2"><Palette size={11} /> 02 — Colours</span>
            <h2 id="colors-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">A warm, editorial palette<span className="text-brand-orange">.</span></h2>
            <p className="text-sm text-stone-500 font-light italic max-w-xl leading-relaxed">
              Charcoal carries the brand. Orange is the one accent. Sage, bone and stone tones do the rest.
            </p>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PALETTE.map((c) => (
              <div key={c.hex} className="space-y-2">
                <div
                  className="aspect-square rounded-2xl border border-stone-200 shadow-sm"
                  style={{ background: c.hex }}
                  aria-label={`${c.name} swatch, ${c.hex}`}
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-serif italic text-charcoal">{c.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{c.hex}</p>
                  <p className="text-[11px] text-stone-500 italic font-light">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 — Typography */}
      <section id="typography" aria-labelledby="type-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2"><Type size={11} /> 03 — Typography</span>
          <h2 id="type-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">Editorial, with a sans for clarity<span className="text-brand-orange">.</span></h2>
        </header>

        <div className="space-y-4">
          {TYPOGRAPHY.map((t) => (
            <article key={t.family} className="rounded-2xl border border-stone-100 bg-white p-6 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{t.family}</p>
                <p className="text-[11px] text-stone-400 italic">{t.use}</p>
              </div>
              <p className={`text-2xl sm:text-3xl ${t.css}`}>{t.sample}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 04 — Voice */}
      <section id="voice" aria-labelledby="voice-heading" className="py-14 sm:py-16 px-5 sm:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2"><Sparkles size={11} /> 04 — Voice</span>
            <h2 id="voice-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">Premium. Warm. Useful<span className="text-brand-orange">.</span></h2>
            <p className="text-sm text-stone-500 font-light italic max-w-xl leading-relaxed">
              "A boutique lifestyle concierge for life with your dog."
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VOICE.map((v) => (
              <article key={v.label} className="rounded-2xl bg-white border border-stone-100 p-5 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{v.label}</p>
                <p className="text-sm text-charcoal/80 italic font-light leading-relaxed">{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — Concierges */}
      <section id="concierges" aria-labelledby="concierges-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-7xl mx-auto">
        <header className="mb-10 space-y-2 max-w-2xl">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">05 — Concierges</span>
          <h2 id="concierges-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">The four concierges<span className="text-brand-orange">.</span></h2>
          <p className="text-sm text-stone-500 font-light italic leading-relaxed">
            Each concierge has a personality, a role and a full pose pack. Click any face to open their dedicated page.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CONCIERGES.map((c) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onOpenCharacter(c.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
              <div className="p-6 space-y-2">
                <h3 className="text-2xl font-serif italic tracking-tight leading-none">{c.name}</h3>
                <p className="text-[11px] text-stone-400 italic">{c.role}</p>
                <p className="text-sm text-stone-500 font-light leading-snug pt-2 line-clamp-3">{c.tagline}</p>
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-charcoal inline-flex items-center gap-1 pt-3">
                  Open page <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Footer of brand book */}
      <section className="py-12 px-5 sm:px-6 bg-charcoal text-center">
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Hey Lola — Boutique Lifestyle Concierge</p>
      </section>
    </main>
  );
};

function LogoCard({ label, surface, textTone }: { label: string; surface: string; textTone: 'charcoal' | 'white' }) {
  return (
    <div className={`rounded-2xl ${surface} border border-stone-100 p-8 flex flex-col items-center gap-5 aspect-square justify-center`}>
      <BrandLogo size="2xl" variant={textTone === 'white' ? 'white' : undefined} />
      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${textTone === 'white' ? 'text-white/60' : 'text-stone-400'}`}>{label}</p>
    </div>
  );
}

interface BrandBookCharacterProps {
  id: ConciergeProfile['id'];
  onBack: () => void;
  onOther: (id: ConciergeProfile['id']) => void;
}

export const BrandBookCharacter: React.FC<BrandBookCharacterProps> = ({ id, onBack, onOther }) => {
  const c = CONCIERGES.find((x) => x.id === id) ?? CONCIERGES[0];
  const others = CONCIERGES.filter((x) => x.id !== c.id);

  return (
    <main className="bg-white page-shell font-boutique text-charcoal" aria-labelledby={`concierge-${c.id}-heading`}>
      <section className={`${c.color} relative overflow-hidden pt-14 pb-10 px-5 sm:px-6`}>
        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
            aria-label="Back to Brand Book"
          >
            <ArrowLeft size={12} /> Brand Book
          </button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
          >
            <div className="space-y-5">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] ${c.badgeColor}`}>
                {c.role}
              </span>
              <h1 id={`concierge-${c.id}-heading`} className="text-5xl sm:text-6xl md:text-7xl font-serif italic tracking-tight leading-[0.9]">
                {c.name}<span style={{ color: c.accent }}>.</span>
              </h1>
              <p className="text-lg sm:text-xl font-light italic text-stone-600 leading-snug max-w-md">{c.tagline}</p>
              <p className="text-sm text-stone-500 font-light leading-relaxed max-w-md">{c.bio}</p>
            </div>
            <div className="flex justify-center">
              <img
                src={conciergePose(c.id, 1)}
                alt={`${c.name} concierge illustration`}
                className="w-full max-w-md object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.08)]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-5 sm:px-6 max-w-5xl mx-auto" aria-label={`${c.name} character traits`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Personality', value: c.personality },
            { label: 'Style', value: c.style },
            { label: 'Vibe', value: c.vibe },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-3 border-l-2 border-stone-100 pl-5">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">{label}</span>
              <p className="text-sm text-stone-600 font-light leading-relaxed italic">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10 px-5 sm:px-6 bg-stone-50 border-y border-stone-100" aria-labelledby={`pose-pack-${c.id}-heading`}>
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Pose Pack</span>
            <h2 id={`pose-pack-${c.id}-heading`} className="text-3xl sm:text-4xl font-serif italic tracking-tight">{c.name}'s 10 poses<span style={{ color: c.accent }}>.</span></h2>
            <p className="text-sm text-stone-400 font-light italic max-w-md mx-auto">
              All ten illustrations of {c.name}, ready to use across Hey Lola.
            </p>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: POSE_COUNT }, (_, i) => i + 1).map((pose) => (
              <motion.div
                key={pose}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: pose * 0.04 }}
                className={`aspect-square rounded-[1.25rem] ${c.color} border border-stone-100 flex items-center justify-center p-3 group hover:shadow-xl transition-all duration-500`}
              >
                <img
                  src={conciergePose(c.id, pose)}
                  alt={`${c.name} pose ${pose}`}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-5 sm:px-6 max-w-7xl mx-auto" aria-labelledby={`others-${c.id}-heading`}>
        <header className="text-center space-y-2 mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">The rest of the concierges</span>
          <h2 id={`others-${c.id}-heading`} className="text-2xl sm:text-3xl font-serif italic tracking-tight">Meet the others<span className="text-brand-orange">.</span></h2>
        </header>
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          {others.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onOther(o.id)}
              className="group flex flex-col items-center gap-3 text-center"
              aria-label={`Open ${o.name}'s page`}
            >
              <div className={`aspect-square w-full rounded-[1.5rem] ${o.color} border border-stone-100 overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1`}>
                <img src={conciergePose(o.id, 1)} alt={o.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="text-sm font-serif italic">{o.name}</p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};
