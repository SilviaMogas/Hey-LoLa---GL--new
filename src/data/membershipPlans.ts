import type { MembershipPlan } from '../components/MembershipCard';

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'Free',
    period: 'always',
    tagline: "Begin exploring and create your dog's profile. No card required.",
    features: [
      "Your dog's profile and passport",
      'Discover dog-friendly places',
      "The members' community",
      'Curated city guides',
    ],
    cta: 'Get started',
    highlight: false,
    showPrice: true,
  },
  {
    id: 'local',
    name: 'Local',
    price: '$6.99',
    period: 'per month',
    tagline: 'For the dog parent who loves their city and wants more from it.',
    features: [
      'Everything in Free',
      'Save favourite places',
      'Member perks & discounts',
      'One city guide — full access',
    ],
    cta: 'Join early access',
    highlight: false,
    badge: 'Popular',
    comingSoon: true,
    showPrice: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$12.99',
    period: 'per month',
    tagline: 'For the dog parent who travels and wants the full experience.',
    features: [
      'Everything in Local',
      'All city guides — full access',
      'Priority venue perks',
      'Travel documents & records',
    ],
    cta: 'Join early access',
    highlight: false,
    badge: 'Recommended',
    comingSoon: true,
    showPrice: false,
  },
  {
    id: 'black',
    name: 'Black',
    price: '$24.99',
    period: 'per month',
    tagline: 'For the most committed dog traveller. Unlimited and always first.',
    features: [
      'Everything in Plus',
      'Early access to new cities',
      'Exclusive Black member perks',
      'Founding member badge',
    ],
    cta: 'Join the waitlist',
    highlight: false,
    badge: 'Black',
    comingSoon: true,
    showPrice: false,
  },
];

type MembershipTranslations = {
  freeName: string;
  freePrice: string;
  freePeriod: string;
  freeTagline: string;
  freeFeature1: string;
  freeFeature2: string;
  freeFeature3: string;
  freeFeature4: string;
  freeCta: string;
};

export function getTranslatedFreePlan(m: MembershipTranslations): MembershipPlan {
  return {
    id: 'free',
    name: m.freeName,
    price: m.freePrice,
    period: m.freePeriod,
    tagline: m.freeTagline,
    features: [m.freeFeature1, m.freeFeature2, m.freeFeature3, m.freeFeature4],
    cta: m.freeCta,
    highlight: false,
    showPrice: true,
  };
}
