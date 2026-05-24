import { getAdminClient, appUrl } from './_supabase.js';
import { sendEmailVerifiedEmail } from '../src/lib/email/index.js';

// POST /api/notify-email-verified
//   Body: { userId: string; email: string; firstName?: string }
//
// Called by the client when the email-verification polling in App.tsx detects
// that the user has verified their email address. Sends a "you're verified"
// confirmation email via Resend.

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const body = (req.body || {}) as {
    userId?: string;
    email?: string;
    firstName?: string;
  };

  const { userId, email } = body;
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ success: false, error: 'userId is required.' });
    return;
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ success: false, error: 'email is required.' });
    return;
  }

  // Best-effort profile lookup for firstName.
  let firstName = body.firstName || '';
  try {
    if (!firstName) {
      const db = getAdminClient();
      const { data: userRow } = await db.from('users').select('first_name').eq('id', userId).maybeSingle();
      if (userRow) firstName = (userRow as any).first_name || '';
    }
  } catch (err) {
    console.warn('[notify-email-verified] admin lookup failed (continuing with body data):', err);
  }

  const base = appUrl(req);
  try {
    const result = await sendEmailVerifiedEmail({
      firstName,
      email,
      dashboardUrl: `${base}/dashboard`,
      userId,
    });
    res.status(200).json({ success: true, delivered: result.delivered, skippedReason: result.skippedReason });
  } catch (err: any) {
    console.error('[notify-email-verified] send failed:', err?.message || err);
    res.status(500).json({ success: false, error: 'Email send failed.', detail: err?.message });
  }
}
