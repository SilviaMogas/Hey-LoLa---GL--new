import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Sprout,
  ShieldCheck,
  Users,
  Lightbulb,
  Mail,
} from 'lucide-react';
import { SEO } from '../lib/seo';

interface HeyKaiFoundationProps {
  onBack: () => void;
  /**
   * Optional: when provided, the page surfaces a CTA section for the
   * horse-adoption listing at /heykai/horses. Wired through App.tsx so
   * this component stays presentation-only.
   */
  onSeeHorses?: () => void;
}

const BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'HeyKai Foundation', item: '/heykai' },
];

// Grass-green palette — sister foundation to Hey Lola, for horses.
// Uses the existing brand sage as the primary accent so the two
// foundations harmonise without one feeling pasted-in.
const GRASS = '#6E8C5D';
const GRASS_TINT = 'bg-[#F4F8EF]';

const PILLARS = [
  {
    icon: Sprout,
    label: 'Rescue & Sanctuary',
    body: 'Partner with horse rescues and sanctuaries to support retired sport horses, working horses and abandoned ponies looking for their next chapter.',
  },
  {
    icon: ShieldCheck,
    label: 'Welfare & Vet Care',
    body: 'Help fund emergency vet visits, farriers and rehabilitation for horses in transition — between owners, stables, or borders.',
  },
  {
    icon: Users,
    label: 'Community & Therapy',
    body: 'Spotlight equine-assisted therapy programs, sponsor open ride-outs, and connect riders and stables around a shared welfare standard.',
  },
  {
    icon: Lightbulb,
    label: 'Education & Heritage',
    body: 'Free guides on horse care, ethical riding, retirement planning and the working-horse traditions worth preserving for the next generation.',
  },
];

export const HeyKaiFoundation: React.FC<HeyKaiFoundationProps> = ({ onBack, onSeeHorses }) => {
  return (
    <main className="bg-white page-shell font-boutique text-charcoal" aria-labelledby="heykai-heading">
      <SEO
        title="HeyKai Foundation — For the ones who carried us"
        description="The HeyKai Foundation is the equine sister of Hey Lola — supporting horse rescues, welfare, community and education. Named after Kai, our founder's first companion."
        url="/heykai"
        breadcrumbs={BREADCRUMBS}
      />

      {/* Hero */}
      <section className="relative bg-charcoal overflow-hidden pt-14 pb-14 px-5 sm:px-6">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${GRASS}24, transparent 60%)`,
          }}
        />
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
            <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: GRASS }}>
              HeyKai Foundation
            </span>
            <h1
              id="heykai-heading"
              className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9] text-white"
            >
              For the ones who<br />
              <span className="text-white/40">carried us</span>
              <span
                aria-hidden="true"
                className="inline-block ml-2"
                style={{ width: '0.26em', height: '0.26em', background: GRASS, verticalAlign: 'baseline' }}
              />
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug max-w-2xl">
              The equine sister to the Hey Lola Foundation. Named after Kai, the horse who shaped our founder&apos;s story.
              HeyKai supports horse rescues, welfare, community and education — with the same warmth, the same rigour, and a green of our own.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Our Mission</span>
          <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
            More than a foundation
            <span
              aria-hidden="true"
              className="inline-block ml-2"
              style={{ width: '0.22em', height: '0.22em', background: GRASS, verticalAlign: 'baseline' }}
            />
          </h2>
        </header>
        <div className="space-y-5 text-base sm:text-lg text-stone-600 leading-relaxed">
          <p>
            Horses gave us so much — work, play, dignity, healing. They deserve a place that honours
            them when their working years end and a network that protects them while they&apos;re still
            doing the carrying.
          </p>
          <p>
            HeyKai exists to make that easier. We partner with rescues and sanctuaries, fund welfare
            interventions, run community events, and publish education so every horse owner —
            professional or hobbyist — can make confident, kind decisions.
          </p>
          <p className="font-serif italic text-charcoal/80">
            Quiet, transparent, hands-on. The same Hey Lola values, just greener.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className={`${GRASS_TINT} py-14 sm:py-16 px-5 sm:px-6 border-y border-stone-100`}>
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Four Pillars</span>
            <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              How HeyKai shows up
              <span
                aria-hidden="true"
                className="inline-block ml-2"
                style={{ width: '0.22em', height: '0.22em', background: GRASS, verticalAlign: 'baseline' }}
              />
            </h2>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PILLARS.map(({ icon: Icon, label, body }) => (
              <article key={label} className="rounded-2xl bg-white border border-stone-100 p-6 space-y-3 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `${GRASS}1A`, color: GRASS }}
                >
                  <Icon size={18} />
                </div>
                <h3 className="text-xl font-serif italic tracking-tight">{label}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Horses for adoption — opens the live listing */}
      {onSeeHorses && (
        <section className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto">
          <div
            className="rounded-[2rem] border p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
            style={{ background: '#F4F8EF', borderColor: '#e2ead9' }}
          >
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: GRASS }}>
                Horses looking for adopters
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif italic tracking-tight leading-tight">
                Meet rescue horses from our verified partners
                <span
                  aria-hidden="true"
                  className="inline-block ml-2"
                  style={{ width: '0.18em', height: '0.18em', background: GRASS, verticalAlign: 'baseline' }}
                />
              </h3>
              <p className="text-sm sm:text-base text-stone-500 font-light italic leading-snug">
                Each passport links back to the rescue handling the adoption — HeyKai surfaces them; the rescue decides.
              </p>
            </div>
            <button
              type="button"
              onClick={onSeeHorses}
              className="inline-flex items-center gap-2 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-full px-7 py-3.5 hover:opacity-90 transition-opacity self-start sm:self-auto"
              style={{ background: GRASS }}
            >
              See horses <ArrowRight size={13} />
            </button>
          </div>
        </section>
      )}

      {/* Contact / CTA */}
      <section className="py-14 sm:py-16 px-5 sm:px-6 max-w-3xl mx-auto text-center space-y-5">
        <Heart size={20} className="mx-auto" style={{ color: GRASS }} />
        <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
          Want to help
          <span
            aria-hidden="true"
            className="inline-block ml-2"
            style={{ width: '0.22em', height: '0.22em', background: GRASS, verticalAlign: 'baseline' }}
          />
        </h2>
        <p className="text-base sm:text-lg text-stone-500 font-light italic leading-snug max-w-xl mx-auto">
          Sanctuaries, vets, riders, sponsors — if you want to partner, tell us what you do and where.
          We&apos;ll get back within one week.
        </p>
        <a
          href="mailto:foundation@heylola.co?subject=HeyKai%20Foundation"
          className="inline-flex items-center gap-2 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-full px-7 py-3.5 hover:opacity-90 transition-opacity"
          style={{ background: GRASS }}
        >
          <Mail size={13} /> Write to HeyKai
        </a>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 pt-3">
          First public version — Draft
        </p>
      </section>
    </main>
  );
};
