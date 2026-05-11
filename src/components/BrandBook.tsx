import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, PawPrint } from 'lucide-react';
import { CONCIERGES, POSE_COUNT, conciergePose, type ConciergeProfile } from '../data/concierges';

interface BrandBookProps {
  onBack: () => void;
  onOpenCharacter: (id: ConciergeProfile['id']) => void;
}

export const BrandBook: React.FC<BrandBookProps> = ({ onBack, onOpenCharacter }) => {
  return (
    <div className="bg-white page-shell font-boutique text-charcoal">
      {/* Hero */}
      <section className="relative bg-charcoal overflow-hidden pt-14 pb-12 px-5 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative z-10 space-y-5">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">Brand Book</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9] text-white">
              The Concierges<span className="text-brand-orange">.</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug max-w-2xl">
              Four illustrated concierges, four personalities. Together they shape how Hey Lola sounds, feels and moves — a boutique concierge crew for modern dog parents.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Concierge grid */}
      <section className="py-12 sm:py-16 px-5 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Meet the concierges</span>
          <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
            Click on a face<span className="text-brand-orange">.</span>
          </h2>
          <p className="text-sm text-stone-400 font-light italic max-w-md mx-auto">
            Each concierge has a full pose pack, a personality and a role inside the Hey Lola world.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CONCIERGES.map((c) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onOpenCharacter(c.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative flex flex-col h-full rounded-[2rem] bg-white border border-stone-100 overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 text-left"
            >
              <div className={`aspect-square ${c.color} flex items-center justify-center relative overflow-hidden`}>
                <img
                  src={conciergePose(c.id, 1)}
                  alt={c.name}
                  className="relative z-10 w-full h-full object-contain group-hover:scale-110 transition-all duration-700"
                />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-2xl font-serif italic tracking-tight leading-none">{c.name}</h3>
                <p className="text-[11px] text-stone-400 italic">{c.role}</p>
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-charcoal inline-flex items-center gap-1 pt-3">
                  View pose pack <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Visual identity strip */}
      <section className="py-12 px-5 sm:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Tone</span>
            <p className="text-base font-serif italic leading-snug text-charcoal">Premium. Warm. Elegant. Concierge-style.</p>
            <p className="text-sm text-stone-500 font-light leading-relaxed">Not childish. Not too technical. Always useful.</p>
          </div>
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Voice</span>
            <p className="text-base font-serif italic leading-snug text-charcoal">"Your dog's lifestyle concierge."</p>
            <p className="text-sm text-stone-500 font-light leading-relaxed">A boutique lifestyle concierge for life with your dog.</p>
          </div>
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Palette</span>
            <div className="flex gap-2 pt-1">
              {[
                { hex: '#1A1A1A', label: 'Charcoal' },
                { hex: '#C4622D', label: 'Orange' },
                { hex: '#6E8C5D', label: 'Sage' },
                { hex: '#F5F0E8', label: 'Bone' },
              ].map((c) => (
                <div key={c.hex} className="flex-1 space-y-2">
                  <div className="w-full h-12 rounded-lg border border-stone-200" style={{ background: c.hex }} />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-5 sm:px-6 text-center">
        <PawPrint size={20} className="mx-auto text-stone-200" />
      </section>
    </div>
  );
};

interface BrandBookCharacterProps {
  id: ConciergeProfile['id'];
  onBack: () => void;
  onOther: (id: ConciergeProfile['id']) => void;
}

export const BrandBookCharacter: React.FC<BrandBookCharacterProps> = ({ id, onBack, onOther }) => {
  const c = CONCIERGES.find((x) => x.id === id) ?? CONCIERGES[0];
  const others = CONCIERGES.filter((x) => x.id !== c.id);

  return (
    <div className="bg-white page-shell font-boutique text-charcoal">
      {/* Hero */}
      <section className={`${c.color} relative overflow-hidden pt-14 pb-10 px-5 sm:px-6`}>
        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
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
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif italic tracking-tight leading-[0.9]">
                {c.name}<span style={{ color: c.accent }}>.</span>
              </h1>
              <p className="text-lg sm:text-xl font-light italic text-stone-600 leading-snug max-w-md">
                {c.tagline}
              </p>
              <p className="text-sm text-stone-500 font-light leading-relaxed max-w-md">
                {c.bio}
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src={conciergePose(c.id, 1)}
                alt={c.name}
                className="w-full max-w-md object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.08)]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Personality details */}
      <section className="py-12 px-5 sm:px-6 max-w-5xl mx-auto">
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

      {/* Pose pack */}
      <section className="py-10 px-5 sm:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Pose Pack</span>
            <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight">{c.name}'s 10 poses<span style={{ color: c.accent }}>.</span></h2>
            <p className="text-sm text-stone-400 font-light italic max-w-md mx-auto">
              All ten illustrations of {c.name}, ready to use across the Hey Lola experience.
            </p>
          </div>

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
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Other concierges */}
      <section className="py-12 px-5 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">The rest of the concierges</span>
          <h2 className="text-2xl sm:text-3xl font-serif italic tracking-tight">Meet the others<span className="text-brand-orange">.</span></h2>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          {others.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onOther(o.id)}
              className="group flex flex-col items-center gap-3 text-center"
            >
              <div className={`aspect-square w-full rounded-[1.5rem] ${o.color} border border-stone-100 overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1`}>
                <img src={conciergePose(o.id, 1)} alt={o.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="text-sm font-serif italic">{o.name}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
