export type DogStatus = 'available' | 'unavailable' | 'hidden';
export type Sex = 'male' | 'female' | 'unknown';
export type VerificationStatus = 'partner_source' | 'manually_verified' | 'pending';

export interface DogPassport {
  slug: string;
  publicUrl: string;
  visibility: 'public' | 'hidden';
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FoundationDog {
  id: string;
  name: string;
  partnerId: string;
  partnerName: string;
  sourceUrl?: string;
  imageUrl?: string;
  sex: Sex;
  ageLabel?: string;
  breed?: string;
  weightKg?: number;
  location?: string;
  description: string;
  specialCareNotes?: string;
  adoptionFeeUsd?: number;
  status: DogStatus;
  lastSyncedAt?: string;
  passport: DogPassport;
}

/** Build a stable passport object for a dog. Used both for seed data
 *  and when persisting a newly imported dog into foundationDogs. */
export function buildPassport(name: string, partnerId: string, status: DogStatus): DogPassport {
  const slug = `${slugify(name)}-${partnerId}`;
  const visibility: 'public' | 'hidden' = status === 'available' ? 'public' : 'hidden';
  const now = new Date().toISOString();
  return {
    slug,
    publicUrl: `/foundation/dogs/${slug}`,
    visibility,
    verificationStatus: 'partner_source',
    createdAt: now,
    updatedAt: now,
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ── Seed data ────────────────────────────────────────────────────────
 *
 * Marked as Preview content on the directory page. When the Animal
 * Haven import pipeline writes real records into the foundationDogs
 * Firestore collection, the public view should prefer that source
 * and fall back to this seed only when the collection is empty.
 */

export const FOUNDATION_DOGS: FoundationDog[] = [
  {
    id: 'lucky',
    name: 'Lucky',
    partnerId: 'animal-haven',
    partnerName: 'Animal Haven',
    sourceUrl: 'https://www.animalhavenshelter.org/',
    imageUrl: '/pets/lola/lola_pose_01.png',
    sex: 'male',
    ageLabel: '3 years',
    breed: 'Mixed breed',
    weightKg: 12,
    location: 'New York City',
    description: 'Lucky is a calm, friendly dog who loves slow morning walks and a window with afternoon sun. Great with humans, gentle with other dogs.',
    specialCareNotes: 'Sensitive to loud noises — needs a quiet home for the first few weeks.',
    adoptionFeeUsd: 350,
    status: 'available',
    lastSyncedAt: '2026-05-12',
    passport: buildPassport('Lucky', 'animal-haven', 'available'),
  },
  {
    id: 'pearl',
    name: 'Pearl',
    partnerId: 'animal-haven',
    partnerName: 'Animal Haven',
    sourceUrl: 'https://www.animalhavenshelter.org/',
    imageUrl: '/pets/milo/milo_pose_01.png',
    sex: 'female',
    ageLabel: '2 years',
    breed: 'Terrier mix',
    weightKg: 9,
    location: 'New York City',
    description: 'Pearl is curious, playful, and full of soft energy. She picks up routines quickly and loves a thoughtful walking partner.',
    adoptionFeeUsd: 350,
    status: 'available',
    lastSyncedAt: '2026-05-12',
    passport: buildPassport('Pearl', 'animal-haven', 'available'),
  },
  {
    id: 'rio',
    name: 'Rio',
    partnerId: 'animal-haven',
    partnerName: 'Animal Haven',
    sourceUrl: 'https://www.animalhavenshelter.org/',
    imageUrl: '/pets/bruno/bruno_pose_01.png',
    sex: 'male',
    ageLabel: '5 years',
    breed: 'Beagle mix',
    weightKg: 14,
    location: 'New York City',
    description: 'Rio is the senior of the trio — wise, patient and an excellent listener. Best fit for a quieter home or first-time dog parents.',
    specialCareNotes: 'Currently on joint supplements — supplied for the first month after adoption.',
    adoptionFeeUsd: 250,
    status: 'available',
    lastSyncedAt: '2026-05-12',
    passport: buildPassport('Rio', 'animal-haven', 'available'),
  },
];
