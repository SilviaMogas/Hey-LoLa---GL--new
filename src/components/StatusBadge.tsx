import React from 'react';
import { ShieldCheck, Sparkles, Clock, UserCheck, Award, Gift, CalendarCheck } from 'lucide-react';
import { PlaceStatus } from '../types';
import { useTranslation } from '../lib/LanguageContext';
import { cn } from '../lib/utils';

type BadgeSize = 'xs' | 'sm';

interface Palette {
  bg: string;
  text: string;
  border: string;
}

const PALETTE: Record<PlaceStatus, Palette & { Icon: typeof ShieldCheck }> = {
  'Verified': { bg: 'bg-[#EBF1E9]', text: 'text-[#7A8C6E]', border: 'border-[#7A8C6E]/15', Icon: ShieldCheck },
  'Claimed': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/60', Icon: UserCheck },
  'Community recommended': { bg: 'bg-stone-50', text: 'text-stone-500', border: 'border-stone-200', Icon: Sparkles },
  'Pending verification': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/60', Icon: Clock },
  'Rejected': { bg: 'bg-stone-100', text: 'text-stone-400', border: 'border-stone-200', Icon: Clock },
};

/**
 * Shared pill renderer used by every trust-related badge in the app. Centralises
 * the rounded-full styling so adding a new badge is a one-liner — and so the
 * static analyser doesn't see two near-identical <span class={cn(...)}> blocks.
 */
function BadgePill({ icon, label, palette, size, className }: {
  icon?: React.ReactNode;
  label: string;
  palette: Palette;
  size: BadgeSize;
  className?: string;
}) {
  const padding = size === 'sm' ? 'px-3 py-1' : 'px-2.5 py-0.5';
  const fontSize = size === 'sm' ? 'text-[9px]' : 'text-[8px]';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-[0.15em] border whitespace-nowrap',
        palette.bg, palette.text, palette.border,
        padding, fontSize, className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}

function iconSizeFor(size: BadgeSize) {
  return size === 'sm' ? 11 : 9;
}

/**
 * Renders the trust state of a Place. The "Verified by Hey Lola" badge
 * is reserved for places whose `status === 'Verified'` (admin-approved).
 * Anything else falls through to a softer, honest label. Pairs with
 * ClaimedBadge ("Verified by the business") — a listing can carry zero,
 * one, or both badges, since the two trust signals are independent.
 */
export function StatusBadge({ status, size = 'xs', className, withIcon = true }: {
  status?: PlaceStatus;
  size?: BadgeSize;
  className?: string;
  withIcon?: boolean;
}) {
  const { t } = useTranslation();
  const effective: PlaceStatus = status ?? 'Pending verification';
  const labelKey: Record<PlaceStatus, keyof typeof t.explore> = {
    'Verified': 'statusVerified',
    'Claimed': 'statusClaimed',
    'Community recommended': 'statusCommunity',
    'Pending verification': 'statusPending',
    'Rejected': 'statusRejected',
  };
  const palette = PALETTE[effective];
  const Icon = palette.Icon;
  return (
    <BadgePill
      palette={palette}
      size={size}
      className={className}
      icon={withIcon ? <Icon size={iconSizeFor(size)} /> : undefined}
      label={t.explore[labelKey[effective]] as string}
    />
  );
}

/**
 * Renders alongside a StatusBadge when the listing has been claimed by the
 * business and the admin has approved that claim (i.e. `claimedBy` is set).
 * Independent of `status` — a place can be "Verified by Hey Lola" AND
 * "Verified by the business" at the same time, or just one, or neither.
 */
export function ClaimedBadge({ size = 'xs', className }: { size?: BadgeSize; className?: string }) {
  const { t } = useTranslation();
  return (
    <BadgePill
      palette={PALETTE['Claimed']}
      size={size}
      className={className}
      icon={<UserCheck size={iconSizeFor(size)} />}
      label={t.explore.claimedByPlace}
    />
  );
}

const PARTNER_PALETTE: Palette = { bg: 'bg-charcoal', text: 'text-white', border: 'border-charcoal' };
const PERK_PALETTE: Palette = { bg: 'bg-brand-orange/10', text: 'text-brand-orange', border: 'border-brand-orange/30' };

/** "Hey Lola Partner" — only when partnerStatus === 'active_partner'. */
export function PartnerBadge({ size = 'xs', className }: { size?: BadgeSize; className?: string }) {
  const { t } = useTranslation();
  return (
    <BadgePill
      palette={PARTNER_PALETTE}
      size={size}
      className={className}
      icon={<Award size={iconSizeFor(size)} />}
      label={t.explore.partnerBadge}
    />
  );
}

/** "Perk available" — only when perkStatus === 'perk_active'. */
export function PerkBadge({ size = 'xs', className }: { size?: BadgeSize; className?: string }) {
  const { t } = useTranslation();
  return (
    <BadgePill
      palette={PERK_PALETTE}
      size={size}
      className={className}
      icon={<Gift size={iconSizeFor(size)} />}
      label={t.explore.perkAvailableBadge}
    />
  );
}

const RESERVATIONS_PALETTE: Palette = { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60' };

/** "Reservations available" — shown when a venue has an OpenTable URL set. */
export function ReservationsBadge({ size = 'xs', className }: { size?: BadgeSize; className?: string }) {
  return (
    <BadgePill
      palette={RESERVATIONS_PALETTE}
      size={size}
      className={className}
      icon={<CalendarCheck size={iconSizeFor(size)} />}
      label="Reservations available"
    />
  );
}
