import { supabase } from './supabase';

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

export async function sendConnectionRequest(args: SendConnectionArgs): Promise<string> {
  const { data } = await supabase.from('connections').insert({
    from_uid: args.fromUid,
    to_uid: args.toUid,
    from_name: args.fromName,
    from_photo: args.fromPhoto ?? '',
    to_name: args.toName ?? '',
    message: args.message,
    status: 'pending' as ConnectionStatus,
    participants: [args.fromUid, args.toUid],
    pair: pairKey(args.fromUid, args.toUid),
    created_at: new Date().toISOString(),
  }).select('id').single();
  return data?.id ?? '';
}

export async function listConnections(uid: string): Promise<ConnectionDoc[]> {
  const { data } = await supabase
    .from('connections')
    .select('*')
    .contains('participants', [uid])
    .limit(200);
  return (data || []).map((r) => ({
    id: r.id,
    fromUid: r.from_uid,
    toUid: r.to_uid,
    fromName: r.from_name,
    fromPhoto: r.from_photo,
    toName: r.to_name,
    message: r.message,
    status: r.status as ConnectionStatus,
    participants: r.participants,
    createdAt: r.created_at,
  }));
}

export async function acceptConnection(id: string): Promise<void> {
  await supabase.from('connections').update({ status: 'accepted' }).eq('id', id);
}

export async function declineConnection(id: string): Promise<void> {
  await supabase.from('connections').update({ status: 'declined' }).eq('id', id);
}

export type PairState = 'none' | 'pending-out' | 'pending-in' | 'connected' | 'declined';

export function pairState(list: ConnectionDoc[], me: string, other: string): { state: PairState; doc?: ConnectionDoc } {
  const key = pairKey(me, other);
  const found = list.find((c) => c.participants.includes(other) && (('pair' in c ? (c as { pair?: string }).pair : undefined) === key || c.participants.includes(me)));
  if (!found) return { state: 'none' };
  if (found.status === 'accepted') return { state: 'connected', doc: found };
  if (found.status === 'declined') return { state: 'declined', doc: found };
  return { state: found.fromUid === me ? 'pending-out' : 'pending-in', doc: found };
}
