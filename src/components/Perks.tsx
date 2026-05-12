import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, MapPin, ShieldCheck, Sparkles, Lock, Globe } from 'lucide-react';
import {
  PARTNER_PERKS,
  PERK_CATEGORIES,
  PERK_TIERS,
  TIER_FROM_PLAN,
  tierMeetsPerk,
  type PerkCategory,
  type PartnerPerk,
  type PerkTier,
} from '../data/partnerPerks';
import { SEO } from '../lib/seo';

interface PerksProps {
  onBack: () => void;
  onJoinClub: () => void;
  onOpenVenue: (slug: string) => void;
  onExploreMap: () => void;
  /** Current member tier — defaults to 'free' */
  memberTier?: PerkTier;
}

const BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'Perks', item: '/perks' },
];

type CategoryFilter = 'all' | PerkCategory;

export const Perks: React.FC<PerksProps> = ({ onBack, onJoinClub, onOpenVenue, onExploreMap, memberTier = 'free' }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const visible = useMemo(
    () => (activeCategory === 'all' ? PARTNER_PERKS : PARTNER_PERKS.filter((p) => p.category === activeCategory)),
    [activeCategory],
  );

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: PARTNER_PERKS.length };
    PERK_CATEGORIES.forEach((c) => {
      counts[c.id] = PARTNER_PERKS.filter((p) => p.category === c.id).length;
    });
    return counts;
  }, []);

  return (
    <main className="bg-white text-charcoal font-boutique min-h-screen" aria-labelledby="perks-heading">
      <SEO
        title="Member Perks — Hey Lola"
        description="Curated dog-friendly perks for Hey Lola members. Discounts, welcome treats, priority booking and free shipping from verified partners — interconnected with the city map."
        url="/perks"
        breadcrumbs={BREADCRUMBS}
      />

      {/* Top breadcrumb */}
      <div className="bg-stone-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
          <button onClick={onBack} className="hover:text-charcoal transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={11} /> Categories
          </button>
          <span aria-hidden>›</span>
          <span className="text-charcoal">Perks</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-stone-50 px-5 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-3 bg-white border border-stone-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">
            <span className="bg-brand-orange/10 text-brand-orange px-2.5 py-0.5 rounded-full">New</span>
            <span>{PARTNER_PERKS.length} verified perks live</span>
            <ArrowRight size={11} />
          </div>
          <h1 id="perks-heading" className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.95] text-charcoal">
            Member perks that<br /> make the city <span className="text-stone-300">richer</span><span className="text-brand-orange">.</span>
          </h1>
          <p className="text-base sm:text-lg text-stone-500 font-light italic leading-snug max-w-2xl mx-auto">
            Discounts, welcome treats, priority booking and free shipping — curated by Hey Lola, redeemable in-app, interconnected with the city map.
          </p>
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 bg-stone-50 border border-stone-100 px-3 py-1.5 rounded-full">
            <span className="bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">Preview</span>
            Sample perks — real verified partners go live as they onboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 pt-2">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={12} className="text-brand-orange" /> Curated by Hey Lola
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={12} className="text-[#7A8C6E]" /> Verified partners only
            </span>
          </div>
        </div>
      </section>

      {/* Category nav */}
      <nav aria-label="Filter perks by category" className="border-y border-stone-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-thin">
          <CategoryTab label="All" count={countByCategory.all} active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
          {PERK_CATEGORIES.map((c) => (
            <CategoryTab
              key={c.id}
              label={`${c.emoji} ${c.label}`}
              count={countByCategory[c.id] ?? 0}
              active={activeCategory === c.id}
              onClick={() => setActiveCategory(c.id)}
            />
          ))}
        </div>
      </nav>

      {/* Perks grid */}
      <section className="px-5 sm:px-6 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {visible.map((perk, i) => (
            <PerkCard
              key={perk.id}
              perk={perk}
              delay={i * 0.04}
              memberTier={memberTier}
              onOpenVenue={onOpenVenue}
              onJoinClub={onJoinClub}
            />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="text-center text-stone-400 italic font-light py-16">No perks in this category yet — check back soon.</p>
        )}
      </section>

      {/* Map CTA */}
      <section className="px-5 sm:px-6 pb-16">
        <div className="max-w-7xl mx-auto rounded-[2rem] bg-charcoal text-white p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 inline-flex items-center gap-2">
              <MapPin size={11} /> Interconnected with the map
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">See perks on the map<span className="text-brand-orange">.</span></h2>
            <p className="text-sm sm:text-base text-stone-400 font-light italic leading-relaxed max-w-md">
              Every place-based perk pins to its location on Explore. Plan brunch, hotel stays and weekend walks around them.
            </p>
          </div>
          <div className="flex md:justify-end">
            <button
              type="button"
              onClick={onExploreMap}
              className="luxury-button bg-white text-charcoal h-12 px-8 text-[11px] font-black tracking-[0.25em] uppercase hover:bg-stone-100 transition-colors inline-flex items-center gap-2"
            >
              Open Explore <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

function CategoryTab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-medium transition-all ${
        active ? 'bg-charcoal text-white' : 'bg-white text-stone-500 hover:text-charcoal border border-stone-100'
      }`}
    >
      <span>{label}</span>
      <span className={`text-[9px] font-black ${active ? 'text-white/60' : 'text-stone-400'}`}>{count}</span>
    </button>
  );
}

function PerkCard({ perk, delay, memberTier, onOpenVenue, onJoinClub }: { perk: PartnerPerk; delay: number; memberTier: PerkTier; onOpenVenue: (slug: string) => void; onJoinClub: () => void }) {
  const unlocked = tierMeetsPerk(memberTier, perk.tier);
  const tierMeta = PERK_TIERS.find((t) => t.id === perk.tier);
  const categoryMeta = PERK_CATEGORIES.find((c) => c.id === perk.category);
  const isGlobal = perk.city === 'Global';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="relative rounded-[1.5rem] border border-stone-100 bg-white p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 group"
    >
      {!unlocked && (
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.25em] bg-stone-50 border border-stone-100 text-stone-500 px-2.5 py-1 rounded-full">
          <Lock size={10} /> {tierMeta?.label} only
        </div>
      )}

      <header className="space-y-2 pr-16">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-stone-400">
          <span aria-hidden>{categoryMeta?.emoji}</span>
          <span>{categoryMeta?.label}</span>
        </div>
        <h3 className="text-xl font-serif italic leading-tight text-charcoal">{perk.partner}</h3>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
          {isGlobal ? (
            <span className="inline-flex items-center gap-1">
              <Globe size={10} /> Global
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <MapPin size={10} /> {perk.city}
            </span>
          )}
          {perk.verified && (
            <span className="inline-flex items-center gap-1 text-[#7A8C6E]">
              <ShieldCheck size={10} /> Verified
            </span>
          )}
        </div>
      </header>

      <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Perk</p>
        <p className="text-sm font-serif italic text-charcoal" style={{ color: perk.accent }}>{perk.perkLabel}</p>
        <p className="text-[12px] text-stone-500 font-light leading-relaxed">{perk.description}</p>
      </div>

      <footer className="flex items-center justify-between pt-1">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
          <span className="w-2 h-2 rounded-full" style={{ background: tierMeta?.dot }} />
          {tierMeta?.label} tier
        </span>
        {unlocked ? (
          perk.placeSlug ? (
            <button
              type="button"
              onClick={() => onOpenVenue(perk.placeSlug!)}
              className="text-[10px] font-black uppercase tracking-[0.25em] text-charcoal inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              View on map <ArrowRight size={11} />
            </button>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">Online perk</span>
          )
        ) : (
          <button
            type="button"
            onClick={onJoinClub}
            className="text-[10px] font-black uppercase tracking-[0.25em] text-charcoal inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
          >
            Unlock <ArrowRight size={11} />
          </button>
        )}
      </footer>
    </motion.article>
  );
}
