import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ExternalLink, MapPin, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  type FoundationHorse,
  type HorseCountry,
  countryLabel,
  rowToFoundationHorse,
} from '../data/foundationHorses';
import { SEO } from '../lib/seo';

interface HeyKaiHorsesProps {
  onBack: () => void;
  onOpenPassport: (slug: string) => void;
}

// Grass-green palette — matches HeyKaiFoundation.tsx exactly.
const GRASS = '#6E8C5D';
const GRASS_TINT = '#F4F8EF';
const GRASS_SOFT_BORDER = '#e2ead9';

const BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'HeyKai Foundation', item: '/heykai' },
  { name: 'Horses', item: '/heykai/horses' },
];

const COUNTRIES: { key: HorseCountry | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'US', label: 'United States' },
  { key: 'ES', label: 'Spain' },
  { key: 'UK', label: 'United Kingdom' },
];

export const HeyKaiHorses: React.FC<HeyKaiHorsesProps> = ({ onBack, onOpenPassport }) => {
  const [horses, setHorses] = useState<FoundationHorse[] | null>(null);
  const [country, setCountry] = useState<HorseCountry | 'all'>('all');

  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const { data } = await supabase
          .from('foundation_horses')
          .select('*')
          .eq('status', 'available')
          .order('created_at', { ascending: false });
        const rows = (data || [])
          .map((r: Record<string, unknown>) => rowToFoundationHorse(r))
          .filter((h) => h.passport.visibility === 'public');
        setHorses(rows);
      } catch {
        setHorses([]);
      }
    };
    fetchHorses();
    const channel = supabase
      .channel('foundation-horses-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'foundation_horses' },
        () => fetchHorses(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const visible = useMemo(() => {
    if (!horses) return [];
    if (country === 'all') return horses;
    return horses.filter((h) => h.partnerCountry === country);
  }, [horses, country]);

  const loading = horses === null;

  return (
    <main className="bg-white min-h-screen text-charcoal font-boutique" aria-labelledby="horses-heading">
      <SEO
        title="Horses Looking for Adopters — HeyKai Foundation"
        description="Browse rescue horses listed by verified HeyKai Foundation partners across the US, Spain and the UK. Every passport links back to the rescue handling the adoption."
        url="/heykai/horses"
        breadcrumbs={BREADCRUMBS}
      />

      {/* Hero */}
      <section className="relative bg-charcoal overflow-hidden pt-14 pb-14 px-5 sm:px-6">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 30% 50%, ${GRASS}33, transparent 60%)` }}
        />
        <div className="max-w-5xl mx-auto relative z-10 space-y-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
            aria-label="Go back to HeyKai Foundation"
          >
            <ArrowLeft size={12} /> HeyKai Foundation
          </button>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5 max-w-3xl"
          >
            <span
              className="inline-flex items-center gap-2 font-black uppercase tracking-[0.4em] text-[10px]"
              style={{ color: GRASS }}
            >
              <ShieldCheck size={11} /> Verified by HeyKai Foundation
            </span>
            <h1
              id="horses-heading"
              className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9] text-white"
            >
              Horses looking for<br />
              <span className="text-white/40">the right adopter</span>
              <span
                aria-hidden="true"
                className="inline-block ml-2"
                style={{ width: '0.26em', height: '0.26em', background: GRASS, verticalAlign: 'baseline' }}
              />
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug">
              Every horse here is listed by a verified rescue partner. HeyKai surfaces their passports so adopters can find them — final adoption decisions stay with the rescue.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Country filter */}
      <section className="border-b border-stone-100 px-5 sm:px-6 py-5 sm:py-6">
        <div
          className="max-w-7xl mx-auto flex flex-wrap items-center gap-2"
          role="tablist"
          aria-label="Filter by country"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mr-2">
            Country
          </span>
          {COUNTRIES.map((c) => {
            const active = country === c.key;
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCountry(c.key)}
                className="px-4 h-9 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-colors border"
                style={
                  active
                    ? { background: GRASS, color: 'white', borderColor: GRASS }
                    : { background: 'white', color: '#57534e', borderColor: '#e7e5e4' }
                }
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Horses grid */}
      <section className="py-14 sm:py-16 px-5 sm:px-6 max-w-7xl mx-auto">
        {loading ? (
          <p className="text-center text-stone-400 italic font-light py-16">
            Loading horses…
          </p>
        ) : visible.length === 0 ? (
          <div className="text-center max-w-md mx-auto py-16 space-y-3">
            <p className="text-stone-400 italic font-light">
              No horses available {country !== 'all' ? `in ${countryLabel(country)} ` : ''}right now.
            </p>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-300">
              Check back soon — new passports go live as partners sync.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((horse, i) => (
              <HorseCard
                key={horse.id}
                horse={horse}
                delay={i * 0.06}
                onClick={() => onOpenPassport(horse.passport.slug)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

function HorseCard({
  horse,
  delay,
  onClick,
}: {
  horse: FoundationHorse;
  delay: number;
  onClick: () => void;
}) {
  const subline = [
    horse.breed,
    horse.ageLabel,
    horse.heightHands ? `${horse.heightHands} hh` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const country = horse.partnerCountry ? countryLabel(horse.partnerCountry) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group rounded-[1.5rem] border border-stone-100 bg-white overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
    >
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left"
        aria-label={`Open ${horse.name}'s rescue passport`}
      >
        <div className="aspect-square bg-stone-50 flex items-center justify-center overflow-hidden">
          {horse.imageUrl ? (
            <img
              src={horse.imageUrl}
              alt={horse.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <span className="text-6xl" aria-hidden="true">🐴</span>
          )}
        </div>
        <div className="p-5 space-y-2">
          {/* Attribution badge — always visible per HeyKai DMCA policy. */}
          <span
            className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full"
            style={{ background: GRASS_TINT, color: GRASS, border: `1px solid ${GRASS_SOFT_BORDER}` }}
          >
            <ShieldCheck size={10} /> {horse.partnerName || 'Verified rescue'}
          </span>
          <h2 className="text-2xl font-serif italic leading-none pt-1">{horse.name}</h2>
          {subline && (
            <p className="text-xs text-stone-500 font-light italic">{subline}</p>
          )}
          {country && (
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 inline-flex items-center gap-1">
              <MapPin size={10} /> {country}{horse.location ? ` · ${horse.location}` : ''}
            </p>
          )}
          <p
            className="text-[11px] font-black uppercase tracking-[0.25em] inline-flex items-center gap-1 pt-2"
            style={{ color: GRASS }}
          >
            View passport <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
          </p>
        </div>
      </button>

      {/* Outbound attribution link — separate from the card button so the
          rescue gets a real <a> on every render, even if a user never
          clicks "View passport". Required by the spec. */}
      {horse.sourceUrl && (
        <div className="px-5 pb-5 -mt-1">
          <a
            href={horse.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-charcoal transition-colors"
          >
            View on {horse.partnerName || 'rescue site'} <ExternalLink size={10} />
          </a>
        </div>
      )}
    </motion.div>
  );
}
