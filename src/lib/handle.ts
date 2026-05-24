import { supabase } from './supabase';

export const HANDLE_RE = /^[a-z0-9_]{3,20}$/;
export const MAX_CHANGES_PER_PERIOD = 2;
export const PERIOD_DAYS = 30;

export function normalizeHandle(raw: string): string {
  return (raw || '').trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]/g, '');
}

export function recentChanges(changedAt?: string[]): string[] {
  const cutoff = Date.now() - PERIOD_DAYS * 24 * 60 * 60 * 1000;
  return (changedAt || []).filter((ts) => {
    const t = Date.parse(ts);
    return !isNaN(t) && t >= cutoff;
  });
}

export function changesRemaining(changedAt?: string[]): number {
  return Math.max(0, MAX_CHANGES_PER_PERIOD - recentChanges(changedAt).length);
}

export async function isHandleAvailable(handle: string, uid: string): Promise<boolean> {
  const h = normalizeHandle(handle);
  if (!HANDLE_RE.test(h)) return false;
  const { data } = await supabase.from('usernames').select('uid').eq('username', h).maybeSingle();
  return !data || data.uid === uid;
}

export type SetHandleResult = { ok: true; handle: string } | { ok: false; reason: string };

export async function setHandle(opts: {
  uid: string;
  currentHandle?: string;
  newHandle: string;
  changedAt?: string[];
  countAsChange: boolean;
}): Promise<SetHandleResult> {
  const handle = normalizeHandle(opts.newHandle);
  const current = (opts.currentHandle || '').trim().toLowerCase();

  if (!HANDLE_RE.test(handle)) {
    return { ok: false, reason: 'El handle debe tener entre 3 y 20 caracteres: solo letras, números o guion bajo.' };
  }
  if (handle === current) return { ok: true, handle };

  if (opts.countAsChange && changesRemaining(opts.changedAt) <= 0) {
    return { ok: false, reason: 'Has alcanzado el límite de 2 cambios de handle este mes.' };
  }

  const available = await isHandleAvailable(handle, opts.uid);
  if (!available) return { ok: false, reason: 'Ese handle ya está en uso. Prueba otro.' };

  await supabase.from('usernames').upsert({ username: handle, uid: opts.uid }, { onConflict: 'username' });
  if (current && current !== handle) {
    try { await supabase.from('usernames').delete().eq('username', current); } catch { /* ignore */ }
  }

  const update: Record<string, unknown> = { username: handle, updated_at: new Date().toISOString() };
  if (opts.countAsChange) {
    update.username_changed_at = [...recentChanges(opts.changedAt), new Date().toISOString()];
  }
  await supabase.from('users').update(update).eq('id', opts.uid);

  return { ok: true, handle };
}
