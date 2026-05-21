export type GroupCategory = 'walks' | 'training' | 'social' | 'travel' | 'wellness' | 'community';

/** Open = any signed-in member can join. Founder = only Founding Members
 *  (profile.foundingMember === true) or admins can enter. */
export type GroupAccess = 'open' | 'founder';

/** Used to group the crews into continent sections in the UI. */
export type Continent = 'Americas' | 'Europe' | 'Global';

export const CONTINENT_ORDER: Continent[] = ['Americas', 'Europe', 'Global'];

export const CONTINENT_META: Record<Continent, { label: string; emoji: string }> = {
  Americas: { label: 'Americas', emoji: '🌎' },
  Europe: { label: 'Europe', emoji: '🌍' },
  Global: { label: 'Global', emoji: '✨' },
};

export interface CommunityGroup {
  id: string;
  name: string;
  category: GroupCategory;
  city: 'Miami' | 'NYC' | 'Toronto' | 'Washington DC' | 'Barcelona' | 'Global';
  members: number;
  cadence: string;
  description: string;
  emoji: string;
  /** Defaults to 'open' when omitted. */
  access?: GroupAccess;
  /** Conversation sub-topics surfaced inside the group room. */
  subtopics?: string[];
  /** Continent the city belongs to — drives the grouped UI sections. */
  continent?: Continent;
}

export const CATEGORY_META: Record<GroupCategory, { label: string; color: string; accent: string }> = {
  walks: { label: 'Walks & Playdates', color: 'bg-[#F7F9F5]', accent: 'text-[#6E8C5D]' },
  training: { label: 'Training & Learning', color: 'bg-[#F5F8FA]', accent: 'text-[#5D848C]' },
  social: { label: 'Social', color: 'bg-[#FDF8F6]', accent: 'text-[#C4622D]' },
  travel: { label: 'Travel & Adventures', color: 'bg-[#FAF9F5]', accent: 'text-[#8C845D]' },
  wellness: { label: 'Wellness', color: 'bg-[#F8F5FA]', accent: 'text-[#7C5D8C]' },
  community: { label: 'Community Care', color: 'bg-[#FAF7F2]', accent: 'text-[#8C6B3F]' },
};

/**
 * City crews are open to any signed-in member. The Founders' Circle is a
 * closed space gated to Founding Members. Each group has its own room
 * (/community/{id}) with sub-topics to organise the conversation.
 */
export const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    id: 'mia-pack',
    name: 'Miami 🌴',
    category: 'social',
    city: 'Miami',
    continent: 'Americas',
    members: 0,
    cadence: 'Open',
    access: 'open',
    description: 'Dog parents in Miami. Café spots, beach mornings, weekend brunches and walking buddies.',
    emoji: '🌴',
    subtopics: ['Presentations', 'Beaches & parks', 'Cafés & brunch', 'Vets & grooming', 'Playdates', 'Travel tips'],
  },
  {
    id: 'nyc-pack',
    name: 'New York 🗽',
    category: 'social',
    city: 'NYC',
    continent: 'Americas',
    members: 0,
    cadence: 'Open',
    access: 'open',
    description: 'Dog parents in New York. Park loops, neighbourhood meetups and city-friendly tips for life with a dog.',
    emoji: '🗽',
    subtopics: ['Presentations', 'Parks & runs', 'Neighbourhood meetups', 'Vets & grooming', 'Playdates', 'Apartment life'],
  },
  {
    id: 'bcn-pack',
    name: 'Barcelona 🌊',
    category: 'social',
    city: 'Barcelona',
    continent: 'Europe',
    members: 0,
    cadence: 'Open',
    access: 'open',
    description: 'Dog parents in Barcelona. Beach walks, plaça meetups, dog-friendly terrazas and travel tips.',
    emoji: '🇪🇸',
    subtopics: ['Presentations', 'Playas & parques', 'Terrazas dog-friendly', 'Veterinarios', 'Quedadas', 'Viajar con perro'],
  },
  {
    id: 'tor-pack',
    name: 'Toronto 🍁',
    category: 'social',
    city: 'Toronto',
    continent: 'Americas',
    members: 0,
    cadence: 'Open',
    access: 'open',
    description: 'Dog parents in Toronto. Ravine walks, patio meetups, off-leash parks and winter-ready tips for life with a dog.',
    emoji: '🍁',
    subtopics: ['Presentations', 'Parks & ravines', 'Patios & cafés', 'Vets & grooming', 'Playdates', 'Winter tips'],
  },
  {
    id: 'dc-pack',
    name: 'Washington DC 🏛️',
    category: 'social',
    city: 'Washington DC',
    continent: 'Americas',
    members: 0,
    cadence: 'Open',
    access: 'open',
    description: 'Dog parents in Washington DC. Mall strolls, neighbourhood meetups, dog-friendly patios and local tips.',
    emoji: '🏛️',
    subtopics: ['Presentations', 'Parks & trails', 'Cafés & patios', 'Vets & grooming', 'Playdates', 'Neighbourhoods'],
  },
  {
    id: 'founders-circle',
    name: "Founders' Circle ✨",
    category: 'community',
    city: 'Global',
    continent: 'Global',
    members: 0,
    cadence: 'Founders only',
    access: 'founder',
    description: 'A private space for Hey Lola Founding Members. Shape the roadmap, unlock exclusive perks and meet the inner circle.',
    emoji: '✨',
    subtopics: ['Presentations', 'Roadmap & feedback', 'Exclusive perks', 'Founder events'],
  },
];
