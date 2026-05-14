import { getAdminDb } from './_admin';
import { sendPartnerApplicationEmails } from '../src/lib/email';

// Public endpoint called by the client immediately after a partner_application
// document is created from /partners/onboard. We re-read the document from
// Firestore (via the Admin SDK, bypassing rules) to:
//   - Confirm it really exists (no email forging by sending a fabricated id).
//   - Confirm it was created within the last few minutes (prevents replay).
//   - Pull the canonical contact email — we do NOT trust whatever the client
//     passes in the request body.
//
// POST /api/notify-partner-application
//   Body: { applicationId: string }
const RECENT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { applicationId } = (req.body || {}) as { applicationId?: string };
  if (!applicationId || typeof applicationId !== 'string') {
    res.status(400).json({ success: false, error: 'applicationId is required.' });
    return;
  }

  let db: ReturnType<typeof getAdminDb>;
  try {
    db = getAdminDb();
  } catch (err) {
    console.error('notify-partner-application: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  const snap = await db.collection('partner_applications').doc(applicationId).get();
  if (!snap.exists) {
    res.status(404).json({ success: false, error: 'Application not found.' });
    return;
  }
  const data = snap.data() || {};

  // Replay protection — the doc must be recent.
  const createdAtMs = data.createdAt?._seconds ? data.createdAt._seconds * 1000 : 0;
  if (createdAtMs && Date.now() - createdAtMs > RECENT_WINDOW_MS) {
    res.status(409).json({ success: false, error: 'Application is not recent.' });
    return;
  }

  if (typeof data.email !== 'string' || !data.email.includes('@')) {
    res.status(422).json({ success: false, error: 'Application has no usable email.' });
    return;
  }

  const result = await sendPartnerApplicationEmails({
    businessName: String(data.businessName || 'New partner'),
    contactName: String(data.contactName || data.email),
    contactEmail: String(data.email),
    contactRole: typeof data.contactRole === 'string' ? data.contactRole : undefined,
    city: typeof data.city === 'string' ? data.city : undefined,
    applicationId,
  });

  res.status(200).json({ success: true, ...result });
}
