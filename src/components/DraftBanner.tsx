import React from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { type FeatureStatus } from '../lib/featureFlags';

interface DraftBannerProps {
  status: FeatureStatus;
  featureLabel: string;
}

/**
 * Sticky banner shown at the top of a page when the current viewer is
 * looking at a feature that hasn't shipped publicly yet. Hidden once the
 * feature is promoted to 'live'.
 */
export const DraftBanner: React.FC<DraftBannerProps> = ({ status, featureLabel }) => {
  if (status === 'live') return null;

  const isDraft = status === 'draft';
  const accent = isDraft ? 'bg-brand-orange text-white' : 'bg-stone-900 text-white';
  const Icon = isDraft ? Eye : Sparkles;
  const label = isDraft ? 'Preview · Only you can see this' : 'Beta · Public preview';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`sticky top-0 z-[60] ${accent} text-[10px] font-black uppercase tracking-[0.3em] py-2 px-5 flex items-center justify-center gap-3`}
    >
      <Icon size={11} aria-hidden />
      <span>
        {label} — <span className="opacity-70">{featureLabel}</span>
      </span>
    </div>
  );
};
