import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FoundingMemberModal } from './FoundingMemberModal';
import { MembershipCard, type MembershipPlan } from './MembershipCard';

interface ClubProps {
  onBack: () => void;
  onSignUp: () => void;
  isLoggedIn?: boolean;
  currentPlan?: string;
  onRequireLogin?: (plan: 'local' | 'plus' | 'black') => void;
  onJoinWaitlist?: (plan: string) => void;
}

const PLANS: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    tagline: 'Organise your dog\'s essentials and explore trusted places.',
    features: [
      'Pet records — vaccines, chip, vet & emergency contacts',
      'Curated dog-friendly city guide',
      'Save your favourite trusted places',
      'Boutique concierge community',
    ],
    cta: 'Get started free',
    highlight: false,
    showPrice: true,
  },
  {
    id: 'local',
    name: 'Local',
    price: '$6.99',
    period: 'per month',
    tagline: 'For the dog parent who wants more from their city.',
    features: [
      'Everything in Free',
      'Local member perks from verified partners',
      'One city guide — full concierge access',
      'Priority recommendations',
    ],
    cta: 'Join Miami waitlist',
    highlight: false,
    badge: 'Coming Soon',
    comingSoon: true,
    showPrice: false,
    billingNote: 'Launching first in Miami.',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$12.99',
    period: 'per month',
    tagline: 'For the dog parent who travels with their dog.',
    features: [
      'Everything in Local',
      'All city guides — full concierge access',
      'Priority partner perks across cities',
      'Travel-ready pet records',
    ],
    cta: 'Join waitlist',
    highlight: false,
    badge: 'Coming Soon',
    comingSoon: true,
    showPrice: false,
  },
  {
    id: 'black',
    name: 'Black',
    price: '$24.99',
    period: 'per month',
    tagline: 'A boutique concierge for the most committed dog parents.',
    features: [
      'Everything in Plus',
      'Early access to new cities & partners',
      'Exclusive Black member perks',
      'Founding member badge',
    ],
    cta: 'Join waitlist',
    highlight: false,
    badge: 'Coming Soon',
    comingSoon: true,
    showPrice: false,
  },
];

type PaidPlanId = 'local' | 'plus' | 'black';

const isPaidPlan = (id: string): id is PaidPlanId => id === 'local' || id === 'plus' || id === 'black';

export const Club: React.FC<ClubProps> = ({ onBack, onSignUp, isLoggedIn = false, currentPlan, onRequireLogin, onJoinWaitlist }) => {
  const [error, setError] = useState<string | null>(null);
  const [cancelledBanner, setCancelledBanner] = useState(false);
  const [showFoundingModal, setShowFoundingModal] = useState(false);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const pricingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'cancelled') {
      setCancelledBanner(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const startCheckout = async (planId: PaidPlanId) => {
    setBusyPlan(planId);
    try {
      await onJoinWaitlist?.(planId);
    } finally {
      setBusyPlan(null);
    }
  };

  const handleCardClick = (plan: MembershipPlan) => {
    if (plan.id === 'black') {
      setShowFoundingModal(true);
      return;
    }
    if (plan.id === 'free') {
      onSignUp();
      return;
    }
    if (isPaidPlan(plan.id)) startCheckout(plan.id);
  };

  return (
    <div className="bg-white page-shell">
      {/* Hero — kept compact so the four pricing cards land above the fold. */}
      <section className="relative bg-charcoal overflow-hidden pt-10 pb-7 px-5 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative z-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-4"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-3"
          >
            <div className="space-y-1.5">
              <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">Membership</span>
              <h1 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-[0.95] text-white">
                Hey Lola <span className="text-white/30">Club</span><span className="text-brand-orange">.</span>
              </h1>
            </div>
            <p className="text-sm md:text-base text-stone-400 font-light italic leading-snug max-w-md">
              A boutique lifestyle concierge for life with your dog. Start free — paid memberships coming soon.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing — matches the Home boutique-tiers layout. */}
      <section ref={pricingRef} id="pricing" className="py-8 sm:py-10 px-5 sm:px-6 max-w-7xl mx-auto scroll-mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-6"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Membership</span>
          <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-[0.85]">
            Boutique <span className="text-stone-300">membership tiers</span><span className="text-brand-orange">.</span>
          </h2>
          <p className="text-lg text-stone-400 font-light italic max-w-xl mx-auto">
            The Hey Lola Club is a boutique membership for dog parents who want curated experiences, trusted partners and practical tools. Start free — paid tiers coming soon.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <MembershipCard
                plan={plan}
                onClick={() => handleCardClick(plan)}
                busy={busyPlan === plan.id}
                isCurrent={currentPlan === plan.id}
              />
            </motion.div>
          ))}
        </div>

        <FoundingMemberModal
          isOpen={showFoundingModal}
          onClose={() => setShowFoundingModal(false)}
        />
        <p className="text-center text-[11px] text-stone-400 font-bold uppercase tracking-widest mt-6">
          Founding members keep their early access price
        </p>
        {cancelledBanner && (
          <p className="text-center text-sm text-stone-500 italic mt-4">
            No worries — your checkout was cancelled. You have not been charged.
          </p>
        )}
        {error && (
          <p className="text-center text-xs text-red-500 mt-4">{error}</p>
        )}
      </section>

      {/* FAQ teaser */}
      <section className="py-10 sm:py-10 px-5 sm:px-6 bg-stone-50 border-t border-stone-100">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-serif italic tracking-tight">Common questions<span className="text-brand-orange">.</span></h2>
          </div>
          {[
            { q: 'What is Hey Lola?', a: 'Hey Lola is a boutique lifestyle concierge for dog parents. It helps you organise your dog\'s essentials, discover trusted dog-friendly places, and access curated local perks.' },
            { q: 'When will paid memberships launch?', a: 'Local, Plus and Black are coming soon. We activate them only after our partner network in each city is verified. Join the waitlist to be the first to know.' },
            { q: 'Which cities are available?', a: 'Launching first in Miami. New York City and Barcelona coming next.' },
            { q: 'Can I use Hey Lola for free?', a: 'Yes. The Free plan is active today and gives you pet records, the curated city guide, saved places and the boutique concierge community — no card required.' },
          ].map(({ q, a }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border-b border-stone-100 pb-5 space-y-2"
            >
              <h3 className="text-base sm:text-lg font-serif italic text-charcoal">{q}</h3>
              <p className="text-sm text-stone-400 font-light leading-relaxed">{a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-10 md:py-10 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-[2rem] bg-charcoal p-7 sm:p-6 md:p-8 text-center space-y-5 relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
          <div className="relative z-10 space-y-4">
            <span className="text-white/40 font-black uppercase tracking-[0.5em] text-[10px]">Join the founding circle</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic tracking-tight text-white leading-[0.9]">
              Start your journey<span className="text-brand-orange">.</span>
            </h2>
            <p className="text-stone-400 font-light italic text-base max-w-md mx-auto">
              Free forever to start. Upgrade when you're ready.
            </p>
            <button
              onClick={onSignUp}
              className="inline-flex items-center gap-3 luxury-button bg-white text-charcoal h-12 px-9 text-[11px] font-black tracking-[0.25em] uppercase hover:bg-stone-100 hover:scale-[1.02] transition-all shadow-xl"
            >
              Create your free account <ArrowRight size={14} />
            </button>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_70%)]" />
        </div>
      </section>
    </div>
  );
};

