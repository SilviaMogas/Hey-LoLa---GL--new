import { supabase } from './supabase';

export interface DmThread {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  lastMessage?: string;
  lastMessageAt?: string | null;
  lastSenderUid?: string;
  unreadFor: Record<string, number>;
  contextPet?: string;
  createdAt?: string | null;
}

export interface DmMessage {
  id: string;
  fromUid: string;
  text: string;
  createdAt: string | null;
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
  const { data: existing } = await supabase.from('dm_threads').select('id').eq('id', threadId).maybeSingle();
  if (!existing) {
    await supabase.from('dm_threads').insert({
      id: threadId,
      participants: sortedPair(meUid, otherUid),
      participant_names: { [meUid]: meName, [otherUid]: otherName },
      participant_photos: { [meUid]: mePhoto ?? '', [otherUid]: otherPhoto ?? '' },
      unread_for: { [meUid]: 0, [otherUid]: 0 },
      context_pet: contextPet ?? '',
      created_at: new Date().toISOString(),
    });
  }
  return threadId;
}

export async function sendMessage(threadId: string, fromUid: string, toUid: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await supabase.from('dm_messages').insert({
    thread_id: threadId,
    from_uid: fromUid,
    text: trimmed,
    created_at: new Date().toISOString(),
  });
  // Update thread metadata
  const { data: thread } = await supabase.from('dm_threads').select('unread_for').eq('id', threadId).single();
  const unreadFor = (thread?.unread_for as Record<string, number>) || {};
  unreadFor[toUid] = (unreadFor[toUid] || 0) + 1;
  await supabase.from('dm_threads').update({
    last_message: trimmed,
    last_message_at: new Date().toISOString(),
    last_sender_uid: fromUid,
    unread_for: unreadFor,
  }).eq('id', threadId);
}

export async function markThreadRead(threadId: string, meUid: string) {
  const { data: thread } = await supabase.from('dm_threads').select('unread_for').eq('id', threadId).single();
  const unreadFor = (thread?.unread_for as Record<string, number>) || {};
  unreadFor[meUid] = 0;
  await supabase.from('dm_threads').update({ unread_for: unreadFor }).eq('id', threadId);
}

function rowToThread(row: Record<string, unknown>): DmThread {
  return {
    id: row.id as string,
    participants: (row.participants as string[]) ?? [],
    participantNames: (row.participant_names as Record<string, string>) ?? {},
    participantPhotos: (row.participant_photos as Record<string, string>) ?? {},
    lastMessage: row.last_message as string | undefined,
    lastMessageAt: (row.last_message_at as string) ?? null,
    lastSenderUid: row.last_sender_uid as string | undefined,
    unreadFor: (row.unread_for as Record<string, number>) ?? {},
    contextPet: row.context_pet as string | undefined,
    createdAt: (row.created_at as string) ?? null,
  };
}

function rowToMessage(row: Record<string, unknown>): DmMessage {
  return {
    id: row.id as string,
    fromUid: (row.from_uid as string) ?? '',
    text: (row.text as string) ?? '',
    createdAt: (row.created_at as string) ?? null,
  };
}

export function subscribeMyThreads(meUid: string, onChange: (threads: DmThread[]) => void) {
  // Initial fetch
  supabase
    .from('dm_threads')
    .select('*')
    .contains('participants', [meUid])
    .order('last_message_at', { ascending: false })
    .then(({ data }) => {
      if (data) onChange(data.map(r => rowToThread(r)));
    });

  // Realtime
  const channel = supabase
    .channel(`dm-threads-${meUid}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'dm_threads',
    }, () => {
      supabase
        .from('dm_threads')
        .select('*')
        .contains('participants', [meUid])
        .order('last_message_at', { ascending: false })
        .then(({ data }) => {
          if (data) onChange(data.map(r => rowToThread(r)));
        });
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export function subscribeThreadMessages(threadId: string, onChange: (messages: DmMessage[]) => void) {
  // Initial fetch
  supabase
    .from('dm_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .then(({ data }) => {
      if (data) onChange(data.map(r => rowToMessage(r)));
    });

  // Realtime
  const channel = supabase
    .channel(`dm-messages-${threadId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'dm_messages',
      filter: `thread_id=eq.${threadId}`,
    }, () => {
      supabase
        .from('dm_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (data) onChange(data.map(r => rowToMessage(r)));
        });
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
