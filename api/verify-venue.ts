import { timingSafeEqual } from 'crypto';
import { getAdminDb } from './_admin.js';

// Server-side endpoint for the click-to-verify email-link flow.
//
// POST /api/verify-venue { placeId, token }
//
// Validates the token against /place_secrets/{placeId} (admin-only,
// not exposed to the client) using a constant-time comparison. On match,
// promotes /places/{placeId}.status from 'Pending verification' to
// 'Verified', stamps verifiedAt + claimedBy, and marks the secret consumed.

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

  let db: ReturnType<typeof getAdminDb>;
  try {
    db = getAdminDb();
  } catch (err: any) {
    console.error('verify-venue: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured for verification yet.' });
    return;
  }

  try {
    const secretRef = db.collection('place_secrets').doc(placeId);
    const secretSnap = await secretRef.get();
    if (!secretSnap.exists) {
      res.status(404).json({ success: false, error: 'No verification request on file for this listing.' });
      return;
    }
    const secret = secretSnap.data() || {};
    const expected = String(secret.verificationToken || '');

    if (!expected || !tokensMatch(expected, token)) {
      res.status(403).json({ success: false, error: 'This verification link is invalid or has already been used.' });
      return;
    }

    if (secret.verificationStatus === 'verified') {
      res.status(200).json({
        success: true,
        alreadyVerified: true,
        placeName: secret.placeName || null,
        verifiedAt: secret.verifiedAt || null,
      });
      return;
    }

    const now = new Date().toISOString();
    const placeRef = db.collection('places').doc(placeId);
    const placeSnap = await placeRef.get();
    const placePatch: Record<string, unknown> = {
      status: 'Verified',
      claimApprovedAt: now,
      updatedAt: now,
    };
    if (secret.businessEmail) placePatch.contactEmail = secret.businessEmail;

    if (placeSnap.exists) {
      await placeRef.update(placePatch);
    } else {
      // First-time verify on a curated-only listing — promote it to a real
      // Firestore document using the admin-side seed fields.
      await placeRef.set({
        name: secret.placeName || placeId,
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

    await secretRef.update({
      verificationStatus: 'verified',
      verifiedAt: now,
    });

    res.status(200).json({
      success: true,
      alreadyVerified: false,
      placeName: secret.placeName || null,
      verifiedAt: now,
    });
  } catch (err: any) {
    console.error('verify-venue: handler error', err);
    res.status(500).json({ success: false, error: 'Something went wrong on our end.' });
  }
}
