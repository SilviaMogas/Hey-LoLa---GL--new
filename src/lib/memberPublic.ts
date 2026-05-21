import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import type { UserProfile } from '../types';

/**
 * A member's PUBLIC directory card. Safe, non-confidential subset of the
 * user profile, written to member_public/{uid} only when the member opts in
 * to being discoverable. Other signed-in members read THIS (never the
 * private /users doc) to show name, photo, city and interests, and to send
 * connection requests.
 */
export interface MemberPublicCard {
  uid: string;
  name: string;
  photo?: string;
  city?: string;
  bio?: string;
  interests?: string[];
  /** Whether the member is currently discoverable. */
  optIn: boolean;
  updatedAt?: unknown;
}

export function buildMemberPublicCard(uid: string, profile: Partial<UserProfile> | null | undefined, optIn: boolean): MemberPublicCard {
  const name = (profile?.displayName
    || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
    || 'Member').trim();
  const card: MemberPublicCard = { uid, name, optIn };
  if (profile?.photoURL) card.photo = profile.photoURL;
  if (profile?.homeCity) card.city = profile.homeCity;
  if (profile?.bio) card.bio = profile.bio;
  if (profile?.interests && profile.interests.length) card.interests = profile.interests;
  return card;
}

/**
 * Best-effort write of a member's public card. Never throws — a failed
 * mirror must not block the profile save. Pass optIn=false to mark the
 * member as no longer discoverable (the card stays but is hidden from the
 * directory by the optIn flag).
 */
export async function syncMemberPublicCard(uid: string, profile: Partial<UserProfile> | null | undefined, optIn: boolean): Promise<void> {
  if (!uid) return;
  try {
    const card = buildMemberPublicCard(uid, profile, optIn);
    await setDoc(doc(db, 'member_public', uid), { ...card, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'member_public');
  }
}
