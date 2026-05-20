import { getAdminDb, getAdminAuth } from './_admin';
import { sendGroupJoinEmail } from '../src/lib/email';

// POST /api/notify-group-join
//   Body: { membershipId: string }
//
// The client creates a doc in group_memberships then calls this. The
// server re-reads the membership via Admin SDK (source of truth) so
// the client cannot forge a recipient by passing arbitrary fields.

const RECENT_WINDOW_MS = 10 * 60 * 1000;

function appUrl(req: any): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const proto = (req.headers?.['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers?.['x-forwarded-host'] as string) || (req.headers?.host as string) || 'heylola.co';
  return `${proto}://${host}`;
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

  // Look up the user's email + name from Firebase Auth + the user profile doc.
  let email = '';
  let name = 'there';
  try {
    const userRecord = await auth.getUser(userId);
    email = userRecord.email || '';
    name = userRecord.displayName || name;
  } catch (err) {
    console.warn('notify-group-join: getUser failed', err);
  }
  if (!email) {
    // Fall back to the users/{uid} doc for the email (some accounts only
    // have one or the other depending on signup path).
    try {
      const profileSnap = await db.collection('users').doc(userId).get();
      if (profileSnap.exists) {
        const profile = profileSnap.data() || {};
        email = String(profile.email || profile.contactEmail || '');
        const profileName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
        if (profileName) name = profileName;
        else if (profile.displayName) name = String(profile.displayName);
      }
    } catch (err) {
      console.warn('notify-group-join: profile lookup failed', err);
    }
  }
  if (!email || !email.includes('@')) {
    res.status(422).json({ success: false, error: 'User has no usable email.' });
    return;
  }

  const result = await sendGroupJoinEmail({
    to: email,
    name,
    groupName,
    groupUrl: `${appUrl(req)}/community/${groupId}`,
  });

  res.status(200).json({ success: true, delivered: result.delivered });
}
