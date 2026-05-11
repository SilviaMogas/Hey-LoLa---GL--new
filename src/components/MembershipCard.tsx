import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export interface MembershipPlan {
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

interface MembershipCardProps {
  plan: MembershipPlan;
  onClick: () => void;
  busy?: boolean;
  isCurrent?: boolean;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ plan, onClick, busy = false, isCurrent = false }) => {
  const cta = isCurrent ? 'Current plan' : plan.cta;
  return (
    <div
      className={`relative flex flex-col h-full rounded-[1.5rem] border p-6 space-y-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 font-boutique ${
        plan.highlight
          ? 'bg-charcoal text-white border-charcoal shadow-[0_20px_60px_rgba(0,0,0,0.25)]'
          : 'bg-white text-charcoal border-stone-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)]'
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-2 left-5 flex gap-1.5 overflow-visible">
          <div
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap ${
              plan.highlight ? 'bg-brand-orange text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {plan.badge}
          </div>
          {plan.comingSoon && plan.badge !== 'Coming Soon' && (
            <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap bg-[#EBF1E9] text-[#7A8C6E] border border-[#7A8C6E]/10">
              Coming Soon
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 pt-2">
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${plan.highlight ? 'text-white/50' : 'text-stone-400'}`}>
          {plan.name}
        </p>
        {plan.showPrice !== false ? (
          <div className="flex items-end gap-1">
            <span className={`text-3xl font-serif italic tracking-tight ${plan.highlight ? 'text-white' : 'text-charcoal'}`}>
              {plan.price}
            </span>
            <span className={`text-sm pb-1 font-light ${plan.highlight ? 'text-white/50' : 'text-stone-400'}`}>
              /{plan.period}
            </span>
          </div>
        ) : (
          <div className="h-10 flex items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Waitlist Open</span>
          </div>
        )}
        <p className={`text-[13px] font-light leading-snug ${plan.highlight ? 'text-white/70' : 'text-stone-500'}`}>
          {plan.tagline}
        </p>
      </div>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <Check size={14} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-brand-orange' : 'text-charcoal/40'}`} />
            <span className={`text-[12px] leading-snug ${plan.highlight ? 'text-white/80' : 'text-stone-500'}`}>{f}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <button
          onClick={onClick}
          disabled={busy || isCurrent}
          className={`w-full h-10 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            plan.highlight ? 'bg-white text-charcoal hover:bg-stone-100' : 'bg-charcoal text-white hover:bg-charcoal/80'
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
};
