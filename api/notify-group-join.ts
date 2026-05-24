import { getAdminClient, appUrl } from './_supabase.js';
import { sendGroupJoinEmails } from '../src/lib/email/index.js';

// POST /api/notify-group-join
//   Body: { membershipId: string }
//
// The client creates a doc in group_memberships then calls this. The
// server re-reads the membership via Admin SDK (source of truth) so
// the client cannot forge a recipient by passing arbitrary fields.

const RECENT_WINDOW_MS = 10 * 60 * 1000;

async function resolveRecipient(db: ReturnType<typeof getAdminClient>, userId: string): Promise<{ email: string; name: string }> {
  let email = '';
  let name = 'there';
  try {
    const { data: { user } } = await db.auth.admin.getUserById(userId);
    if (user) {
      email = user.email || '';
      name = user.user_metadata?.display_name || user.user_metadata?.full_name || name;
    }
  } catch (err) {
    console.warn('notify-group-join: getUser failed', err);
  }
  if (email) return { email, name };
  try {
    const { data: row } = await db.from('users').select('*').eq('id', userId).maybeSingle();
    if (row) {
      const p = row as Record<string, any>;
      email = String(p.email || p.contact_email || '');
      const composed = [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
      if (composed) name = composed;
      else if (p.display_name) name = String(p.display_name);
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

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
  } catch (err) {
    console.error('notify-group-join: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  const { data: row } = await db.from('group_memberships').select('*').eq('id', membershipId).maybeSingle();
  if (!row) {
    res.status(404).json({ success: false, error: 'Membership not found.' });
    return;
  }
  const data = row as Record<string, any>;

  // Reject stale requests so a leaked membershipId can't be replayed indefinitely.
  const joinedAtMs = Date.parse(String(data.joined_at || '')) || 0;
  if (joinedAtMs && Date.now() - joinedAtMs > RECENT_WINDOW_MS) {
    res.status(409).json({ success: false, error: 'Membership is not recent.' });
    return;
  }

  const userId = String(data.user_id || '');
  const groupId = String(data.group_id || '');
  const groupName = String(data.group_name || 'the pack');
  if (!userId || !groupId) {
    res.status(422).json({ success: false, error: 'Membership is missing userId / groupId.' });
    return;
  }

  const { email, name } = await resolveRecipient(db, userId);
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
