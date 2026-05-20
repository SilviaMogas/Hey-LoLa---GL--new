import { getAdminDb, appUrl } from './_admin';
import { sendVenueClaimEmails } from '../src/lib/email';

// POST /api/notify-claim
//   Body: { claimId: string }
//
// Called by the client right after a doc is written to claim_requests.
// We re-read it via the Admin SDK (source of truth) so the client can
// never spoof the recipient or the business name. Sends two emails:
//   1. Confirmation to the claimant with a 1-week SLA.
//   2. Internal alert to hey@heylola.co.

const RECENT_WINDOW_MS = 10 * 60 * 1000;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { claimId } = (req.body || {}) as { claimId?: string };
  if (!claimId || typeof claimId !== 'string') {
    res.status(400).json({ success: false, error: 'claimId is required.' });
    return;
  }

  let db: ReturnType<typeof getAdminDb>;
  try {
    db = getAdminDb();
  } catch (err) {
    console.error('notify-claim: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  const snap = await db.collection('claim_requests').doc(claimId).get();
  if (!snap.exists) {
    res.status(404).json({ success: false, error: 'Claim not found.' });
    return;
  }
  const data = snap.data() || {};

  // Reject stale claim ids so a leaked one can't be replayed forever.
  const createdMs = Date.parse(String(data.createdAt || '')) || 0;
  if (createdMs && Date.now() - createdMs > RECENT_WINDOW_MS) {
    res.status(409).json({ success: false, error: 'Claim is not recent.' });
    return;
  }

  const claimantEmail = String(data.businessEmail || '');
  if (!claimantEmail.includes('@')) {
    res.status(422).json({ success: false, error: 'Claim has no usable email.' });
    return;
  }

  const placeId = String(data.placeId || '');
  const placeUrl = placeId ? `${appUrl(req)}/venue/${encodeURIComponent(placeId)}` : undefined;

  const result = await sendVenueClaimEmails({
    claimantEmail,
    claimantName: String(data.contactPerson || ''),
    businessName: String(data.businessName || 'your venue'),
    placeName: String(data.placeName || ''),
    placeUrl,
    message: data.message ? String(data.message) : undefined,
  });

  res.status(200).json({
    success: true,
    confirmationDelivered: result.confirmation.delivered,
    alertDelivered: result.alert.delivered,
  });
}
