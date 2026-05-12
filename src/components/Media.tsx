import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Mail, Download, Newspaper, Quote, Building2, MapPin, Calendar } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CONCIERGES, conciergePose } from '../data/concierges';
import { SEO } from '../lib/seo';

const MEDIA_BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'Press & Media', item: '/media' },
];

const PRESS_EMAIL = 'hey@heylola.co';

interface MediaProps {
  onBack: () => void;
}

const PRESS_FACTS = [
  { label: 'Founded', value: '2024', icon: Calendar },
  { label: 'Parent company', value: 'BMBWeb3 Global FZCO', icon: Building2 },
  { label: 'Launch city', value: 'Miami · 2026', icon: MapPin },
  { label: 'Coming next', value: 'New York City · Barcelona', icon: MapPin },
];

const DOWNLOADS = [
  { label: 'Logo (SVG)', href: '/logo.svg', desc: 'Master wordmark, light backgrounds.' },
  { label: 'Favicon (SVG)', href: '/favicon.svg', desc: 'App and tab favicon.' },
  { label: 'Open Graph (PNG)', href: '/og-image.png', desc: '1200×630 social preview.' },
];

const BRAND_STATEMENT = `Hey Lola is a boutique lifestyle concierge for dog parents. It brings together pet records, trusted dog-friendly places, verified partners and curated local perks in one elegant platform — launching first in Miami.`;

export const Media: React.FC<MediaProps> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard?.writeText(PRESS_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard not available
    }
  };

  return (
    <main className="bg-white page-shell text-charcoal font-boutique" aria-labelledby="media-heading">
      <SEO
        title="Press & Media — Hey Lola"
        description="Press kit for Hey Lola, a boutique lifestyle concierge for dog parents launching first in Miami. Fact sheet, brand statement, downloads and press contact."
        url="/media"
        breadcrumbs={MEDIA_BREADCRUMBS}
      />
      {/* Hero */}
      <section className="relative bg-charcoal overflow-hidden pt-14 pb-12 px-5 sm:px-6" aria-labelledby="media-heading">
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
            <span className="inline-flex items-center gap-2 text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">
              <Newspaper size={11} /> Media Kit
            </span>
            <h1 id="media-heading" className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9] text-white">
              Press &amp; Media<span className="text-brand-orange">.</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug max-w-2xl">
              Brand assets, press materials and contact for journalists, partners and lifestyle editors covering the launch of Hey Lola.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`mailto:${PRESS_EMAIL}?subject=Press%20enquiry`}
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 bg-white text-charcoal px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-100 transition-colors"
              >
                <Mail size={12} /> {PRESS_EMAIL}
              </a>
              {copied && (
                <span className="self-center text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">Copied</span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* TOC */}
      <nav aria-label="Media kit sections" className="border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-5 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
          <a href="#fact-sheet" className="hover:text-charcoal transition-colors">01 — Fact sheet</a>
          <a href="#statement" className="hover:text-charcoal transition-colors">02 — Brand statement</a>
          <a href="#downloads" className="hover:text-charcoal transition-colors">03 — Downloads</a>
          <a href="#concierges" className="hover:text-charcoal transition-colors">04 — Concierges</a>
          <a href="#contact" className="hover:text-charcoal transition-colors">05 — Contact</a>
        </div>
      </nav>

      {/* 01 — Fact sheet */}
      <section id="fact-sheet" aria-labelledby="facts-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">01 — Fact sheet</span>
          <h2 id="facts-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">The essentials<span className="text-brand-orange">.</span></h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRESS_FACTS.map((fact) => {
            const Icon = fact.icon;
            return (
              <article key={fact.label} className="rounded-2xl border border-stone-100 bg-white p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{fact.label}</p>
                  <p className="text-base sm:text-lg font-serif italic text-charcoal mt-1">{fact.value}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 02 — Brand statement */}
      <section id="statement" aria-labelledby="statement-heading" className="py-14 sm:py-16 px-5 sm:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
              <Quote size={11} /> 02 — Brand statement
            </span>
            <h2 id="statement-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">For press use<span className="text-brand-orange">.</span></h2>
          </header>
          <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif italic text-charcoal/80 leading-snug max-w-3xl">
            "{BRAND_STATEMENT}"
          </blockquote>
          <p className="text-sm text-stone-400 font-light italic mt-4">— Hey Lola, official statement</p>
        </div>
      </section>

      {/* 03 — Downloads */}
      <section id="downloads" aria-labelledby="downloads-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">03 — Downloads</span>
          <h2 id="downloads-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">Brand assets<span className="text-brand-orange">.</span></h2>
          <p className="text-sm text-stone-500 font-light italic max-w-xl leading-relaxed">
            High-resolution logos and visuals ready for press use. For full brand guidelines see the <a href="/brand-book" className="underline decoration-stone-300 underline-offset-4 hover:decoration-charcoal">Brand Book</a>.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DOWNLOADS.map((d) => (
            <a
              key={d.href}
              href={d.href}
              download
              className="group rounded-2xl border border-stone-100 bg-white p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3"
            >
              <div className="aspect-square rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center">
                <BrandLogo size="xl" className="opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-serif italic text-charcoal">{d.label}</p>
                <p className="text-[11px] text-stone-500 italic font-light leading-snug">{d.desc}</p>
              </div>
              <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-charcoal">
                <Download size={11} /> Download
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* 04 — Concierges */}
      <section id="concierges" aria-labelledby="press-concierges" className="py-14 sm:py-16 px-5 sm:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">04 — Concierges</span>
            <h2 id="press-concierges" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">The four faces of Hey Lola<span className="text-brand-orange">.</span></h2>
            <p className="text-sm text-stone-500 font-light italic max-w-xl leading-relaxed">
              The illustrated concierges. Right-click any image to save the high-resolution PNG.
            </p>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CONCIERGES.map((c) => (
              <a
                key={c.id}
                href={conciergePose(c.id, 1)}
                download={`heylola-concierge-${c.id}.png`}
                className={`group rounded-2xl ${c.color} border border-stone-100 p-3 flex flex-col items-center hover:shadow-xl transition-shadow duration-500`}
                aria-label={`Download ${c.name} concierge image`}
              >
                <div className="aspect-square w-full flex items-center justify-center">
                  <img
                    src={conciergePose(c.id, 1)}
                    alt={`${c.name} — ${c.role}`}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-sm font-serif italic mt-2">{c.name}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400 mt-1">{c.role}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — Contact */}
      <section id="contact" aria-labelledby="contact-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-3xl mx-auto text-center space-y-5">
        <header className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">05 — Contact</span>
          <h2 id="contact-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">Press enquiries<span className="text-brand-orange">.</span></h2>
        </header>
        <p className="text-base text-stone-500 font-light italic leading-relaxed">
          We typically reply within two business days. For exclusives, interviews or partnership coverage, please mention the outlet and timeline.
        </p>
        <a
          href={`mailto:${PRESS_EMAIL}?subject=Press%20enquiry`}
          className="luxury-button-primary inline-flex items-center justify-center gap-2 h-12 px-8 text-[11px] shadow-lg"
        >
          <Mail size={14} /> {PRESS_EMAIL} <ArrowRight size={12} />
        </a>
      </section>
    </main>
  );
};
