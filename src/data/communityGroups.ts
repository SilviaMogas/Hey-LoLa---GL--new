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

export const COMMUNITY_GROUPS: CommunityGroup[] = [
  // Miami (launch city — fullest set)
  { id: 'mia-brickell-walks', name: 'Brickell Morning Walks', category: 'walks', city: 'Miami', members: 84, cadence: 'Daily · 7am', description: 'Sunrise loops along Brickell Bay, coffee stop included.', emoji: '🌅' },
  { id: 'mia-wynwood-rooftops', name: 'Wynwood Rooftops Club', category: 'social', city: 'Miami', members: 62, cadence: 'Weekly', description: 'Rooftop bars and cafés that welcome dogs in style.', emoji: '🍸' },
  { id: 'mia-beach-pack', name: 'Hobie Beach Pack', category: 'travel', city: 'Miami', members: 47, cadence: 'Weekends', description: 'Dog-friendly beach mornings and Key Biscayne tide rides.', emoji: '🏖️' },
  { id: 'mia-positive-training', name: 'Positive Training Circle', category: 'training', city: 'Miami', members: 38, cadence: 'Bi-weekly', description: 'Reward-based training meetups, all breeds welcome.', emoji: '🎯' },
  { id: 'mia-puppies', name: 'Puppy Class — Miami', category: 'community', city: 'Miami', members: 51, cadence: 'Sundays', description: 'Socialisation playgroups for puppies under 6 months.', emoji: '🐶' },
  { id: 'mia-senior-care', name: 'Senior Dog Care', category: 'wellness', city: 'Miami', members: 22, cadence: 'Monthly', description: 'Vet talks, gentle walks and tips for senior companions.', emoji: '🌿' },
  { id: 'mia-brunch-club', name: 'Brunch with Dogs', category: 'social', city: 'Miami', members: 70, cadence: 'Sat & Sun', description: 'The corner-table circuit — verified dog-friendly brunches.', emoji: '🥐' },
  { id: 'mia-rescue-circle', name: 'Rescue & Foster Circle', category: 'community', city: 'Miami', members: 33, cadence: 'Weekly', description: 'Support fosters, adoption events and rescue partners.', emoji: '❤️' },

  // NYC (coming next)
  { id: 'nyc-park-loop', name: 'Central Park Loop', category: 'walks', city: 'NYC', members: 18, cadence: 'Sat 9am', description: 'Saturday morning loops around the reservoir.', emoji: '🌳' },
  { id: 'nyc-cafe-crawl', name: 'Cafe Crawl NYC', category: 'social', city: 'NYC', members: 14, cadence: 'Monthly', description: 'Curated dog-friendly cafés around the Village.', emoji: '☕' },

  // Barcelona
  { id: 'bcn-canicross', name: 'Canicross Barcelona', category: 'wellness', city: 'Barcelona', members: 41, cadence: 'Twice a week', description: 'Running with your dog — Collserola routes, all levels.', emoji: '🏃' },
  { id: 'bcn-senderismo', name: 'Rutas de Senderismo', category: 'travel', city: 'Barcelona', members: 36, cadence: 'Monthly', description: 'Day-trip hikes — we leave by car, come back tired and happy.', emoji: '🥾' },
  { id: 'bcn-gracia-walks', name: 'Gràcia After-Work', category: 'social', city: 'Barcelona', members: 29, cadence: 'Thursdays', description: 'After-work strolls and dog-friendly terrazas.', emoji: '🌆' },
];
