import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, MapPin, Star, PawPrint, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { getTier } from '../lib/membership';
import type { MemberPlan } from '../types';
import { cn } from '../lib/utils';
import { FoundingMemberModal } from './FoundingMemberModal';

interface ClubProps {
  onBack: () => void;
  onSignUp: () => void;
  isLoggedIn?: boolean;
  currentPlan?: string;
  onRequireLogin?: (plan: 'local' | 'plus' | 'black') => void;
  onJoinWaitlist?: (plan: string) => void;
}

interface PlanData {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  cta: string;
  highlight: boolean;
  badge?: string;
  billingNote?: string;
  comingSoon?: boolean;
  showPrice?: boolean;
}

const PLANS: PlanData[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    tagline: 'Start exploring dog-friendly places and build your pet profile.',
    features: [
      'Pet profile & passport',
      'Explore dog-friendly places',
      'Community feed access',
      'Basic city guides',
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
    tagline: 'For the dog parent who loves their city and wants more from it.',
    features: [
      'Everything in Free',
      'Save favourite places',
      'Member perks & discounts',
      'One city guide — full access',
    ],
    cta: 'Join Miami Waitlist',
    highlight: false,
    badge: 'Coming Soon',
    comingSoon: true,
    showPrice: false,
    billingNote: 'Coming Soon in Miami.',
  },
  {
    id: 'plus',
    name: 'Travel',
    price: '$12.99',
    period: 'per month',
    tagline: 'For the dog parent who travels and wants the full experience.',
    features: [
      'Everything in Local',
      'All city guides — full access',
      'Priority venue perks',
      'Travel documents & records',
    ],
    cta: 'Join Waitlist',
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
    tagline: 'For the most committed dog traveller. Unlimited and always first.',
    features: [
      'Everything in Plus',
      'Early access to new cities',
      'Exclusive Black member perks',
      'Founding member badge',
    ],
    cta: 'Join Founding Circle',
    highlight: false,
    badge: 'Coming Soon',
    showPrice: true,
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

  const handleCardClick = (plan: PlanData) => {
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
              A better city life for you and your dog. Pick a plan to unlock perks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing — moved up so the four plans land in the same viewport. */}
      <section ref={pricingRef} id="pricing" className="pt-7 pb-10 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-1.5 mb-6"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Membership Plans</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif italic tracking-tight leading-[0.95]">
            Boutique <span className="text-stone-300">membership tiers</span><span className="text-brand-orange">.</span>
          </h2>
          <p className="text-sm text-stone-400 font-light italic max-w-xl mx-auto">
            Start free and upgrade when you're ready. Founding members keep their early access price — forever.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <ClubPricingCard
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
            { q: 'When will paid plans launch?', a: 'We\'re rolling out paid memberships in 2025. Join the early access list now and you\'ll be the first to know — and lock in founding member pricing.' },
            { q: 'What cities are available?', a: 'Barcelona, Miami, and New York City are live. We\'re actively adding venues and expanding to new cities. Toronto, Dubai, Paris and Singapore are coming next.' },
            { q: 'Can I use Hey Lola for free?', a: 'Yes. The Free plan gives you full access to explore venues, build a pet profile, and browse the community feed — no card required.' },
            { q: 'What are member perks?', a: 'Verified partner venues offer exclusive perks to Hey Lola Club members: discounts, free items, priority booking and pet-friendly experiences. Perks are shown on venue cards when active.' },
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

// Hex equivalents of the tier dot colours in src/lib/membership.ts.
// Used as the top-border accent of each pricing card so the colour is
// visible even when the dot is too small to be the dominant signal.
function tierBorderColor(planId: string): string {
  switch (planId) {
    case 'black': return '#1F1F1F';
    case 'plus': return '#3B82F6';
    case 'local': return '#E07A30';
    default: return '#D6D3D1';
  }
}

function ClubPricingCard({ plan, onClick, busy, isCurrent }: { plan: PlanData; onClick: () => void; busy: boolean; isCurrent: boolean }) {
  const cta = isCurrent ? 'Current plan' : plan.cta;
  const tier = getTier(plan.id as MemberPlan, false);
  return (
    <div className={cn(
      'relative flex flex-col h-full rounded-2xl border-t-4 border-x border-b p-4 lg:p-5 space-y-3 lg:space-y-4 transition-all duration-300 hover:shadow-xl font-boutique',
      plan.highlight
        ? 'bg-charcoal text-white border-charcoal shadow-[0_15px_45px_rgba(0,0,0,0.20)]'
        : 'bg-white text-charcoal border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]',
    )} style={{ borderTopColor: tierBorderColor(plan.id) }}>
      {plan.badge && (
        <div className="absolute -top-2.5 left-4 flex gap-1.5 overflow-visible">
          <div className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.25em] whitespace-nowrap ${
            plan.highlight ? 'bg-brand-orange text-white' : 'bg-stone-100 text-stone-600'
          }`}>
            {plan.badge}
          </div>
          {plan.comingSoon && (
            <div className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.25em] whitespace-nowrap bg-[#EBF1E9] text-[#7A8C6E] border border-[#7A8C6E]/10`}>
              Coming Soon
            </div>
          )}
        </div>
      )}

      <div className="space-y-1 pt-1">
        <p className={cn(
          'inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em]',
          plan.highlight ? 'text-white/70' : tier.textClass,
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full', tier.dotClass)} />
          {plan.name}
        </p>
        {(plan.showPrice !== false) ? (
          <div className="flex items-end gap-1">
            <span className={`text-3xl font-serif italic tracking-tight ${plan.highlight ? 'text-white' : 'text-charcoal'}`}>
              {plan.price}
            </span>
            <span className={`text-xs pb-1 font-light ${plan.highlight ? 'text-white/50' : 'text-stone-400'}`}>
              /{plan.period}
            </span>
          </div>
        ) : (
          <div className="h-10 flex items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Waitlist Open</span>
          </div>
        )}
        <p className={`text-xs font-light leading-snug ${plan.highlight ? 'text-white/70' : 'text-stone-500'}`}>
          {plan.tagline}
        </p>
      </div>

      <ul className="space-y-1.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check size={12} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-brand-orange' : 'text-charcoal/40'}`} />
            <span className={`text-[12px] leading-snug ${plan.highlight ? 'text-white/80' : 'text-stone-500'}`}>{f}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <button
          onClick={onClick}
          disabled={busy || isCurrent}
          className={`w-full h-10 rounded-lg text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            plan.highlight
              ? 'bg-white text-charcoal hover:bg-stone-100'
              : 'bg-charcoal text-white hover:bg-charcoal/80'
          }`}
        >
          {busy && <Loader2 size={12} className="animate-spin" />}
          {cta}
        </button>
        {plan.billingNote && !isCurrent && (
          <p className={`text-[10px] text-center leading-snug ${plan.highlight ? 'text-white/40' : 'text-stone-400'}`}>
            {plan.billingNote}
          </p>
        )}
      </div>
    </div>
  );
}
