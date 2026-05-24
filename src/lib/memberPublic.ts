import { supabase } from './supabase';
import { handleSupabaseError, OperationType } from './dbHelpers';
import type { UserProfile } from '../types';

export interface MemberPublicCard {
  uid: string;
  name: string;
  photo?: string;
  city?: string;
  bio?: string;
  interests?: string[];
  optIn: boolean;
  updatedAt?: unknown;
}

export function buildMemberPublicCard(uid: string, profile: Partial<UserProfile> | null | undefined, optIn: boolean): MemberPublicCard {
  const name = (profile?.displayName
    || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
    || 'Member').trim();
  const card: MemberPublicCard = { uid, name, optIn };
  if (profile?.photoURL) card.photo = profile.photoURL;
  const city = profile?.localHub || profile?.homeCity;
  if (city) card.city = city;
  if (profile?.bio) card.bio = profile.bio;
  if (profile?.interests && profile.interests.length) card.interests = profile.interests;
  return card;
}

export async function syncMemberPublicCard(uid: string, profile: Partial<UserProfile> | null | undefined, optIn: boolean): Promise<void> {
  if (!uid) return;
  try {
    const card = buildMemberPublicCard(uid, profile, optIn);
    await supabase.from('member_public').upsert({
      uid: card.uid,
      name: card.name,
      photo: card.photo || null,
      city: card.city || null,
      bio: card.bio || null,
      interests: card.interests || null,
      opt_in: card.optIn,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'uid' });
  } catch (err) {
    handleSupabaseError(err, OperationType.WRITE, 'member_public');
  }
}
