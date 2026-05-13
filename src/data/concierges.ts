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
  /** canonical hero portrait (the "01" pose) — uploaded to /public */
  imageUrl: string;
  /** square head crop used for avatars; falls back to imageUrl if missing */
  headUrl?: string;
}

export const CONCIERGES: ConciergeProfile[] = [
  {
    id: 'lola',
    name: 'Lola',
    role: 'Dog Concierge & Founder',
    tagline: 'Elegant, social, knows all the best places.',
    personality: 'Refined, observant, always one step ahead.',
    style: 'Cream curls, signature orange collar with a gold heart tag.',
    vibe: 'Curated lunches, members-only spots, weekend rituals.',
    bio: 'Lola is the founding concierge — the one who knows which café will save you the corner table and which hotel keeps the dog beds in the closet. She has set the tone for the whole pack.',
    breed: 'Toy Poodle',
    signature: 'Orange collar, gold heart tag',
    color: 'bg-[#FFF6EE]',
    badgeColor: 'bg-[#FDE2CB] text-[#9E5826]',
    accent: '#C4622D',
    imageUrl: '/HeyLola.Lola.1.png',
    headUrl: '/Lola head.png',
  },
  {
    id: 'taco',
    name: 'Taco',
    role: 'Local Discoveries Editor',
    tagline: 'Curious, sharp, always exploring.',
    personality: 'Quietly clever, low-key adventurous, a regular wherever he goes.',
    style: 'Shiba Inu with a green cap and reading glasses.',
    vibe: 'Hidden cafés, dog-friendly bookshops, the next great neighbourhood.',
    bio: 'Taco is the curious one. He maps neighbourhoods on foot, peeks into every doorway and brings back the spots no guidebook covers. If a place feels right, Taco probably found it first.',
    breed: 'Shiba Inu',
    signature: 'Green cap & reading glasses',
    color: 'bg-[#F4F8EF]',
    badgeColor: 'bg-[#E0EDD2] text-[#5F7A4C]',
    accent: '#6E8C5D',
    imageUrl: '/HeyLola.Taco.1.png',
  },
  {
    id: 'nuc',
    name: 'Nuc',
    role: 'Adventure Concierge',
    tagline: 'Brave, loyal, always up for the next mission.',
    personality: 'Spirited, fearless, ready for the road.',
    style: 'Dachshund with a red cape and a yellow star tag.',
    vibe: 'Weekend escapes, beach days, dog-friendly road trips.',
    bio: 'Nuc is the concierge for everything beyond the city limits. He maps the routes, the rest stops and the hotel lobbies that welcome a tired dog at the end of a long day.',
    breed: 'Dachshund',
    signature: 'Red cape, gold star tag',
    color: 'bg-[#FCF1EE]',
    badgeColor: 'bg-[#F7D5CC] text-[#A33E29]',
    accent: '#C2412B',
    imageUrl: '/HeyLola.Nuc.1.png',
  },
  {
    id: 'toby',
    name: 'Toby',
    role: 'Community Heart',
    tagline: 'Warm, easy-going, makes everyone feel at home.',
    personality: 'Sunny, generous, the friend of every dog at the park.',
    style: 'Golden Retriever with sunglasses and a blue bandana.',
    vibe: 'Park meet-ups, family-friendly events, repeat visits.',
    bio: 'Toby is the soft side of the pack — the concierge who remembers your dog\'s name and what made you laugh last time. The reason Hey Lola feels personal.',
    breed: 'Golden Retriever',
    signature: 'Sunglasses & blue bandana',
    color: 'bg-[#EFF5FA]',
    badgeColor: 'bg-[#D2E4F1] text-[#3F6B8C]',
    accent: '#3F6B8C',
    imageUrl: '/HeyLola.Toby.1.png',
  },
];

/** Quick lookup helper. */
export const findConcierge = (id: ConciergeId) =>
  CONCIERGES.find((c) => c.id === id);

export const POSE_COUNT = 10;

/**
 * Resolves the asset path for a concierge pose.
 *
 * - Pose 01 is always the hero portrait — it resolves to `profile.imageUrl`
 *   so the asset can live anywhere in /public (currently uploaded as
 *   `/HeyLola.<Name>.1.png` at the repo root of public).
 * - Poses 02–10 follow the `/pets/<id>/<id>_pose_NN.png` convention so the
 *   full sticker pack can be dropped in later without a code change. Until
 *   those files exist the <ConciergeAvatar> component renders a branded
 *   placeholder, so nothing breaks visually.
 */
export const conciergePose = (id: ConciergeId, pose: number): string => {
  const profile = CONCIERGES.find((c) => c.id === id);
  if (pose <= 1 && profile?.imageUrl) return profile.imageUrl;
  return `/pets/${id}/${id}_pose_${String(pose).padStart(2, '0')}.png`;
};

/**
 * Square head crop used for avatars. Falls back to the hero portrait.
 */
export const conciergeHead = (id: ConciergeId): string => {
  const profile = CONCIERGES.find((c) => c.id === id);
  return profile?.headUrl ?? profile?.imageUrl ?? `/pets/${id}/${id}_head.png`;
};

export const conciergeHero = (id: ConciergeId) => conciergePose(id, 1);
