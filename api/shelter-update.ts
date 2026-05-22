import { getAdminDb } from './_admin.js';
import { FieldValue } from 'firebase-admin/firestore';

// POST /api/shelter-update
//   Body: { shelterId: string, token: string, data: { name, city, blurb,
//           website, dogs: [...] } }
//
// Lets a shelter edit its OWN profile + dogs via a shareable link, without
// a Hey Lola account. The token is validated against shelter_secrets/{id}
// (admin-only collection) using the Admin SDK, which bypasses Firestore
// rules. Only safe, shelter-owned fields are written; order/region stay
// admin-controlled.

function sanitizeDog(d: any) {
  const out: Record<string, unknown> = {
    id: String(d?.id || '').trim() || `dog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: String(d?.name || '').trim(),
    breed: String(d?.breed || '').trim(),
    age: String(d?.age || '').trim(),
    bio: String(d?.bio || '').trim(),
  };
  if (d?.sex === 'Male' || d?.sex === 'Female') out.sex = d.sex;
  if (d?.photo && String(d.photo).trim()) out.photo = String(d.photo).trim();
  return out;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }
  const { shelterId, token, data } = (req.body || {}) as { shelterId?: string; token?: string; data?: any };
  if (!shelterId || !token || !data) {
    res.status(400).json({ success: false, error: 'shelterId, token and data are required.' });
    return;
  }

  let db;
  try {
    db = getAdminDb();
  } catch (err) {
    console.error('shelter-update: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  // Validate the token against the admin-only secret.
  const secretSnap = await db.collection('shelter_secrets').doc(shelterId).get();
  if (!secretSnap.exists || String(secretSnap.data()?.token || '') !== String(token)) {
    res.status(403).json({ success: false, error: 'Invalid or expired edit link.' });
    return;
  }

  const shelterSnap = await db.collection('shelters').doc(shelterId).get();
  if (!shelterSnap.exists) {
    res.status(404).json({ success: false, error: 'Shelter not found.' });
    return;
  }

  const dogs = Array.isArray(data.dogs) ? data.dogs.filter((d: any) => String(d?.name || '').trim()).map(sanitizeDog) : [];

  await db.collection('shelters').doc(shelterId).set({
    name: String(data.name || shelterSnap.data()?.name || '').trim(),
    city: String(data.city || shelterSnap.data()?.city || '').trim(),
    blurb: String(data.blurb || '').trim(),
    website: String(data.website || '').trim(),
    dogs,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  res.status(200).json({ success: true, dogs: dogs.length });
}
