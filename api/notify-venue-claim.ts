import { getAdminDb } from './_admin';
import { sendVenueIntakeEmails } from '../src/lib/email';

// POST /api/notify-venue-claim
//   Body: { claimId: string }
//
// Called by the client right after a doc is written to venue_claims from the
// public /start page Venue form. The server re-reads the doc via the Admin
// SDK so the client cannot forge recipients. Sends a confirmation to the
// contact email and an alert to ADMIN_INBOX.

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
    console.error('notify-venue-claim: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  const snap = await db.collection('venue_claims').doc(claimId).get();
  if (!snap.exists) {
    res.status(404).json({ success: false, error: 'Venue claim not found.' });
    return;
  }
  const data = snap.data() || {};

  const createdAtMs = data.createdAt?._seconds ? data.createdAt._seconds * 1000 : 0;
  if (createdAtMs && Date.now() - createdAtMs > RECENT_WINDOW_MS) {
    res.status(409).json({ success: false, error: 'Claim is not recent.' });
    return;
  }

  if (typeof data.email !== 'string' || !data.email.includes('@')) {
    res.status(422).json({ success: false, error: 'Claim has no usable email.' });
    return;
  }

  const result = await sendVenueIntakeEmails({
    businessName: String(data.businessName || 'your venue'),
    category: typeof data.category === 'string' ? data.category : undefined,
    city: String(data.city || ''),
    address: typeof data.address === 'string' ? data.address : undefined,
    contactPerson: String(data.contactPerson || ''),
    contactRole: typeof data.role === 'string' ? data.role : undefined,
    email: String(data.email),
    phone: typeof data.phone === 'string' ? data.phone : undefined,
    petFriendlyStatus: typeof data.petFriendlyStatus === 'string' ? data.petFriendlyStatus : undefined,
    perkInterest: typeof data.perkInterest === 'string' ? data.perkInterest : undefined,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    website: typeof data.website === 'string' ? data.website : undefined,
    instagram: typeof data.instagram === 'string' ? data.instagram : undefined,
    claimId,
  });

  res.status(200).json({
    success: true,
    confirmationDelivered: result.confirmation.delivered,
    alertDelivered: result.alert.delivered,
  });
}
