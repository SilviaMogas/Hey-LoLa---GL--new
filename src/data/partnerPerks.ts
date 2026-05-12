export type PerkCategory =
  | 'food_drink'
  | 'stay'
  | 'wellness'
  | 'apparel'
  | 'food_nutrition'
  | 'travel'
  | 'services'
  | 'experiences';

export type PerkTier = 'free' | 'local' | 'plus' | 'black';

export interface PartnerPerk {
  id: string;
  partner: string;
  category: PerkCategory;
  city: 'Miami' | 'NYC' | 'Barcelona' | 'Global';
  /** Optional venue slug — if set, links to /venue/<slug> on the explore map */
  placeSlug?: string;
  perkType: string;
  perkLabel: string;
  description: string;
  /** Lowest membership tier that unlocks this perk */
  tier: PerkTier;
  verified: boolean;
  accent: string;
}

export const PERK_CATEGORIES: { id: PerkCategory; label: string; emoji: string }[] = [
  { id: 'food_drink', label: 'Food & Drink', emoji: '🍽️' },
  { id: 'stay', label: 'Stay', emoji: '🛎️' },
  { id: 'wellness', label: 'Wellness', emoji: '🌿' },
  { id: 'apparel', label: 'Apparel', emoji: '👕' },
  { id: 'food_nutrition', label: 'Pet Food', emoji: '🥩' },
  { id: 'travel', label: 'Travel Gear', emoji: '🧳' },
  { id: 'services', label: 'Services', emoji: '✂️' },
  { id: 'experiences', label: 'Experiences', emoji: '✨' },
];

export const PERK_TIERS: { id: PerkTier; label: string; dot: string }[] = [
  { id: 'free', label: 'Free', dot: '#A8A29E' },
  { id: 'local', label: 'Local', dot: '#C4622D' },
  { id: 'plus', label: 'Plus', dot: '#3B82F6' },
  { id: 'black', label: 'Black', dot: '#1A1A1A' },
];

export const PARTNER_PERKS: PartnerPerk[] = [
  {
    id: 'pura-vida-brickell',
    partner: 'Pura Vida Brickell',
    category: 'food_drink',
    city: 'Miami',
    placeSlug: 'pura-vida-brickell',
    perkType: 'discount',
    perkLabel: '10% off',
    description: '10% off the bill + complimentary dog biscuit and water bowl on arrival.',
    tier: 'local',
    verified: true,
    accent: '#C4622D',
  },
  {
    id: 'the-watering-bowl',
    partner: 'The Watering Bowl',
    category: 'food_drink',
    city: 'Miami',
    placeSlug: 'the-watering-bowl',
    perkType: 'free_item',
    perkLabel: 'Free welcome treat',
    description: 'Complimentary dog menu starter and member-only seasonal espresso flight.',
    tier: 'local',
    verified: true,
    accent: '#C4622D',
  },
  {
    id: 'staycation-pets',
    partner: 'Staycation Pets Hotel',
    category: 'stay',
    city: 'Miami',
    placeSlug: 'staycation-pets',
    perkType: 'priority_booking',
    perkLabel: 'Late checkout + welcome kit',
    description: '2pm late checkout, in-room dog bed, and a welcome treat box for the pup.',
    tier: 'plus',
    verified: true,
    accent: '#5D848C',
  },
  {
    id: 'sunny-paws-daycare',
    partner: 'Sunny Paws Daycare',
    category: 'services',
    city: 'Miami',
    placeSlug: 'sunny-paws-daycare',
    perkType: 'free_consultation',
    perkLabel: 'Free evaluation day',
    description: 'A complimentary first day for new members. Meet the team, no commitment.',
    tier: 'local',
    verified: true,
    accent: '#6E8C5D',
  },
  {
    id: 'the-hound-club',
    partner: 'The Hound Club',
    category: 'experiences',
    city: 'Miami',
    placeSlug: 'the-hound-club',
    perkType: 'pet_friendly_experience',
    perkLabel: 'Priority + VIP access',
    description: 'Member-only Sunday brunch with reserved corner tables and dog welcome kits.',
    tier: 'black',
    verified: true,
    accent: '#1A1A1A',
  },
  {
    id: 'paw-couture',
    partner: 'Paw Couture',
    category: 'apparel',
    city: 'Global',
    perkType: 'free_shipping',
    perkLabel: 'Free worldwide shipping',
    description: 'Free shipping on every order, plus 15% off the first purchase for Hey Lola members.',
    tier: 'local',
    verified: true,
    accent: '#9E6B5D',
  },
  {
    id: 'wild-bowl',
    partner: 'Wild Bowl',
    category: 'food_nutrition',
    city: 'Global',
    perkType: 'discount',
    perkLabel: '20% off subscription',
    description: 'Fresh, dog-nutritionist-formulated meals. 20% off your first three subscription deliveries.',
    tier: 'local',
    verified: true,
    accent: '#6E8C5D',
  },
  {
    id: 'lobo-leashes',
    partner: 'Lobo Leashes',
    category: 'travel',
    city: 'Global',
    perkType: 'welcome_bundle',
    perkLabel: 'Welcome travel bundle',
    description: 'Free travel bowl + collapsible leash with every order over $80.',
    tier: 'plus',
    verified: true,
    accent: '#8C845D',
  },
  {
    id: 'verdure-vet',
    partner: 'Verdure Vet',
    category: 'wellness',
    city: 'Miami',
    placeSlug: 'verdure-vet',
    perkType: 'free_consultation',
    perkLabel: 'Free 15-min consult',
    description: 'A 15-minute introductory video consult with a board-certified vet for members.',
    tier: 'plus',
    verified: true,
    accent: '#7A8C6E',
  },
  {
    id: 'salty-tails',
    partner: 'Salty Tails',
    category: 'experiences',
    city: 'Miami',
    placeSlug: 'salty-tails',
    perkType: 'pet_friendly_experience',
    perkLabel: 'Member beach day',
    description: 'Monthly Hey Lola members-only beach day with shaded picnic and dog photographer.',
    tier: 'black',
    verified: true,
    accent: '#5D848C',
  },
];

export const TIER_FROM_PLAN: Record<string, PerkTier> = {
  free: 'free',
  local: 'local',
  plus: 'plus',
  black: 'black',
};

export const TIER_ORDER: PerkTier[] = ['free', 'local', 'plus', 'black'];

export function tierMeetsPerk(userTier: PerkTier, perkTier: PerkTier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(perkTier);
}
