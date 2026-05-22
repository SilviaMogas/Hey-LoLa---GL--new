import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

/**
 * Founders' Circle waitlist — consumer site.
 *
 * Captures email only. Reveals the DESIRE (a limited founding cohort exists,
 * founders enter first, benefits locked for life, Miami forming now) and hides
 * the numbers (price, exact inclusions, open date, cohort cap) per the launch
 * brief. Pre-reveal economics are confidential and never shown publicly.
 *
 * Entries are stored in the existing `waitlist` collection with type
 * 'founders' so no Firestore rule change is needed.
 */
export const FoundersCircleWaitlist: React.FC = () => {
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
      const ref = await addDoc(collection(db, 'waitlist'), {
        type: 'founders',
        email: email.trim().toLowerCase(),
        source: 'founders_circle',
        createdAt: serverTimestamp(),
      });
      void fetch('/api/notify-waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entryId: ref.id }),
      }).catch(() => { /* email is best-effort */ });
      setSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'waitlist');
      setError('Something went wrong. Please try again or email hey@heylola.co');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="founders" className="py-10 sm:py-12 px-5 sm:px-6">
      <div className="max-w-4xl mx-auto rounded-[2rem] bg-charcoal text-white relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(242,140,51,0.10),transparent_60%)]" aria-hidden="true" />
        <div className="relative z-10 p-8 sm:p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5 max-w-xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 text-brand-orange bg-brand-orange/15 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles size={12} /> Founders' Circle
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic tracking-tight leading-[0.95]">
              Before the doors open<span className="brand-dot" aria-hidden="true" />
            </h2>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug">
              Hey Lola opens city by city. A limited founding cohort steps in first — founder status for life, a voice in what we build, and founding benefits locked from day one. Miami is forming now.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-2 space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <p className="text-stone-300 font-light italic">We'll be in touch when the Circle opens.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="pt-2 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    aria-label="Email address"
                    className="flex-1 h-12 rounded-full bg-white/10 border border-white/15 px-5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-orange/60 focus:ring-2 focus:ring-brand-orange/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-7 rounded-full bg-white text-charcoal text-[10px] font-black uppercase tracking-[0.25em] inline-flex items-center justify-center gap-2 hover:bg-stone-100 transition-colors disabled:opacity-50 shrink-0"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <>Request your place <ArrowRight size={13} /></>}
                  </button>
                </div>
                {error && <p className="text-[13px] text-red-300">{error}</p>}
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  Limited cohort · by waitlist order
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
