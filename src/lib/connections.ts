import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface ConnectionDoc {
  id: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  fromPhoto?: string;
  toName?: string;
  message: string;
  status: ConnectionStatus;
  participants: string[];
  createdAt?: unknown;
}

/** Deterministic key for a pair of users, order-independent. */
export function pairKey(a: string, b: string): string {
  return [a, b].sort().join('_');
}

export interface SendConnectionArgs {
  fromUid: string;
  fromName: string;
  fromPhoto?: string;
  toUid: string;
  toName?: string;
  message: string;
}

/** Create a pending connection request. Returns the new doc id. */
export async function sendConnectionRequest(args: SendConnectionArgs): Promise<string> {
  const ref = await addDoc(collection(db, 'connections'), {
    fromUid: args.fromUid,
    toUid: args.toUid,
    fromName: args.fromName,
    fromPhoto: args.fromPhoto ?? '',
    toName: args.toName ?? '',
    message: args.message,
    status: 'pending' as ConnectionStatus,
    participants: [args.fromUid, args.toUid],
    pair: pairKey(args.fromUid, args.toUid),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** All connection docs (any status) the user is part of. Client filters. */
export async function listConnections(uid: string): Promise<ConnectionDoc[]> {
  const snap = await getDocs(query(
    collection(db, 'connections'),
    where('participants', 'array-contains', uid),
    limit(200),
  ));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ConnectionDoc, 'id'>) }));
}

export async function acceptConnection(id: string): Promise<void> {
  await updateDoc(doc(db, 'connections', id), { status: 'accepted' as ConnectionStatus });
}

export async function declineConnection(id: string): Promise<void> {
  await updateDoc(doc(db, 'connections', id), { status: 'declined' as ConnectionStatus });
}

/**
 * Resolve the connection state between the viewer and another user from a
 * pre-fetched list: none | pending-out (I sent) | pending-in (they sent) |
 * connected | declined.
 */
export type PairState = 'none' | 'pending-out' | 'pending-in' | 'connected' | 'declined';

export function pairState(list: ConnectionDoc[], me: string, other: string): { state: PairState; doc?: ConnectionDoc } {
  const key = pairKey(me, other);
  const found = list.find((c) => c.participants.includes(other) && (('pair' in c ? (c as { pair?: string }).pair : undefined) === key || c.participants.includes(me)));
  if (!found) return { state: 'none' };
  if (found.status === 'accepted') return { state: 'connected', doc: found };
  if (found.status === 'declined') return { state: 'declined', doc: found };
  // pending
  return { state: found.fromUid === me ? 'pending-out' : 'pending-in', doc: found };
}
