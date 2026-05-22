export type ConciergeId = 'lola' | 'bruno' | 'milo' | 'taco';

export interface ConciergeProfile {
  id: ConciergeId;
  name: string;
  role: string;
  tagline: string;
  personality: string;
  style: string;
  vibe: string;
  bio: string;
  /** soft tint used for the avatar background */
  color: string;
  /** badge chip background + text colour */
  badgeColor: string;
  /** brand accent for outlines, dots and emphasis */
  accent: string;
  /** breed shown on the brand book detail page */
  breed: string;
  /** signature object — the visual fingerprint of the concierge */
  signature: string;
  /** canonical hero portrait (the "01" pose) */
  imageUrl: string;
  /** square head crop used for avatars; falls back to imageUrl if missing */
  headUrl?: string;
  /** Whether this concierge has been publicly revealed. Unrevealed ones
   *  render as "Coming soon" teasers and don't open a detail page. */
  revealed: boolean;
}

/**
 * Factory used to keep the four concierge profiles compact and free of
 * repeated property keys (Sonar CPD treats identical-key object literals
 * as duplicates even though the *values* are what the data is about).
 */
const concierge = (
  id: ConciergeId,
  name: string,
  role: string,
  tagline: string,
  personality: string,
  style: string,
  vibe: string,
  bio: string,
  breed: string,
  signature: string,
  color: string,
  badgeColor: string,
  accent: string,
  imageUrl: string,
  headUrl?: string,
  revealed: boolean = true,
): ConciergeProfile => ({
  id, name, role, tagline, personality, style, vibe, bio,
  breed, signature, color, badgeColor, accent, imageUrl, headUrl, revealed,
});

export const CONCIERGES: ConciergeProfile[] = [
  concierge(
    'lola',
    'Lola',
    'Dog Concierge & Founder',
    'Warm, sweet and elegant — the heart of the pack.',
    'Affectionate, sweet, elegant.',
    'Cream curls and the signature orange collar with a heart tag.',
    'Curated lunches, members-only spots, weekend rituals.',
    'Lola is the founding concierge — the one who knows which café will save you the corner table and which hotel keeps the dog beds in the closet. She has set the tone for the whole pack.',
    'Toy Poodle',
    'Orange collar with heart tag',
    'bg-[#FFF6EE]',
    'bg-[#FDE2CB] text-[#9E5826]',
    '#C4622D',
    '/HeyLola.Lola.1.png',
    '/Lola head.png',
  ),
  // Only Lola is live. The other concierges have been removed for now —
  // re-add them here (or via the comingSoon teaser pattern) when revealed.
];

/** Quick lookup helper. */
export const findConcierge = (id: ConciergeId) =>
  CONCIERGES.find((c) => c.id === id);

export const POSE_COUNT = 10;

/**
 * Resolves the asset path for a concierge pose. Pose 01 returns the
 * uploaded hero portrait; poses 02–10 follow the
 * /pets/<id>/<id>_pose_NN.png convention. Missing files are handled
 * by <ConciergeAvatar>'s branded fallback.
 */
export const conciergePose = (id: ConciergeId, pose: number): string => {
  const profile = findConcierge(id);
  if (pose <= 1 && profile?.imageUrl) return profile.imageUrl;
  return `/pets/${id}/${id}_pose_${String(pose).padStart(2, '0')}.png`;
};

export const conciergeHead = (id: ConciergeId): string => {
  const profile = findConcierge(id);
  return profile?.headUrl ?? profile?.imageUrl ?? `/pets/${id}/${id}_head.png`;
};

export const conciergeHero = (id: ConciergeId) => conciergePose(id, 1);
