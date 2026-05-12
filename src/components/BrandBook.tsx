import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CONCIERGES, POSE_COUNT, conciergePose, type ConciergeProfile } from '../data/concierges';
import { SEO, personSchema } from '../lib/seo';

const BRAND_BOOK_BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'Brand Book', item: '/brand-book' },
];

interface BrandBookProps {
  onBack: () => void;
  onOpenCharacter: (id: ConciergeProfile['id']) => void;
}

const PALETTE = [
  { name: 'Background', hex: '#FFFFFF', role: 'Primary surfaces' },
  { name: 'Foreground', hex: '#0A0A0A', role: 'Text & wordmark' },
  { name: 'Warm Accent', hex: '#F28C33', role: 'Brand orange accent' },
  { name: 'Sage', hex: '#6E8C5D', role: 'Secondary accent' },
  { name: 'Bone', hex: '#F5F0E8', role: 'Warm surfaces' },
  { name: 'Muted', hex: '#A8A29E', role: 'Muted text' },
];

interface LogoVariant {
  label: string;
  surface: string;
  textTone: 'black' | 'white' | 'orange';
  mark?: boolean;
}

const LOGO_VARIANTS: LogoVariant[] = [
  { label: 'On Light',  surface: 'bg-white',       textTone: 'black' },
  { label: 'On Dark',   surface: 'bg-charcoal',    textTone: 'white' },
];

const ICON_VARIANTS: LogoVariant[] = [
  { label: 'Icon · On Light', surface: 'bg-white',    textTone: 'black', mark: true },
  { label: 'Icon · On Dark',  surface: 'bg-charcoal', textTone: 'white', mark: true },
  { label: 'Icon · Accent',   surface: 'bg-bone',     textTone: 'orange', mark: true },
];

export const BrandBook: React.FC<BrandBookProps> = ({ onBack, onOpenCharacter }) => {
  return (
    <main className="bg-white page-shell font-boutique text-charcoal" aria-labelledby="brandbook-heading">
      <SEO
        title="Hey Lola Brand Kit — Logos, Colours, Typography & Concierges"
        description="Official brand assets and usage guidelines for Hey Lola, a boutique lifestyle concierge for dog parents. Download the logo, browse the palette and meet the four concierges."
        url="/brand-book"
        breadcrumbs={BRAND_BOOK_BREADCRUMBS}
      />
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
              Hey Lola Brand Kit<span className="text-brand-orange">.</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug max-w-2xl">
              Official brand assets and usage guidelines for Hey Lola — a boutique lifestyle concierge for dog parents.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Logo + Wordmark */}
      <section id="logos" aria-labelledby="logos-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Logo + Wordmark</span>
          <h2 id="logos-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
            The HeyLola wordmark<span className="text-brand-orange">.</span>
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {LOGO_VARIANTS.map((v) => (
            <LogoTile key={v.label} variant={v} />
          ))}
        </div>

        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mt-12 mb-4">Icon Only</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ICON_VARIANTS.map((v) => (
            <LogoTile key={v.label} variant={v} />
          ))}
        </div>
      </section>

      {/* Color Palette */}
      <section id="colors" aria-labelledby="colors-heading" className="py-14 sm:py-16 px-5 sm:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Color Palette</span>
            <h2 id="colors-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              A warm, editorial palette<span className="text-brand-orange">.</span>
            </h2>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PALETTE.map((c) => (
              <div key={c.hex} className="space-y-2">
                <div
                  className={`aspect-square rounded-2xl border ${c.hex === '#FFFFFF' ? 'border-stone-200' : 'border-transparent'} shadow-sm`}
                  style={{ background: c.hex }}
                  aria-label={`${c.name} swatch, ${c.hex}`}
                />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{c.name}</p>
                  <p className="text-sm font-serif italic text-charcoal">{c.hex}</p>
                  <p className="text-[11px] text-stone-500 italic font-light leading-snug">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typography */}
      <section id="typography" aria-labelledby="type-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Typography</span>
          <h2 id="type-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
            Two typefaces, one voice<span className="text-brand-orange">.</span>
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="rounded-2xl border border-stone-100 bg-white p-7">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Display Font</span>
            <p className="text-4xl sm:text-5xl font-serif italic mt-3 leading-none">Hey Lola.</p>
            <p className="text-base font-serif italic text-charcoal/70 mt-4">Editorial Serif</p>
            <p className="text-sm text-stone-500 font-light italic leading-relaxed mt-2">
              Used for large headlines, taglines and editorial statements. Always set in italic.
            </p>
          </article>

          <article className="rounded-2xl border border-stone-100 bg-white p-7">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Body Font</span>
            <p className="text-2xl font-boutique mt-3 leading-snug">A boutique lifestyle concierge for life with your dog.</p>
            <p className="text-base font-boutique text-charcoal/70 mt-4">Boutique Sans</p>
            <p className="text-sm text-stone-500 font-light italic leading-relaxed mt-2">
              Used for body text, navigation and UI elements. Wide letter-spacing for uppercase labels.
            </p>
          </article>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section id="usage" aria-labelledby="usage-heading" className="py-14 sm:py-16 px-5 sm:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Usage Guidelines</span>
            <h2 id="usage-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              How to use the brand<span className="text-brand-orange">.</span>
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Clear Space', body: 'Maintain a minimum clear space equal to the height of the "H" in "Hey" around all logo variations.' },
              { title: 'Minimum Size', body: 'The full wordmark should not be displayed smaller than 120px wide. The icon-only mark minimum is 32px.' },
              { title: 'Background', body: 'Use the light variant on light backgrounds and the dark variant on dark backgrounds. Never place the logo on busy imagery — use the cream surface or a charcoal block instead.' },
              { title: 'Modification', body: 'Do not stretch, rotate, recolor, or add effects to the logo. Use only the provided variations. The trailing period stays orange — always.' },
            ].map((g) => (
              <article key={g.title} className="rounded-2xl bg-white border border-stone-100 p-6 space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{g.title}</h3>
                <p className="text-sm text-stone-600 font-light leading-relaxed">{g.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Concierges */}
      <section id="concierges" aria-labelledby="concierges-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-7xl mx-auto">
        <header className="mb-10 space-y-2 max-w-2xl">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Concierges</span>
          <h2 id="concierges-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">The four concierges<span className="text-brand-orange">.</span></h2>
          <p className="text-sm text-stone-500 font-light italic leading-relaxed">
            Each concierge has a personality, a role and a full pose pack. Tap any face to open their dedicated page.
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
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-charcoal inline-flex items-center gap-1 pt-3">
                  Open page <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Footer back link */}
      <section className="py-12 px-5 sm:px-6 text-center border-t border-stone-100">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-charcoal transition-colors"
        >
          <ArrowLeft size={12} /> Back to Hey Lola
        </button>
      </section>
    </main>
  );
};

function LogoTile({ variant }: { variant: LogoVariant }) {
  const isDark = variant.surface.includes('charcoal');
  return (
    <article className={`rounded-2xl ${variant.surface} border ${isDark ? 'border-charcoal' : 'border-stone-100'} p-8 flex flex-col items-center gap-6 aspect-[4/3] justify-center relative overflow-hidden`}>
      <BrandLogo
        size={variant.mark ? 'xl' : '3xl'}
        variant={variant.textTone}
        mark={variant.mark}
      />
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
        <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-white/50' : 'text-stone-400'}`}>
          {variant.label}
        </span>
        <a
          href="/logo.svg"
          download={`heylola-${variant.label.toLowerCase().replace(/[^a-z]+/g, '-')}.svg`}
          className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full transition-colors ${
            isDark
              ? 'bg-white/10 text-white/70 hover:bg-white/20'
              : 'bg-charcoal/5 text-stone-500 hover:bg-charcoal/10'
          }`}
          aria-label={`Download ${variant.label} SVG`}
        >
          <Download size={9} /> SVG
        </a>
      </div>
    </article>
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
  const characterBreadcrumbs = [
    { name: 'Hey Lola', item: '/' },
    { name: 'Brand Book', item: '/brand-book' },
    { name: c.name, item: `/brand-book/${c.id}` },
  ];
  const characterJsonLd = personSchema({
    name: c.name,
    role: c.role,
    image: `/${c.id}.png`,
    url: `/brand-book/${c.id}`,
    description: c.bio,
  });

  return (
    <main className="bg-white page-shell font-boutique text-charcoal" aria-labelledby={`concierge-${c.id}-heading`}>
      <SEO
        title={`${c.name} — ${c.role} | Hey Lola Concierges`}
        description={`${c.name} is one of the four Hey Lola concierges — ${c.role}. ${c.bio}`}
        url={`/brand-book/${c.id}`}
        ogType="profile"
        ogImage={`https://heylola.co/${c.id}.png`}
        breadcrumbs={characterBreadcrumbs}
        jsonLd={characterJsonLd}
      />
      {/* Ficha — poster-style: name + role centered, 10 poses below */}
      <section className={`${c.color} relative overflow-hidden pt-10 pb-14 px-5 sm:px-6`}>
        <div className="max-w-6xl mx-auto relative z-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            aria-label="Back to The Concierges"
          >
            <ArrowLeft size={12} /> Concierges
          </button>

          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-2 mb-10 sm:mb-14"
          >
            <h1 id={`concierge-${c.id}-heading`} className="text-6xl sm:text-7xl md:text-8xl font-serif italic tracking-tight leading-none">
              {c.name}<span style={{ color: c.accent }}>.</span>
            </h1>
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.5em] text-stone-400">
              {c.role}
            </p>
          </motion.header>

          {/* 5×2 poses grid */}
          <div className="grid grid-cols-5 grid-rows-2 gap-2 sm:gap-4 max-w-5xl mx-auto">
            {Array.from({ length: POSE_COUNT }, (_, i) => i + 1).map((pose) => (
              <motion.div
                key={pose}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: pose * 0.04 }}
                className="aspect-square flex items-center justify-center"
              >
                <img
                  src={conciergePose(c.id, pose)}
                  alt={`${c.name} pose ${pose}`}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supporting details */}
      <section className="py-12 px-5 sm:px-6 max-w-5xl mx-auto space-y-8" aria-label={`${c.name} character details`}>
        <p className="text-base sm:text-lg font-light italic text-stone-600 leading-snug max-w-2xl mx-auto text-center">{c.tagline}</p>
        <p className="text-sm sm:text-base text-stone-500 font-light leading-relaxed max-w-2xl mx-auto text-center">{c.bio}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
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
