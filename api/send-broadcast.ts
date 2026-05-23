import { getAdminAuth, getAdminDb } from './_admin.js';
import { sendSubscriberBroadcast, type BroadcastRecipient } from '../src/lib/email/index.js';
import { isAdminEmail } from '../src/lib/admin.js';

// POST /api/send-broadcast
//   Headers: Authorization: Bearer <Firebase ID token>
//   Body: {
//     subject: string,
//     body: string,
//     ctaLabel?: string,
//     ctaUrl?: string,
//     audience: 'all' | 'users' | 'waitlist',
//     testEmail?: string   — when set, sends ONLY to this address (dry run)
//   }
//
// Admin-only. Sends a broadcast email to all subscribers (registered users,
// waitlist entries, or both). Reads recipients from Firestore via the Admin
// SDK so the client cannot forge the recipient list.

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // Authenticate: require a valid Firebase ID token from an admin user.
  let adminAuth: ReturnType<typeof getAdminAuth>;
  let db: ReturnType<typeof getAdminDb>;
  try {
    adminAuth = getAdminAuth();
    db = getAdminDb();
  } catch (err) {
    console.error('[send-broadcast] admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  const authHeader = req.headers?.authorization as string | undefined;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing Authorization header.' });
    return;
  }
  const idToken = authHeader.slice(7);
  let callerEmail: string | undefined;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    callerEmail = decoded.email;
  } catch (err: any) {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    return;
  }
  if (!isAdminEmail(callerEmail)) {
    res.status(403).json({ success: false, error: 'Not an admin.' });
    return;
  }

  const {
    subject,
    body,
    ctaLabel,
    ctaUrl,
    audience = 'all',
    testEmail,
  } = (req.body || {}) as {
    subject?: string;
    body?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    audience?: 'all' | 'users' | 'waitlist';
    testEmail?: string;
  };

  if (!subject || !body) {
    res.status(400).json({ success: false, error: 'subject and body are required.' });
    return;
  }

  // Test mode: send only to the specified address.
  if (testEmail) {
    const result = await sendSubscriberBroadcast(
      { subject, body, ctaLabel, ctaUrl },
      [{ email: testEmail, firstName: 'Test' }],
    );
    res.status(200).json({ success: true, ...result });
    return;
  }

  // Build recipient list from Firestore.
  const recipients: BroadcastRecipient[] = [];
  const seen = new Set<string>();

  if (audience === 'all' || audience === 'users') {
    try {
      const snap = await db.collection('users').get();
      for (const doc of snap.docs) {
        const data = doc.data();
        const email = data.email as string | undefined;
        if (email && !seen.has(email.toLowerCase())) {
          seen.add(email.toLowerCase());
          recipients.push({ email, firstName: data.firstName || undefined });
        }
      }
    } catch (err) {
      console.error('[send-broadcast] users fetch failed', err);
    }
  }

  if (audience === 'all' || audience === 'waitlist') {
    try {
      const snap = await db.collection('waitlist').get();
      for (const doc of snap.docs) {
        const data = doc.data();
        const email = data.email as string | undefined;
        if (email && !seen.has(email.toLowerCase())) {
          seen.add(email.toLowerCase());
          recipients.push({ email, firstName: data.firstName || undefined });
        }
      }
    } catch (err) {
      console.error('[send-broadcast] waitlist fetch failed', err);
    }
  }

  if (recipients.length === 0) {
    res.status(422).json({ success: false, error: 'No recipients found.' });
    return;
  }

  console.log(`[send-broadcast] sending to ${recipients.length} recipients (audience=${audience})`);

  const result = await sendSubscriberBroadcast(
    { subject, body, ctaLabel, ctaUrl },
    recipients,
  );

  res.status(200).json({ success: true, ...result });
}
