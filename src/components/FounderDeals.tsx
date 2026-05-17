import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { SEO } from '../lib/seo';

interface FounderDealsProps {
  onBack: () => void;
}

const FOUNDER_DEALS_BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'Perks', item: '/perks' },
  { name: 'Founder Deals', item: '/perks/deals' },
];

/**
 * Scaffold for the members-only deals dashboard. While the feature flag
 * stays in 'draft' status this page is admin-only — the DraftRoute wrapper
 * shows a "Preview · Only you can see this" banner and redirects everyone
 * else to /.
 *
 * The card grid below is a placeholder layout we will fill once verified
 * partner offers land in Firestore.
 */
export const FounderDeals: React.FC<FounderDealsProps> = ({ onBack }) => {
  return (
    <main className="bg-white min-h-screen text-charcoal font-boutique" aria-labelledby="deals-heading">
      <SEO
        title="Founder Deals — Hey Lola"
        description="Members-only deals from verified partners — concierge-curated discounts and perks for Hey Lola founder members."
        url="/perks/deals"
        breadcrumbs={FOUNDER_DEALS_BREADCRUMBS}
      />
      <section className="bg-charcoal text-white pt-14 pb-12 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-5">
          <button
            type="button"
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
            <span className="inline-flex items-center gap-2 text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">
              <Sparkles size={11} /> Founder Deals
            </span>
            <h1 id="deals-heading" className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9]">
              Verified deals.<br />
              <span className="text-white/40">Negotiated by Hey Lola<span className="brand-dot" aria-hidden="true" /></span>
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug max-w-2xl">
              Concierge-curated discounts and perks from partners we trust. Every deal is reviewed and negotiated by the Hey Lola team — no affiliate noise, no expired offers.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-12 px-5 sm:px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
          <ShieldCheck size={12} className="text-emerald-500" /> Every deal verified by Hey Lola
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <article
              key={i}
              className="rounded-[1.5rem] border border-stone-100 bg-white p-6 space-y-4 hover:shadow-xl transition-shadow"
            >
              <div className="aspect-square w-16 rounded-2xl bg-stone-50 border border-stone-100" aria-hidden />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Partner</p>
                <h3 className="text-xl font-serif italic">Verified partner #{i}</h3>
              </div>
              <p className="text-sm text-stone-500 font-light leading-relaxed">
                A negotiated benefit will land here once the partner signs the agreement. Founder members will see live offers, claim flows and remaining inventory.
              </p>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.3em] px-5 py-3 rounded-full opacity-30 cursor-not-allowed"
                disabled
                aria-label="Claim deal (placeholder)"
              >
                Claim deal
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};
