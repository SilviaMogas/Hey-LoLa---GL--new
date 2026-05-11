import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  increment,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  FieldValue,
  DocumentData,
} from 'firebase/firestore';

type ServerTime = Timestamp | FieldValue | null;

export interface DmThread {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  lastMessage?: string;
  lastMessageAt?: ServerTime;
  lastSenderUid?: string;
  unreadFor: Record<string, number>;
  contextPet?: string;
  createdAt?: ServerTime;
}

export interface DmMessage {
  id: string;
  fromUid: string;
  text: string;
  createdAt: ServerTime;
}

const compareStrings = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const sortedPair = (a: string, b: string): [string, string] =>
  compareStrings(a, b) <= 0 ? [a, b] : [b, a];

export const threadIdFor = (a: string, b: string) => sortedPair(a, b).join('_');

export async function ensureThread(
  meUid: string,
  meName: string,
  mePhoto: string,
  otherUid: string,
  otherName: string,
  otherPhoto: string,
  contextPet?: string,
): Promise<string> {
  const threadId = threadIdFor(meUid, otherUid);
  const ref = doc(db, 'dm_threads', threadId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: sortedPair(meUid, otherUid),
      participantNames: { [meUid]: meName, [otherUid]: otherName },
      participantPhotos: { [meUid]: mePhoto ?? '', [otherUid]: otherPhoto ?? '' },
      unreadFor: { [meUid]: 0, [otherUid]: 0 },
      contextPet: contextPet ?? '',
      createdAt: serverTimestamp(),
    });
  }
  return threadId;
}

export async function sendMessage(threadId: string, fromUid: string, toUid: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await addDoc(collection(db, 'dm_threads', threadId, 'messages'), {
    fromUid,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'dm_threads', threadId), {
    lastMessage: trimmed,
    lastMessageAt: serverTimestamp(),
    lastSenderUid: fromUid,
    [`unreadFor.${toUid}`]: increment(1),
  });
}

export async function markThreadRead(threadId: string, meUid: string) {
  await updateDoc(doc(db, 'dm_threads', threadId), {
    [`unreadFor.${meUid}`]: 0,
  });
}

const toThread = (id: string, data: DocumentData): DmThread => ({
  id,
  participants: data.participants ?? [],
  participantNames: data.participantNames ?? {},
  participantPhotos: data.participantPhotos ?? {},
  lastMessage: data.lastMessage,
  lastMessageAt: data.lastMessageAt ?? null,
  lastSenderUid: data.lastSenderUid,
  unreadFor: data.unreadFor ?? {},
  contextPet: data.contextPet,
  createdAt: data.createdAt ?? null,
});

const toMessage = (id: string, data: DocumentData): DmMessage => ({
  id,
  fromUid: data.fromUid ?? '',
  text: data.text ?? '',
  createdAt: data.createdAt ?? null,
});

export function subscribeMyThreads(meUid: string, onChange: (threads: DmThread[]) => void) {
  const q = query(
    collection(db, 'dm_threads'),
    where('participants', 'array-contains', meUid),
    orderBy('lastMessageAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map(d => toThread(d.id, d.data())));
  });
}

export function subscribeThreadMessages(threadId: string, onChange: (messages: DmMessage[]) => void) {
  const q = query(
    collection(db, 'dm_threads', threadId, 'messages'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map(d => toMessage(d.id, d.data())));
  });
}
