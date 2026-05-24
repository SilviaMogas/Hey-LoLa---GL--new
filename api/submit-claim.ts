import { timingSafeEqual } from 'crypto';
import { getAdminClient, appUrl } from './_supabase.js';
import { sendVenueClaimEmails } from '../src/lib/email/index.js';

// Public endpoint backing the /claim-listing/{token} page.
//
//   GET  /api/submit-claim?token=...   → returns the venue's pre-fillable fields
//   POST /api/submit-claim             → submits the claim

function normaliseHostname(value?: string | null): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const withScheme = /^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function emailMatchesWebsite(email: string, website?: string | null): boolean {
  const at = email.lastIndexOf('@');
  if (at < 0) return false;
  const emailDomain = email.slice(at + 1).toLowerCase().trim();
  if (!emailDomain) return false;
  const siteDomain = normaliseHostname(website);
  if (!siteDomain) return false;
  return emailDomain === siteDomain || emailDomain.endsWith(`.${siteDomain}`);
}

function tokensMatch(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

interface ResolvedClaim {
  placeId: string;
  placeData: any;
  secretData: any;
}

async function resolveByToken(db: ReturnType<typeof getAdminClient>, token: string): Promise<ResolvedClaim | { error: string; status: number }> {
  if (!token) return { error: 'Missing token.', status: 400 };
  const { data: secrets } = await db.from('place_secrets').select('*').eq('verification_token', token).limit(1);
  if (!secrets || secrets.length === 0) return { error: 'This link is invalid or has already been used.', status: 404 };
  const secretDoc = secrets[0] as Record<string, any>;
  if (!tokensMatch(String(secretDoc.verification_token || ''), token)) {
    return { error: 'This link is invalid or has already been used.', status: 403 };
  }
  if (secretDoc.verification_token_expires_at && new Date(secretDoc.verification_token_expires_at) < new Date()) {
    return { error: 'This link has expired. Please ask Hey Lola for a new invitation.', status: 410 };
  }
  const placeId = secretDoc.id;
  const { data: place } = await db.from('places').select('*').eq('id', placeId).maybeSingle();
  if (!place) {
    return { error: 'Place not found.', status: 404 };
  }
  return { placeId, placeData: place, secretData: secretDoc };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
  } catch {
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const token = String(req.query?.token || '');
      const r = await resolveByToken(db, token);
      if ('error' in r) {
        res.status(r.status).json({ success: false, error: r.error });
        return;
      }
      const place = r.placeData as Record<string, any>;
      res.status(200).json({
        success: true,
        venue: {
          name: place.name || '',
          address: place.address || '',
          city: place.city || '',
          category: place.category || '',
          businessEmail: r.secretData.business_email || place.contact_email || '',
          alreadySubmitted: place.verification_status === 'pending_review' || place.verification_status === 'verified',
          verificationStatus: place.verification_status || 'not_verified',
        },
      });
      return;
    }

    // POST — submit the claim.
    const body = (req.body || {}) as Record<string, any>;
    const r = await resolveByToken(db, String(body.token || ''));
    if ('error' in r) {
      res.status(r.status).json({ success: false, error: r.error });
      return;
    }

    const required = ['businessName', 'contactName', 'contactRole', 'contactEmail'];
    for (const k of required) {
      if (typeof body[k] !== 'string' || !body[k].trim()) {
        res.status(400).json({ success: false, error: `${k} is required.` });
        return;
      }
    }
    if (!body.confirmsRepresenting) {
      res.status(400).json({ success: false, error: 'You must confirm you represent the business.' });
      return;
    }

    const now = new Date().toISOString();
    const contactEmail = String(body.contactEmail).trim();
    const autoApproved = emailMatchesWebsite(contactEmail, r.placeData.website);
    const update: Record<string, unknown> = {
      verification_status: autoApproved ? 'verified' : 'pending_review',
      claim_requested_at: now,
      claimed_by_email: contactEmail,
      claimed_by_name: String(body.contactName).trim(),
      claimed_by_role: String(body.contactRole).trim(),
      name: String(body.businessName).trim() || r.placeData.name,
      address: String(body.address || r.placeData.address || '').trim(),
      city: String(body.city || r.placeData.city || '').trim(),
      category: String(body.category || r.placeData.category || '').trim(),
      contact_email: contactEmail,
      updated_at: now,
    };
    if (autoApproved) {
      update.status = 'Verified';
      update.partner_status = 'active_partner';
      update.approved_at = now;
      update.approved_by = 'auto:domain_match';
      update.claimed_by = contactEmail;
    }

    const perk = body.perk as undefined | { type?: string; description?: string; conditions?: string; startDate?: string; endDate?: string; days?: string };
    if (perk && typeof perk.type === 'string' && typeof perk.description === 'string' && perk.description.trim()) {
      update.perk_status = 'perk_pending_review';
      update.perk_type = perk.type;
      update.perk_description = perk.description.trim();
      update.perk_conditions = (perk.conditions || '').trim();
      update.perk_start_date = (perk.startDate || '').trim();
      update.perk_end_date = (perk.endDate || '').trim();
      update.perk_available_days = (perk.days || '').trim();
    }

    await db.from('places').update(update).eq('id', r.placeId);

    // Burn the token so a second click can't re-submit.
    await db.from('place_secrets').update({
      verification_token: null,
      verification_token_expires_at: null,
      last_claim_submitted_at: now,
    }).eq('id', r.placeId);

    try {
      await sendVenueClaimEmails({
        claimantEmail: contactEmail,
        claimantName: String(body.contactName).trim(),
        businessName: String(body.businessName).trim() || r.placeData.name,
        placeName: r.placeData.name,
        placeUrl: `${appUrl(req)}/venue/${encodeURIComponent(r.placeId)}`,
        message: typeof body.message === 'string' ? body.message : undefined,
      });
    } catch (err) {
      console.warn('submit-claim: email dispatch failed', err);
    }

    res.status(200).json({ success: true, placeName: r.placeData.name, autoApproved });
  } catch (err: any) {
    console.error('submit-claim: handler error', err);
    res.status(500).json({ success: false, error: 'Something went wrong on our end.' });
  }
}
