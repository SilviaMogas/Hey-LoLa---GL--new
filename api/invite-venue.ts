import { getAuth } from 'firebase-admin/auth';
import { randomBytes } from 'crypto';
import { sendVenueInviteEmail } from '../src/lib/email';
import { isAdminEmail } from '../src/lib/admin';
import { getAdminApp, getAdminDb } from './_admin';

// Admin endpoint: issue a venue invitation.
//
// POST /api/invite-venue
//   Authorization: Bearer <Firebase ID token of an admin>
//   Body: { placeId, businessEmail? }
//
// What it does, atomically as far as a single SDK roundtrip allows:
//   1. Resolves the caller's identity from the bearer token; rejects unless
//      the email matches the configured admin (defaults to hello@silviamogas.com).
//   2. Generates a cryptographically random base64url token.
//   3. Persists the token + invite metadata to /place_secrets/{placeId}
//      (admin-only collection, never readable from the client).
//   4. Patches /places/{placeId} with the new verification + partner statuses
//      and the date/email of the invite (visible to the back office).
//   5. Sends the invite email via Resend if RESEND_API_KEY is set; otherwise
//      returns the rendered claim URL so the operator can send manually.

const TOKEN_TTL_DAYS = 30;

function newToken(): string {
  return randomBytes(32).toString('base64url');
}

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

  const { placeId, businessEmail } = (req.body || {}) as { placeId?: string; businessEmail?: string };
  if (!placeId || typeof placeId !== 'string') {
    res.status(400).json({ success: false, error: 'placeId is required.' });
    return;
  }

  let db: ReturnType<typeof getAdminDb>;
  try {
    db = getAdminDb();
  } catch (err) {
    console.error('invite-venue: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured for invitations.' });
    return;
  }

  const authHeader = (req.headers?.authorization as string) || '';
  const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!idToken) {
    res.status(401).json({ success: false, error: 'Missing bearer token.' });
    return;
  }
  let callerEmail: string | undefined;
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken);
    callerEmail = decoded.email;
  } catch {
    res.status(401).json({ success: false, error: 'Invalid bearer token.' });
    return;
  }
  if (!isAdminEmail(callerEmail)) {
    res.status(403).json({ success: false, error: 'Admin only.' });
    return;
  }

  try {
    const placeRef = db.collection('places').doc(placeId);
    const placeSnap = await placeRef.get();
    if (!placeSnap.exists) {
      res.status(404).json({ success: false, error: 'Place not found.' });
      return;
    }
    const place = placeSnap.data() || {};

    const secretRef = db.collection('place_secrets').doc(placeId);
    const secretSnap = await secretRef.get();
    const existingSecret = secretSnap.data() || {};
    const recipient = (businessEmail || existingSecret.businessEmail || place.contactEmail || '').trim();
    if (!recipient) {
      res.status(400).json({ success: false, error: 'No email available for this venue.' });
      return;
    }

    const token = newToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await secretRef.set({
      ...existingSecret,
      verificationToken: token,
      verificationTokenExpiresAt: expiresAt.toISOString(),
      businessEmail: recipient,
      lastInvitedAt: now.toISOString(),
    }, { merge: true });

    await placeRef.update({
      verificationStatus: 'invitation_sent',
      partnerStatus: 'invited',
      verificationEmailSentAt: now.toISOString(),
      verificationEmailSentTo: recipient,
      updatedAt: now.toISOString(),
    });

    const claimUrl = `${appUrl(req)}/claim-listing/${encodeURIComponent(token)}`;
    const result = await sendVenueInviteEmail({
      venueName: (place.name as string) || 'your venue',
      recipientEmail: recipient,
      claimUrl,
    });

    res.status(200).json({
      success: true,
      placeId,
      recipient,
      claimUrl,
      delivered: result.delivered,
      skippedReason: result.skippedReason,
      providerMessageId: result.providerMessageId,
    });
  } catch (err: any) {
    console.error('invite-venue: handler error', err);
    res.status(500).json({ success: false, error: 'Something went wrong on our end.' });
  }
}
