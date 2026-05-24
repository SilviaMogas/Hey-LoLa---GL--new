import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { handleSupabaseError, OperationType } from '../lib/dbHelpers';

/**
 * Founders' Circle waitlist — consumer site.
 *
 * Captures email only. Reveals the DESIRE (a limited founding circle exists,
 * founders enter first, benefits locked for life, Miami forming now) and hides
 * the numbers (price, exact inclusions, open date, cohort cap) per the launch
 * brief. Pre-reveal economics are confidential and never shown publicly.
 *
 * `inline` renders just the card (for a side-by-side column next to the Free
 * plan). Default renders a standalone full-width section. Entries are stored in
 * the existing `waitlist` collection with type 'founders' — no rule change.
 */
export const FoundersCircleWaitlist: React.FC<{ inline?: boolean }> = ({ inline = false }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      const { data: row } = await supabase.from('waitlist').insert({
        type: 'founders',
        email: email.trim().toLowerCase(),
        source: 'founders_circle',
        created_at: new Date().toISOString(),
      }).select('id').single();
      if (row) {
        void fetch('/api/notify-waitlist', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ entryId: row.id }),
        }).catch(() => { /* email is best-effort */ });
      }
      setSubmitted(true);
    } catch (err) {
      handleSupabaseError(err, OperationType.WRITE, 'waitlist');
      setError('Something went wrong. Please try again or email hey@heylola.co');
    } finally {
      setLoading(false);
    }
  };

  const card = (
    <div className="relative h-full overflow-hidden rounded-[1.5rem] bg-charcoal text-white p-7 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(242,140,51,0.12),transparent_60%)]" aria-hidden="true" />
      <div className="relative z-10 flex flex-col flex-1 space-y-4">
        <span className="inline-flex items-center gap-2 self-start text-brand-orange bg-brand-orange/15 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
          <Sparkles size={11} /> Founders' Circle
        </span>
        <div className="space-y-2">
          <h3 className="text-2xl sm:text-3xl font-serif italic tracking-tight leading-tight">
            Before the doors open<span className="brand-dot" aria-hidden="true" />
          </h3>
          <p className="text-[13px] sm:text-sm text-stone-300 font-light leading-relaxed">
            Hey Lola opens city by city, and a small founding circle steps in first. Founder status for life, a hand in what we build, and your benefits secured from day one. Miami is forming now.
          </p>
        </div>

        <div className="mt-auto pt-2">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <span className="w-9 h-9 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                <Check size={18} />
              </span>
              <p className="text-[13px] text-stone-300 font-light italic">We'll be in touch when the Circle opens.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email address"
                  className="flex-1 h-10 rounded-full bg-white/10 border border-white/15 px-4 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-brand-orange/60 focus:ring-2 focus:ring-brand-orange/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-5 rounded-full bg-white text-charcoal text-[9px] font-black uppercase tracking-[0.25em] inline-flex items-center justify-center gap-2 hover:bg-stone-100 transition-colors disabled:opacity-50 shrink-0"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <>Request your place <ArrowRight size={12} /></>}
                </button>
              </div>
              {error && <p className="text-[12px] text-red-300">{error}</p>}
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                Limited circle · priority by waitlist order
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  if (inline) return card;

  return (
    <section id="founders" className="py-10 sm:py-12 px-5 sm:px-6">
      <div className="max-w-2xl mx-auto">{card}</div>
    </section>
  );
};
