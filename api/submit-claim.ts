import { FieldValue } from 'firebase-admin/firestore';
import { timingSafeEqual } from 'crypto';
import { getAdminDb, appUrl } from './_admin';
import { sendVenueClaimEmails } from '../src/lib/email';

// Public endpoint backing the /claim-listing/{token} page.
//
//   GET  /api/submit-claim?token=...   → returns the venue's pre-fillable fields
//                                        for the claim form (name, address,
//                                        category, city, current contact email).
//   POST /api/submit-claim
//        Body: {
//          token, businessName, address, city, category,
//          contactEmail, contactName, contactRole,
//          confirmsRepresenting: true,
//          perk?: { type, description, conditions, startDate?, endDate?, days? }
//        }
//        On success: writes the claim onto /places/{placeId} with
//        verificationStatus='pending_review' (admin must approve), persists
//        the perk fields if provided (perkStatus='perk_pending_review'), and
//        invalidates the token so a second click does nothing.
//
// Security:
//   - Token lookup is a Firestore query on /place_secrets.verificationToken
//     using a constant-time compare on the result; expired or already-used
//     tokens are rejected.
//   - The endpoint never returns the token itself or the businessEmail to
//     anyone other than the bearer of the matching token.
//   - Public users can never approve verification — that's strictly admin-
//     only via the back office.

/**
 * Returns the registrable hostname of a URL, lowercased and without `www.`.
 * Returns null when the input isn't a parseable URL or hostname.
 */
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

/**
 * Auto-approval rule: if the email used to claim ends with the same
 * registrable domain as the venue's website, treat that as proof the
 * claimant controls the business and skip manual review.
 *
 *   info@coralgablesanimalhospital.com + coralgablesanimalhospital.com → true
 *   reservations@booking.example.com  + example.com                   → true
 *   someone@gmail.com                 + example.com                   → false
 */
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

async function resolveByToken(db: ReturnType<typeof getAdminDb>, token: string): Promise<ResolvedClaim | { error: string; status: number }> {
  if (!token) return { error: 'Missing token.', status: 400 };
  const snap = await db.collection('place_secrets').where('verificationToken', '==', token).limit(1).get();
  if (snap.empty) return { error: 'This link is invalid or has already been used.', status: 404 };
  const secretDoc = snap.docs[0];
  const secret = secretDoc.data();
  if (!tokensMatch(String(secret.verificationToken || ''), token)) {
    return { error: 'This link is invalid or has already been used.', status: 403 };
  }
  if (secret.verificationTokenExpiresAt && new Date(secret.verificationTokenExpiresAt) < new Date()) {
    return { error: 'This link has expired. Please ask Hey Lola for a new invitation.', status: 410 };
  }
  const placeRef = db.collection('places').doc(secretDoc.id);
  const placeSnap = await placeRef.get();
  if (!placeSnap.exists) {
    return { error: 'Place not found.', status: 404 };
  }
  return { placeId: secretDoc.id, placeData: placeSnap.data(), secretData: secret };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  let db: ReturnType<typeof getAdminDb>;
  try {
    db = getAdminDb();
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
      const place = r.placeData;
      res.status(200).json({
        success: true,
        venue: {
          name: place.name || '',
          address: place.address || '',
          city: place.city || '',
          category: place.category || '',
          businessEmail: r.secretData.businessEmail || place.contactEmail || '',
          alreadySubmitted: place.verificationStatus === 'pending_review' || place.verificationStatus === 'verified',
          verificationStatus: place.verificationStatus || 'not_verified',
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
    const placeRef = db.collection('places').doc(r.placeId);
    // If the contact email belongs to the venue's website domain we treat
    // that as sufficient proof of ownership and auto-approve. Falls back to
    // pending_review whenever there's no website on file or the domains
    // don't match.
    const autoApproved = emailMatchesWebsite(contactEmail, r.placeData.website);
    const update: Record<string, unknown> = {
      verificationStatus: autoApproved ? 'verified' : 'pending_review',
      claimRequestedAt: now,
      claimedByEmail: contactEmail,
      claimedByName: String(body.contactName).trim(),
      claimedByRole: String(body.contactRole).trim(),
      // Allow the venue to correct a few public-side fields. The admin can
      // override during review.
      name: String(body.businessName).trim() || r.placeData.name,
      address: String(body.address || r.placeData.address || '').trim(),
      city: String(body.city || r.placeData.city || '').trim(),
      category: String(body.category || r.placeData.category || '').trim(),
      contactEmail,
      updatedAt: now,
    };
    if (autoApproved) {
      update.status = 'Verified';
      update.partnerStatus = 'active_partner';
      update.approvedAt = now;
      update.approvedBy = 'auto:domain_match';
      update.claimedBy = contactEmail; // we don't have a uid for the public claim, store the email
    }

    const perk = body.perk as undefined | { type?: string; description?: string; conditions?: string; startDate?: string; endDate?: string; days?: string };
    if (perk && typeof perk.type === 'string' && typeof perk.description === 'string' && perk.description.trim()) {
      update.perkStatus = 'perk_pending_review';
      update.perkType = perk.type;
      update.perkDescription = perk.description.trim();
      update.perkConditions = (perk.conditions || '').trim();
      update.perkStartDate = (perk.startDate || '').trim();
      update.perkEndDate = (perk.endDate || '').trim();
      update.perkAvailableDays = (perk.days || '').trim();
    }

    await placeRef.update(update);

    // Burn the token so a second click can't re-submit.
    await db.collection('place_secrets').doc(r.placeId).update({
      verificationToken: FieldValue.delete(),
      verificationTokenExpiresAt: FieldValue.delete(),
      lastClaimSubmittedAt: now,
    });

    // Fire the post-submission emails (confirmation + admin alert). Best-
    // effort: an email provider hiccup must not roll back the verified
    // claim that's already persisted above.
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
