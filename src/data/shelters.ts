/**
 * Foundation shelters — TYPES ONLY. No dog data lives in the app bundle.
 *
 * The real data lives in Firestore (`shelters` collection), managed by Hey
 * Lola and read live by /foundation. Each dog is a real Hey Lola rescue
 * profile. Seed/refresh the collection with scripts/import_shelters.mjs.
 */
export interface ShelterDog {
  id: string;
  name: string;
  breed: string;
  age: string;
  sex?: 'Male' | 'Female';
  photo?: string;
  bio: string;
}

export interface Shelter {
  id: string;
  name: string;
  city: string;
  region: string;
  blurb: string;
  website: string;
  dogs: ShelterDog[];
  /** Optional shelter logo/avatar URL shown in the card box. Falls back to a
   *  branded monogram when absent. */
  logo?: string;
  /** Sort order on the page. */
  order?: number;
}

/** Where the Foundation currently operates. */
export const FOUNDATION_LOCATION = { region: 'Americas', city: 'New York' };

export function dogSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
