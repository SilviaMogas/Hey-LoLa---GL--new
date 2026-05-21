import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import type { Activity, PetData, UserProfile } from '../types';

/**
 * A pet's PUBLIC profile card. This is a deliberately narrow subset of
 * PetData — it never carries confidential fields (microchip, passport,
 * vaccinations, weight, health timeline, emergency contacts, birth date,
 * residence/country). It lives in its own collection `pet_public/{petId}`
 * so the public profile page can read it without ever touching the private
 * /pets document (and so search engines / anonymous visitors only ever see
 * safe data). Owner-identifying fields are denormalised here too so the
 * "furry parent" ficha renders without reading the private /users doc.
 */
export interface PetPublicCard {
  petId: string;
  ownerId: string;
  // Pet — safe fields only.
  name: string;
  type: PetData['type'];
  sex?: 'Male' | 'Female';
  breed?: string;
  photoURL?: string;
  city?: string;
  activities?: Activity[];
  hobbies?: string;
  // Visibility gates (mirrored so rules + UI can filter).
  isPublic: boolean;
  isHidden: boolean;
  // Furry parent — safe, public-facing fields only.
  ownerName?: string;
  ownerHandle?: string;
  ownerPhoto?: string;
  ownerCity?: string;
  ownerBio?: string;
  updatedAt?: unknown;
}

/** Build the safe public card from a pet + its owner's profile. */
export function buildPetPublicCard(
  petId: string,
  pet: Partial<PetData> & { userId?: string },
  profile?: Partial<UserProfile> | null,
): PetPublicCard {
  const ownerName = (profile?.displayName
    || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
    || '').trim();
  const card: PetPublicCard = {
    petId,
    ownerId: pet.userId ?? '',
    name: (pet.name ?? '').trim(),
    type: (pet.type ?? 'Dog') as PetData['type'],
    isPublic: pet.isPublic !== false, // default to visible unless explicitly false
    isHidden: pet.isHidden === true,
  };
  // Only attach optional fields when present — Firestore rejects `undefined`.
  if (pet.sex) card.sex = pet.sex;
  if (pet.breed) card.breed = pet.breed;
  if (pet.photoURL) card.photoURL = pet.photoURL;
  if (pet.city) card.city = pet.city;
  if (pet.activities && pet.activities.length) card.activities = pet.activities;
  if (pet.hobbies) card.hobbies = pet.hobbies;
  if (ownerName) card.ownerName = ownerName;
  if (profile?.username) card.ownerHandle = profile.username;
  if (profile?.photoURL) card.ownerPhoto = profile.photoURL;
  const ownerCity = profile?.localHub || profile?.homeCity;
  if (ownerCity) card.ownerCity = ownerCity;
  if (profile?.bio) card.ownerBio = profile.bio;
  return card;
}

/**
 * Best-effort write of a pet's public card. NEVER throws — a failed mirror
 * must not block the underlying pet save. Call after creating or updating
 * a pet, and to backfill existing pets on dashboard load.
 */
export async function syncPetPublicCard(
  petId: string,
  pet: Partial<PetData> & { userId?: string },
  profile?: Partial<UserProfile> | null,
): Promise<void> {
  if (!petId || !pet.userId) return;
  try {
    const card = buildPetPublicCard(petId, pet, profile);
    await setDoc(doc(db, 'pet_public', petId), { ...card, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'pet_public');
  }
}
