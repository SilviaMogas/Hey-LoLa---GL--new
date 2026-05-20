// Handle (username) helpers: validation, availability, rate-limited changes.
//
// A handle is the public @username. Uniqueness is enforced by a doc in the
// `usernames` collection whose id IS the handle and whose value is { uid }.
// Changing a handle reserves the new doc and frees the old one. Dashboard
// changes are limited to MAX_CHANGES_PER_PERIOD within PERIOD_DAYS; the
// initial claim during onboarding does not count.

import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export const HANDLE_RE = /^[a-z0-9_]{3,20}$/;
export const MAX_CHANGES_PER_PERIOD = 2;
export const PERIOD_DAYS = 30;

/** Lowercase, strip a leading @, and drop anything that isn't a-z 0-9 _. */
export function normalizeHandle(raw: string): string {
  return (raw || '').trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]/g, '');
}

/** Timestamps of changes within the rolling PERIOD_DAYS window. */
export function recentChanges(changedAt?: string[]): string[] {
  const cutoff = Date.now() - PERIOD_DAYS * 24 * 60 * 60 * 1000;
  return (changedAt || []).filter((ts) => {
    const t = Date.parse(ts);
    return !isNaN(t) && t >= cutoff;
  });
}

/** How many handle changes the user still has this period. */
export function changesRemaining(changedAt?: string[]): number {
  return Math.max(0, MAX_CHANGES_PER_PERIOD - recentChanges(changedAt).length);
}

/** True if the handle is free, or already owned by this user. */
export async function isHandleAvailable(handle: string, uid: string): Promise<boolean> {
  const h = normalizeHandle(handle);
  if (!HANDLE_RE.test(h)) return false;
  const snap = await getDoc(doc(db, 'usernames', h));
  return !snap.exists() || snap.data()?.uid === uid;
}

export type SetHandleResult = { ok: true; handle: string } | { ok: false; reason: string };

/**
 * Claim or change a handle.
 * - countAsChange=false → initial claim (onboarding), not rate-limited.
 * - countAsChange=true  → dashboard change, limited to 2 per 30 days.
 */
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

  await setDoc(doc(db, 'usernames', handle), { uid: opts.uid });
  if (current && current !== handle) {
    try { await deleteDoc(doc(db, 'usernames', current)); } catch { /* ignore */ }
  }

  const update: Record<string, unknown> = { username: handle, updatedAt: new Date().toISOString() };
  if (opts.countAsChange) {
    update.usernameChangedAt = [...recentChanges(opts.changedAt), new Date().toISOString()];
  }
  await updateDoc(doc(db, 'users', opts.uid), update);

  return { ok: true, handle };
}
