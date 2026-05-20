import { getAdminDb } from './_admin';
import { sendWaitlistEmails } from '../src/lib/email';

// POST /api/notify-waitlist
//   Body: { entryId: string }
//
// Called by the client right after a doc is written to waitlist from the
// WaitlistModal (member branch). The server re-reads the doc via the Admin
// SDK so the client cannot forge recipients. Sends a confirmation to the
// signup email and an alert to ADMIN_INBOX.

const RECENT_WINDOW_MS = 10 * 60 * 1000;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { entryId } = (req.body || {}) as { entryId?: string };
  if (!entryId || typeof entryId !== 'string') {
    res.status(400).json({ success: false, error: 'entryId is required.' });
    return;
  }

  let db: ReturnType<typeof getAdminDb>;
  try {
    db = getAdminDb();
  } catch (err) {
    console.error('notify-waitlist: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  const snap = await db.collection('waitlist').doc(entryId).get();
  if (!snap.exists) {
    res.status(404).json({ success: false, error: 'Waitlist entry not found.' });
    return;
  }
  const data = snap.data() || {};

  const createdAtMs = data.createdAt?._seconds ? data.createdAt._seconds * 1000 : 0;
  if (createdAtMs && Date.now() - createdAtMs > RECENT_WINDOW_MS) {
    res.status(409).json({ success: false, error: 'Entry is not recent.' });
    return;
  }

  if (typeof data.email !== 'string' || !data.email.includes('@')) {
    res.status(422).json({ success: false, error: 'Entry has no usable email.' });
    return;
  }

  const result = await sendWaitlistEmails({
    firstName: String(data.firstName || ''),
    lastName: typeof data.lastName === 'string' ? data.lastName : undefined,
    email: String(data.email),
    city: String(data.city || ''),
    dogName: typeof data.dogName === 'string' ? data.dogName : undefined,
    dogType: typeof data.dogType === 'string' ? data.dogType : undefined,
    plan: typeof data.plan === 'string' ? data.plan : undefined,
    perks: typeof data.perks === 'string' ? data.perks : undefined,
    entryId,
  });

  res.status(200).json({
    success: true,
    confirmationDelivered: result.confirmation.delivered,
    alertDelivered: result.alert.delivered,
  });
}
