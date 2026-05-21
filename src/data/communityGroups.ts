export type GroupCategory = 'walks' | 'training' | 'social' | 'travel' | 'wellness' | 'community';

/** Open = any signed-in member can join. Founder = only Founding Members
 *  (profile.foundingMember === true) or admins can enter. */
export type GroupAccess = 'open' | 'founder';

export interface CommunityGroup {
  id: string;
  name: string;
  category: GroupCategory;
  city: 'Miami' | 'NYC' | 'Barcelona' | 'Global';
  members: number;
  cadence: string;
  description: string;
  emoji: string;
  /** Defaults to 'open' when omitted. */
  access?: GroupAccess;
  /** Conversation sub-topics surfaced inside the group room. */
  subtopics?: string[];
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
    name: 'Miami Crew',
    category: 'social',
    city: 'Miami',
    members: 0,
    cadence: 'Open',
    access: 'open',
    description: 'Dog parents in Miami. Café spots, beach mornings, weekend brunches and walking buddies.',
    emoji: '🌴',
    subtopics: ['Beaches & parks', 'Cafés & brunch', 'Vets & grooming', 'Playdates', 'Travel tips'],
  },
  {
    id: 'nyc-pack',
    name: 'NYC Crew',
    category: 'social',
    city: 'NYC',
    members: 0,
    cadence: 'Open',
    access: 'open',
    description: 'Dog parents in New York. Park loops, neighbourhood meetups and city-friendly tips for life with a dog.',
    emoji: '🗽',
    subtopics: ['Parks & runs', 'Neighbourhood meetups', 'Vets & grooming', 'Playdates', 'Apartment life'],
  },
  {
    id: 'bcn-pack',
    name: 'Barcelona Crew',
    category: 'social',
    city: 'Barcelona',
    members: 0,
    cadence: 'Open',
    access: 'open',
    description: 'Dog parents in Barcelona. Beach walks, plaça meetups, dog-friendly terrazas and travel tips.',
    emoji: '🇪🇸',
    subtopics: ['Playas & parques', 'Terrazas dog-friendly', 'Veterinarios', 'Quedadas', 'Viajar con perro'],
  },
  {
    id: 'founders-circle',
    name: "Founders' Circle",
    category: 'community',
    city: 'Global',
    members: 0,
    cadence: 'Founders only',
    access: 'founder',
    description: 'A private space for Hey Lola Founding Members. Shape the roadmap, unlock exclusive perks and meet the inner circle.',
    emoji: '✨',
    subtopics: ['Roadmap & feedback', 'Exclusive perks', 'Founder events', 'Introduce yourself'],
  },
];
