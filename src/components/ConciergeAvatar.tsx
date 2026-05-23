import React, { useState } from 'react';
import { CONCIERGES, type ConciergeId } from '../data/concierges';

export interface ConciergeAvatarProps {
  id: ConciergeId;
  /** Optional explicit asset path. Defaults to pose 01 (the hero pose). */
  src?: string;
  /** Renders the round head crop instead of the full body pose. */
  variant?: 'pose' | 'head';
  poseIndex?: number;
  alt?: string;
  className?: string;
  rounded?: 'full' | 'xl' | 'none';
  loading?: 'lazy' | 'eager';
}

/**
 * Resilient concierge portrait. Tries to load the PNG from /public/pets/<id>/.
 * If the file isn't there yet (still uploading, or a missing pose number)
 * it falls back to a soft tinted circle with the concierge's initial.
 */
export const ConciergeAvatar: React.FC<ConciergeAvatarProps> = ({
  id,
  src,
  variant = 'pose',
  poseIndex = 1,
  alt,
  className = '',
  rounded = 'full',
  loading = 'lazy',
}) => {
  const profile = CONCIERGES.find((c) => c.id === id);
  const [failed, setFailed] = useState(false);

  const resolvedSrc =
    src ??
    (variant === 'head'
      ? `/pets/${id}/${id}_head.png`
      : `/pets/${id}/${id}_pose_${String(poseIndex).padStart(2, '0')}.png`);

  const radius = rounded === 'full' ? 'rounded-full' : rounded === 'xl' ? 'rounded-2xl' : '';

  if (failed || !profile) {
    return (
      <div
        className={`${radius} ${className} flex items-center justify-center font-serif italic`}
        style={{
          background: profile ? `${profile.accent}1A` : '#F3F1EE',
          color: profile?.accent ?? '#8C8780',
          aspectRatio: '1 / 1',
        }}
        aria-label={alt ?? profile?.name ?? id}
      >
        <span className="text-[42%] leading-none select-none">
          {(profile?.name ?? id).charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt ?? profile.name}
      onError={() => setFailed(true)}
      loading={loading}
      className={`${radius} ${className} object-cover`}
    />
  );
};
