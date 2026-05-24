import { randomBytes } from 'crypto';
import { sendVenueInviteEmail } from '../src/lib/email/index.js';
import { isAdminEmail } from '../src/lib/admin.js';
import { getAdminClient, appUrl } from './_supabase.js';

// Admin endpoint: issue a venue invitation.
//
// POST /api/invite-venue
//   Authorization: Bearer <Supabase access token of an admin>
//   Body: { placeId, businessEmail? }

const TOKEN_TTL_DAYS = 30;

function newToken(): string {
  return randomBytes(32).toString('base64url');
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

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
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
    const { data: { user }, error } = await db.auth.getUser(idToken);
    if (error || !user) throw error || new Error('No user');
    callerEmail = user.email;
  } catch {
    res.status(401).json({ success: false, error: 'Invalid bearer token.' });
    return;
  }
  if (!isAdminEmail(callerEmail)) {
    res.status(403).json({ success: false, error: 'Admin only.' });
    return;
  }

  try {
    const { data: place } = await db.from('places').select('*').eq('id', placeId).maybeSingle();
    if (!place) {
      res.status(404).json({ success: false, error: 'Place not found.' });
      return;
    }

    const { data: existingSecret } = await db.from('place_secrets').select('*').eq('id', placeId).maybeSingle();
    const secretData = (existingSecret || {}) as Record<string, any>;
    const placeData = place as Record<string, any>;
    const recipient = (businessEmail || secretData.business_email || placeData.contact_email || '').trim();
    if (!recipient) {
      res.status(400).json({ success: false, error: 'No email available for this venue.' });
      return;
    }

    const token = newToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await db.from('place_secrets').upsert({
      id: placeId,
      verification_token: token,
      verification_token_expires_at: expiresAt.toISOString(),
      business_email: recipient,
      last_invited_at: now.toISOString(),
    });

    await db.from('places').update({
      verification_status: 'invitation_sent',
      partner_status: 'invited',
      verification_email_sent_at: now.toISOString(),
      verification_email_sent_to: recipient,
      updated_at: now.toISOString(),
    }).eq('id', placeId);

    const claimUrl = `${appUrl(req)}/claim-listing/${encodeURIComponent(token)}`;
    const result = await sendVenueInviteEmail({
      venueName: (placeData.name as string) || 'your venue',
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
