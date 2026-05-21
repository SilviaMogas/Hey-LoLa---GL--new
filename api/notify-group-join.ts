import { getAdminDb, getAdminAuth, appUrl } from './_admin';
import { sendGroupJoinEmails } from '../src/lib/email';

// POST /api/notify-group-join
//   Body: { membershipId: string }
//
// The client creates a doc in group_memberships then calls this. The
// server re-reads the membership via Admin SDK (source of truth) so
// the client cannot forge a recipient by passing arbitrary fields.

const RECENT_WINDOW_MS = 10 * 60 * 1000;

async function resolveRecipient(db: ReturnType<typeof getAdminDb>, auth: ReturnType<typeof getAdminAuth>, userId: string): Promise<{ email: string; name: string }> {
  let email = '';
  let name = 'there';
  try {
    const userRecord = await auth.getUser(userId);
    email = userRecord.email || '';
    name = userRecord.displayName || name;
  } catch (err) {
    console.warn('notify-group-join: getUser failed', err);
  }
  if (email) return { email, name };
  try {
    const snap = await db.collection('users').doc(userId).get();
    if (snap.exists) {
      const p = snap.data() || {};
      email = String(p.email || p.contactEmail || '');
      const composed = [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
      if (composed) name = composed;
      else if (p.displayName) name = String(p.displayName);
    }
  } catch (err) {
    console.warn('notify-group-join: profile lookup failed', err);
  }
  return { email, name };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { membershipId } = (req.body || {}) as { membershipId?: string };
  if (!membershipId || typeof membershipId !== 'string') {
    res.status(400).json({ success: false, error: 'membershipId is required.' });
    return;
  }

  let db: ReturnType<typeof getAdminDb>;
  let auth: ReturnType<typeof getAdminAuth>;
  try {
    db = getAdminDb();
    auth = getAdminAuth();
  } catch (err) {
    console.error('notify-group-join: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  const snap = await db.collection('group_memberships').doc(membershipId).get();
  if (!snap.exists) {
    res.status(404).json({ success: false, error: 'Membership not found.' });
    return;
  }
  const data = snap.data() || {};

  // Reject stale requests so a leaked membershipId can't be replayed indefinitely.
  const joinedAtMs = data.joinedAt?._seconds ? data.joinedAt._seconds * 1000 : 0;
  if (joinedAtMs && Date.now() - joinedAtMs > RECENT_WINDOW_MS) {
    res.status(409).json({ success: false, error: 'Membership is not recent.' });
    return;
  }

  const userId = String(data.userId || '');
  const groupId = String(data.groupId || '');
  const groupName = String(data.groupName || 'the pack');
  if (!userId || !groupId) {
    res.status(422).json({ success: false, error: 'Membership is missing userId / groupId.' });
    return;
  }

  const { email, name } = await resolveRecipient(db, auth, userId);
  if (!email || !email.includes('@')) {
    res.status(422).json({ success: false, error: 'User has no usable email.' });
    return;
  }

  const result = await sendGroupJoinEmails({
    to: email,
    name,
    groupName,
    groupUrl: `${appUrl(req)}/community/${groupId}`,
  });

  res.status(200).json({
    success: true,
    confirmationDelivered: result.confirmation.delivered,
    alertDelivered: result.alert.delivered,
  });
}
