export interface ConciergeProfile {
  id: 'lola' | 'bruno' | 'milo' | 'nuc';
  name: string;
  role: string;
  tagline: string;
  personality: string;
  style: string;
  vibe: string;
  bio: string;
  color: string;
  badgeColor: string;
  accent: string;
}

export const CONCIERGES: ConciergeProfile[] = [
  {
    id: 'lola',
    name: 'Lola',
    role: 'Dog Concierge & Founder',
    tagline: 'Premium, social, knows all the best places.',
    personality: 'Elegant, observant, always one step ahead.',
    style: 'Chic cat-eye sunglasses, coral bandana.',
    vibe: 'Curated lunches, members-only spots, weekend rituals.',
    bio: 'Lola is the founding concierge — the one who knows which café will save you the corner table and which hotel keeps the dog beds in the closet. She has set the tone for the whole pack.',
    color: 'bg-[#FDF8F6]',
    badgeColor: 'bg-[#F8E3DD] text-[#9E6B5D]',
    accent: '#C4622D',
  },
  {
    id: 'bruno',
    name: 'Bruno',
    role: 'Urban Cool Expert',
    tagline: 'Cool, funny, confident, urban lifestyle.',
    personality: 'Magnetic, low-key, a regular wherever he goes.',
    style: 'Snapback cap, metal D-ring collar.',
    vibe: 'Late breakfasts, rooftops, Miami-cool corners.',
    bio: 'Bruno is the one with the friendship list as long as the cocktail menu. He keeps the city pulse — what just opened, what is worth the queue, what is over.',
    color: 'bg-[#F7F9F5]',
    badgeColor: 'bg-[#E9F1E5] text-[#6E8C5D]',
    accent: '#6E8C5D',
  },
  {
    id: 'milo',
    name: 'Milo',
    role: 'Community Heart',
    tagline: 'Warm, trustworthy, community-focused.',
    personality: 'Calm, generous, makes everyone feel at home.',
    style: 'Natural teal bandana, big smile.',
    vibe: 'Park meet-ups, family-friendly events, repeat visits.',
    bio: 'Milo is the soft side of the pack — the concierge who remembers your dog\'s name and what made you laugh last time. The reason Hey Lola feels personal.',
    color: 'bg-[#F5F8FA]',
    badgeColor: 'bg-[#E5EEF1] text-[#5D848C]',
    accent: '#5D848C',
  },
  {
    id: 'nuc',
    name: 'Nuc',
    role: 'Curious Explorer',
    tagline: 'Curious, adventurous, ready for anything.',
    personality: 'Restless, observant, lives one road trip ahead.',
    style: 'Explorer collar, always set for the next trip.',
    vibe: 'Weekend escapes, dog-friendly road trips, new neighbourhoods.',
    bio: 'Nuc is the concierge for everything beyond the city limits. He maps the routes, the rest stops and the hotel lobbies that welcome a tired dog at the end of a long day.',
    color: 'bg-[#FAF9F5]',
    badgeColor: 'bg-[#F1EEE5] text-[#8C845D]',
    accent: '#8C845D',
  },
];

export const POSE_COUNT = 10;
export const conciergePose = (id: ConciergeProfile['id'], pose: number) =>
  `/pets/${id}/${id}_pose_${String(pose).padStart(2, '0')}.png`;
