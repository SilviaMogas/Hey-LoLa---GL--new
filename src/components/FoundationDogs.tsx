import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FOUNDATION_DOGS, type FoundationDog } from '../data/foundationDogs';
import { SEO } from '../lib/seo';

interface FoundationDogsProps {
  onBack: () => void;
  onOpenPassport: (slug: string) => void;
}

const BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'Foundation', item: '/foundation' },
  { name: 'Rescue Dogs', item: '/foundation/dogs' },
];

const SEED_VISIBLE = FOUNDATION_DOGS.filter(
  (d) => d.passport.visibility === 'public' && d.status === 'available',
);

export const FoundationDogs: React.FC<FoundationDogsProps> = ({ onBack, onOpenPassport }) => {
  const [live, setLive] = useState<FoundationDog[] | null>(null);

  // Subscribe to the live Firestore collection. If it has any verified
  // public dogs we use them; otherwise we fall back to the seed sample.
  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const { data } = await supabase.from('foundation_dogs').select('*').eq('status', 'available');
        const dogs = (data || []).filter((d: any) => d.passport?.visibility === 'public') as FoundationDog[];
        setLive(dogs);
      } catch { setLive([]); }
    };
    fetchDogs();
    const channel = supabase.channel('foundation-dogs-live').on('postgres_changes', {
      event: '*', schema: 'public', table: 'foundation_dogs',
    }, () => fetchDogs()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const visible: FoundationDog[] = live && live.length > 0 ? live : SEED_VISIBLE;
  const usingSeed = !live || live.length === 0;

  return (
    <main className="bg-white min-h-screen text-charcoal font-boutique" aria-labelledby="dogs-heading">
      <SEO
        title="Rescue Dogs Looking for a Home — Hey Lola Foundation"
        description="Browse rescue dogs from verified Hey Lola Foundation partners. Every dog has a digital rescue passport — a warm, trustworthy way to express interest and continue through the official adoption process."
        url="/foundation/dogs"
        breadcrumbs={BREADCRUMBS}
      />

      <section className="bg-charcoal text-white pt-14 pb-14 px-5 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative z-10 space-y-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft size={12} /> Foundation
          </button>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5 max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">
              <ShieldCheck size={11} /> Verified by Hey Lola Foundation
            </span>
            <h1 id="dogs-heading" className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9]">
              Dogs looking for<br />
              <span className="text-white/30">the right home</span><span className="brand-dot" aria-hidden="true" />
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug">
              Every dog here is part of a verified rescue partner. Their passport lives on Hey Lola so animal lovers can discover them, express interest, and continue through the official adoption process.
            </p>
            {usingSeed && (
              <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
                <span className="bg-brand-orange/30 text-brand-orange px-2 py-0.5 rounded-full">Preview</span>
                Sample passports — real Animal Haven dogs sync in.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-14 sm:py-16 px-5 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((dog, i) => (
            <DogCard key={dog.id} dog={dog} delay={i * 0.06} onClick={() => onOpenPassport(dog.passport.slug)} />
          ))}
        </div>
        {visible.length === 0 && (
          <p className="text-center text-stone-400 italic font-light py-16">
            No rescue dogs available right now. Check back soon — new passports go live as partners sync.
          </p>
        )}
      </section>
    </main>
  );
};

function DogCard({ dog, delay, onClick }: { dog: FoundationDog; delay: number; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group text-left rounded-[1.5rem] border border-stone-100 bg-white overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
      aria-label={`Open ${dog.name}'s rescue passport`}
    >
      <div className="aspect-square bg-stone-50 flex items-center justify-center overflow-hidden">
        {dog.imageUrl ? (
          <img
            src={dog.imageUrl}
            alt={dog.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <span className="text-6xl">🐶</span>
        )}
      </div>
      <div className="p-5 space-y-2">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-stone-400">
          <ShieldCheck size={10} className="text-[#7A8C6E]" /> {dog.partnerName}
        </div>
        <h2 className="text-2xl font-serif italic leading-none">{dog.name}</h2>
        <p className="text-xs text-stone-500 font-light italic">
          {[dog.ageLabel, dog.breed, dog.sex !== 'unknown' ? capitalize(dog.sex) : null].filter(Boolean).join(' · ')}
        </p>
        {dog.ensName && (
          <p className="text-[10px] font-mono text-[#7A8C6E] bg-[#F7F9F5] border border-[#e2ead9] rounded-full px-2.5 py-0.5 inline-flex items-center gap-1 w-fit">
            <span className="opacity-60">◆</span> {dog.ensName}
          </p>
        )}
        {dog.location && (
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 inline-flex items-center gap-1">
            <MapPin size={10} /> {dog.location}
          </p>
        )}
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-charcoal inline-flex items-center gap-1 pt-2">
          View passport <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
        </p>
      </div>
    </motion.button>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
