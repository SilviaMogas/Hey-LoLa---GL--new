import { timingSafeEqual } from 'crypto';
import { getAdminClient } from './_supabase.js';

// POST /api/verify-venue { placeId, token }

function tokensMatch(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { placeId, token } = (req.body || {}) as { placeId?: string; token?: string };
  if (!placeId || !token || typeof placeId !== 'string' || typeof token !== 'string') {
    res.status(400).json({ success: false, error: 'placeId and token are required.' });
    return;
  }

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
  } catch (err: any) {
    console.error('verify-venue: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured for verification yet.' });
    return;
  }

  try {
    const { data: secretRow } = await db.from('place_secrets').select('*').eq('id', placeId).maybeSingle();
    if (!secretRow) {
      res.status(404).json({ success: false, error: 'No verification request on file for this listing.' });
      return;
    }
    const secret = secretRow as Record<string, any>;
    const expected = String(secret.verification_token || '');

    if (!expected || !tokensMatch(expected, token)) {
      res.status(403).json({ success: false, error: 'This verification link is invalid or has already been used.' });
      return;
    }

    if (secret.verification_status === 'verified') {
      res.status(200).json({
        success: true,
        alreadyVerified: true,
        placeName: secret.place_name || null,
        verifiedAt: secret.verified_at || null,
      });
      return;
    }

    const now = new Date().toISOString();
    const { data: placeRow } = await db.from('places').select('id').eq('id', placeId).maybeSingle();
    const placePatch: Record<string, unknown> = {
      status: 'Verified',
      claim_approved_at: now,
      updated_at: now,
    };
    if (secret.business_email) placePatch.contact_email = secret.business_email;

    if (placeRow) {
      await db.from('places').update(placePatch).eq('id', placeId);
    } else {
      await db.from('places').insert({
        id: placeId,
        name: secret.place_name || placeId,
        city: secret.city || 'Miami',
        category: secret.category || 'Other',
        description: secret.description || '',
        utility: secret.utility || secret.description || '',
        address: secret.address || null,
        website: secret.website || null,
        lat: secret.lat || 0,
        lng: secret.lng || 0,
        ...placePatch,
      });
    }

    await db.from('place_secrets').update({
      verification_status: 'verified',
      verified_at: now,
    }).eq('id', placeId);

    res.status(200).json({
      success: true,
      alreadyVerified: false,
      placeName: secret.place_name || null,
      verifiedAt: now,
    });
  } catch (err: any) {
    console.error('verify-venue: handler error', err);
    res.status(500).json({ success: false, error: 'Something went wrong on our end.' });
  }
}
