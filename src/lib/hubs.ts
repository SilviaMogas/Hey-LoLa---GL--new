/**
 * The Hey Lola Local Hubs — our launch cities. A member picks ONE hub when
 * they register (their community home). It is separate from `homeCity` (free
 * text — where they actually live), which may or may not match the hub.
 *
 * The `id` values match the `city` field on community groups
 * (src/data/communityGroups.ts) so a hub maps straight to its city crew.
 */
export interface HubCity {
  id: string;
  label: string;
  emoji: string;
}

export const HUB_CITIES: HubCity[] = [
  { id: 'Miami', label: 'Miami', emoji: '🌴' },
  { id: 'NYC', label: 'New York', emoji: '🗽' },
  { id: 'Toronto', label: 'Toronto', emoji: '🍁' },
  { id: 'Washington DC', label: 'Washington DC', emoji: '🏛️' },
  { id: 'Barcelona', label: 'Barcelona', emoji: '🌊' },
];

export function hubLabel(id?: string): string {
  return HUB_CITIES.find((h) => h.id === id)?.label ?? (id || '');
}
