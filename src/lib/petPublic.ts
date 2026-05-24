import { supabase } from './supabase';
import { handleSupabaseError, OperationType } from './dbHelpers';
import type { Activity, PetData, UserProfile } from '../types';

export interface PetPublicCard {
  petId: string;
  ownerId: string;
  name: string;
  type: PetData['type'];
  sex?: 'Male' | 'Female';
  breed?: string;
  photoURL?: string;
  city?: string;
  activities?: Activity[];
  hobbies?: string;
  isPublic: boolean;
  isHidden: boolean;
  ownerName?: string;
  ownerHandle?: string;
  ownerPhoto?: string;
  ownerCity?: string;
  ownerBio?: string;
  updatedAt?: unknown;
}

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
    isPublic: pet.isPublic !== false,
    isHidden: pet.isHidden === true,
  };
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

export async function syncPetPublicCard(
  petId: string,
  pet: Partial<PetData> & { userId?: string },
  profile?: Partial<UserProfile> | null,
): Promise<void> {
  if (!petId || !pet.userId) return;
  try {
    const card = buildPetPublicCard(petId, pet, profile);
    await supabase.from('pet_public').upsert({
      pet_id: card.petId,
      owner_id: card.ownerId,
      name: card.name,
      type: card.type,
      sex: card.sex || null,
      breed: card.breed || null,
      photo_url: card.photoURL || null,
      city: card.city || null,
      activities: card.activities || null,
      hobbies: card.hobbies || null,
      is_public: card.isPublic,
      is_hidden: card.isHidden,
      owner_name: card.ownerName || null,
      owner_handle: card.ownerHandle || null,
      owner_photo: card.ownerPhoto || null,
      owner_city: card.ownerCity || null,
      owner_bio: card.ownerBio || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'pet_id' });
  } catch (err) {
    handleSupabaseError(err, OperationType.WRITE, 'pet_public');
  }
}
