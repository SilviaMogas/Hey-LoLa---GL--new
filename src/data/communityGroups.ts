export type GroupCategory = 'walks' | 'training' | 'social' | 'travel' | 'wellness' | 'community';

export interface CommunityGroup {
  id: string;
  name: string;
  category: GroupCategory;
  city: 'Miami' | 'NYC' | 'Barcelona';
  members: number;
  cadence: string;
  description: string;
  emoji: string;
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
 * The Community page intentionally starts with a small, curated pair
 * of city packs — one per active city. They're open to any signed-in
 * member. More sub-groups (training, wellness, rescue circles…) can
 * be added later as the community grows.
 */
export const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    id: 'mia-pack',
    name: 'Crew in Miami',
    category: 'social',
    city: 'Miami',
    members: 0,
    cadence: 'Open',
    description: 'Dog parents in Miami. Café spots, beach mornings, weekend brunches and walking buddies.',
    emoji: '',
  },
  {
    id: 'nyc-pack',
    name: 'NYC Vibes',
    category: 'social',
    city: 'NYC',
    members: 0,
    cadence: 'Open',
    description: 'Dog parents in New York. Park loops, neighbourhood meetups and city-friendly tips for life with a dog.',
    emoji: '',
  },
];
