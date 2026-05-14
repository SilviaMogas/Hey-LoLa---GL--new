/**
 * Hey Lola — What's On
 *
 * Three streams of content render on /whats-on:
 *  - upcoming + past EVENTS (parties, dinners, ETHConf activations, etc.)
 *  - LINKS (press features, partner spotlights, external resources)
 *  - MILESTONES (company timeline — launches, partner wins, foundation
 *    progress)
 *
 * Hardcoded for now. When the list grows we will move the events stream
 * to Firestore so the team can publish from /admin without a redeploy.
 */

export type EventCategory = 'launch' | 'community' | 'foundation' | 'partner' | 'press';

export interface HeyLolaEvent {
  id: string;
  title: string;
  date: string;       // ISO date or YYYY-MM-DD
  endDate?: string;
  city: string;
  venue?: string;
  /** External URL — typically a Partiful, Luma, Eventbrite, etc. invite. */
  url: string;
  description: string;
  category: EventCategory;
  /** Inline tag chips, e.g. ['Members only', 'RSVP required']. */
  tags?: string[];
  /** Optional hero image (we already host these elsewhere or use a remote URL). */
  imageUrl?: string;
}

export interface ExternalLink {
  id: string;
  label: string;
  url: string;
  context?: string;
}

export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
}

export const HEY_LOLA_EVENTS: HeyLolaEvent[] = [
  {
    id: 'partiful-hey-lola-launch',
    title: 'Hey Lola — first gathering',
    date: '2026-05-14',
    city: 'Miami',
    venue: 'TBA',
    url: 'https://partiful.com/u/j54ZGuu5sLvr6gWn9OvO',
    description:
      'The first in-person Hey Lola gathering. A warm soft-launch evening for founding members, partners and friends of the pack.',
    category: 'launch',
    tags: ['RSVP via Partiful', 'Founding members'],
  },
];

export const HEY_LOLA_LINKS: ExternalLink[] = [];

export const HEY_LOLA_MILESTONES: Milestone[] = [
  {
    id: 'soft-launch-miami',
    date: '2026-05-14',
    title: 'Miami soft launch',
    description:
      "Hey Lola opens to the public in Miami. Pet records, curated city guide, partner perks and the Hey Lola Foundation rescue passports go live.",
  },
];

export function isUpcoming(e: HeyLolaEvent, today: Date = new Date()): boolean {
  const compareDate = e.endDate || e.date;
  return new Date(compareDate).getTime() >= new Date(today.toDateString()).getTime();
}
