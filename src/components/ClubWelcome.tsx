import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import type { MemberPlan, MembershipSubscription } from '../types';

interface ClubWelcomeProps {
  /** Plan slug from the redirect URL (`?plan=local|plus|black`). */
  plan: string | null;
  /** Membership doc from Firestore — populates as soon as the webhook fires. */
  membership?: MembershipSubscription | null;
  memberPlan?: MemberPlan;
  onGoToDashboard: () => void;
  onExplore: () => void;
}

const PLAN_COPY: Record<string, { name: string; tagline: string; perks: string[] }> = {
  local: {
    name: 'Local',
    tagline: 'For the dog parent who loves their city and wants more from it.',
    perks: [
      'Save favourite places',
      'Member perks & discounts',
      'One city guide — full access',
    ],
  },
  plus: {
    name: 'Plus',
    tagline: 'Travel-ready. All cities, all perks, all your records in one place.',
    perks: [
      'All city guides',
      'Priority venue perks',
      'Travel documents & records',
    ],
  },
  black: {
    name: 'Black',
    tagline: 'The full Hey Lola experience, always first.',
    perks: [
      'Early access to new cities',
      'Exclusive Black member perks',
      'Founding member badge',
    ],
  },
};

export const ClubWelcome: React.FC<ClubWelcomeProps> = ({ plan, membership, memberPlan, onGoToDashboard, onExplore }) => {
  const slug = plan || memberPlan || '';
  const copy = PLAN_COPY[slug] ?? null;
  const [waited, setWaited] = useState(false);

  // The webhook may take a moment after the redirect. Show a small loading
  // affordance for the first 3 seconds, then settle into the success copy
  // even if the membership doc hasn't synced yet (LS will catch up shortly).
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const isLive = membership?.status === 'active' || membership?.status === 'on_trial';

  return (
    <div className="min-h-screen bg-bone font-boutique flex flex-col">
      <header className="px-4 sm:px-6 py-4 flex items-center justify-center border-b border-stone-100 bg-white/80 backdrop-blur-sm">
        <BrandLogo size="sm" />
      </header>
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white rounded-3xl border border-stone-100 shadow-xl p-8 sm:p-8 space-y-8"
        >
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 bg-stone-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">
              <Sparkles size={12} /> Hey Lola Club
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif italic text-charcoal tracking-tight">
              {copy ? `Welcome to ${copy.name}.` : 'Welcome to the Club.'}
            </h1>
            <p className="text-stone-500 italic max-w-md mx-auto">
              {copy?.tagline ?? 'Your perks unlock immediately. Enjoy the ride.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
            {isLive ? (
              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                <ShieldCheck size={12} /> {membership?.status === 'on_trial' ? 'Trial active' : 'Membership active'}
              </span>
            ) : !waited ? (
              <span className="inline-flex items-center gap-2 text-stone-400">
                <Loader2 size={12} className="animate-spin" /> Confirming your subscription…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-stone-400">
                Confirmation pending — your perks unlock automatically once payment clears.
              </span>
            )}
          </div>

          {copy && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {copy.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-charcoal/80">
                  <span className="text-brand-orange shrink-0">✦</span> {perk}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={onGoToDashboard}
              className="flex-1 bg-charcoal text-white py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight size={14} />
            </button>
            <button
              onClick={onExplore}
              className="flex-1 border border-stone-100 text-charcoal py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-50 transition-colors"
            >
              Start exploring
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
