export type ConciergeId = 'lola' | 'taco' | 'nuc' | 'toby';

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
): ConciergeProfile => ({
  id, name, role, tagline, personality, style, vibe, bio,
  breed, signature, color, badgeColor, accent, imageUrl, headUrl,
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
  concierge(
    'taco',
    'Taco',
    'Local Discoveries Editor',
    'Intelligent, curious and creative.',
    'Intelligent, curious, creative.',
    'Green cap, round glasses and an orange collar with a paw tag.',
    'Hidden cafés, dog-friendly bookshops, the next great neighbourhood.',
    'Taco is the curious one. He maps neighbourhoods on foot, peeks into every doorway and brings back the spots no guidebook covers. If a place feels right, Taco probably found it first.',
    'Shiba Inu',
    'Green cap, round glasses, orange collar with paw tag',
    'bg-[#F4F8EF]',
    'bg-[#E0EDD2] text-[#5F7A4C]',
    '#6E8C5D',
    '/HeyLola.Taco.1.png',
  ),
  concierge(
    'nuc',
    'Nuc',
    'Adventure Concierge',
    'Loyal, brave and protective.',
    'Loyal, brave, protective.',
    'Orange collar with a gold star tag and a red explorer backpack.',
    'Weekend escapes, beach days, dog-friendly road trips.',
    'Nuc is the concierge for everything beyond the city limits. He maps the routes, the rest stops and the hotel lobbies that welcome a tired dog at the end of a long day.',
    'Dachshund',
    'Orange collar with star tag, red backpack',
    'bg-[#FCF1EE]',
    'bg-[#F7D5CC] text-[#A33E29]',
    '#C2412B',
    '/HeyLola.Nuc.1.png',
  ),
  concierge(
    'toby',
    'Toby',
    'Community Heart',
    'Friendly, joyful and playful.',
    'Friendly, joyful, playful.',
    'Orange collar with a blue bone tag engraved with his name.',
    'Park meet-ups, family-friendly events, repeat visits.',
    "Toby is the soft side of the pack — the concierge who remembers your dog's name and what made you laugh last time. The reason Hey Lola feels personal.",
    'Golden Retriever',
    'Orange collar with blue bone name tag',
    'bg-[#EFF5FA]',
    'bg-[#D2E4F1] text-[#3F6B8C]',
    '#3F6B8C',
    '/HeyLola.Toby.1.png',
  ),
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
