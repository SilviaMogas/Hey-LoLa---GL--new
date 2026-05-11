import type { MemberPlan } from '../types';

export type TierId = 'admin' | 'black' | 'plus' | 'travel' | 'local' | 'free';

export interface Tier {
  id: TierId;
  label: string;
  /** Tailwind background utility for the dot / pill chip. */
  dotClass: string;
  /** Tailwind text utility for the dot/border. */
  textClass: string;
  /** Tailwind bg utility for the badge background. */
  bgClass: string;
}

const TIERS: Record<TierId, Tier> = {
  admin:  { id: 'admin',  label: 'Admin',  dotClass: 'bg-amber-400',     textClass: 'text-amber-700',   bgClass: 'bg-amber-50' },
  black:  { id: 'black',  label: 'Black',  dotClass: 'bg-charcoal',      textClass: 'text-charcoal',    bgClass: 'bg-stone-100' },
  plus:   { id: 'plus',   label: 'Travel', dotClass: 'bg-blue-500',      textClass: 'text-blue-700',    bgClass: 'bg-blue-50' },
  travel: { id: 'travel', label: 'Travel', dotClass: 'bg-blue-500',      textClass: 'text-blue-700',    bgClass: 'bg-blue-50' },
  local:  { id: 'local',  label: 'Local',  dotClass: 'bg-brand-orange',  textClass: 'text-brand-orange', bgClass: 'bg-brand-orange/10' },
  free:   { id: 'free',   label: 'Free',   dotClass: 'bg-stone-300',     textClass: 'text-stone-500',   bgClass: 'bg-stone-50' },
};

/**
 * Returns the tier metadata for the current viewer. Admins are always promoted
 * to the top tier ("Admin", gold) — they never pay but should look senior in
 * the UI. Otherwise we map MemberPlan 1:1.
 */
export function getTier(memberPlan: MemberPlan | undefined | null, isAdmin: boolean): Tier {
  if (isAdmin) return TIERS.admin;
  switch (memberPlan) {
    case 'black':  return TIERS.black;
    case 'plus':   return TIERS.plus;
    case 'travel': return TIERS.travel;
    case 'local':  return TIERS.local;
    default:       return TIERS.free;
  }
}

/** True when the viewer can save / favourite places. Admins always can. */
export function canSavePlaces(memberPlan: MemberPlan | undefined | null, isAdmin: boolean): boolean {
  if (isAdmin) return true;
  return memberPlan === 'local' || memberPlan === 'plus' || memberPlan === 'travel' || memberPlan === 'black';
}
