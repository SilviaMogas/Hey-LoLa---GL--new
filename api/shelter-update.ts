import { getAdminDb, getAdminAuth } from './_admin.js';
import { FieldValue } from 'firebase-admin/firestore';

// POST /api/shelter-update
//
// One endpoint, three actions (all server-side via Admin SDK, so no Firestore
// rule changes are needed — the client never writes shelters directly):
//
//   action 'update' (default):
//     Body: { shelterId, data, token? , idToken? }
//     Edits a shelter's own profile + dogs. Authorised by EITHER a valid
//     shareable token (shelter_secrets) OR a logged-in owner (idToken whose
//     uid is linked to this shelter in shelter_owners).
//
//   action 'claim':
//     Body: { shelterId, token, idToken }
//     Links a freshly-signed-up account (idToken) to a shelter, gated by the
//     shelter's invite token. Writes shelter_owners/{uid} = { shelterId }.
//
//   action 'mine':
//     Body: { idToken }
//     Returns the shelter the logged-in user owns (for the shelter dashboard).
//
// order/region stay admin-controlled and are never written here.

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

async function tokenValid(db: any, shelterId: string, token: string): Promise<boolean> {
  const secretSnap = await db.collection('shelter_secrets').doc(shelterId).get();
  return secretSnap.exists && String(secretSnap.data()?.token || '') === String(token);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const body = (req.body || {}) as {
    action?: string; shelterId?: string; token?: string; idToken?: string; data?: any;
  };
  const action = String(body.action || 'update');

  let db; let auth;
  try {
    db = getAdminDb();
    auth = getAdminAuth();
  } catch (err) {
    console.error('shelter-update: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  try {
    // ── CLAIM: link a signed-up account to a shelter (invite-token gated) ──
    if (action === 'claim') {
      const { shelterId, token, idToken } = body;
      if (!shelterId || !token || !idToken) {
        res.status(400).json({ success: false, error: 'shelterId, token and idToken are required.' });
        return;
      }
      if (!(await tokenValid(db, shelterId, token))) {
        res.status(403).json({ success: false, error: 'Invalid or expired invite link.' });
        return;
      }
      const shelterSnap = await db.collection('shelters').doc(shelterId).get();
      if (!shelterSnap.exists) {
        res.status(404).json({ success: false, error: 'Shelter not found.' });
        return;
      }
      const decoded = await auth.verifyIdToken(idToken);
      await db.collection('shelter_owners').doc(decoded.uid).set({
        shelterId,
        email: decoded.email || null,
        claimedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      res.status(200).json({ success: true, shelterId });
      return;
    }

    // ── MINE: which shelter does this logged-in user own? ──
    if (action === 'mine') {
      const { idToken } = body;
      if (!idToken) { res.status(400).json({ success: false, error: 'idToken is required.' }); return; }
      const decoded = await auth.verifyIdToken(idToken);
      const ownerSnap = await db.collection('shelter_owners').doc(decoded.uid).get();
      if (!ownerSnap.exists) { res.status(200).json({ success: true, shelter: null }); return; }
      const shelterId = String(ownerSnap.data()?.shelterId || '');
      const shelterSnap = await db.collection('shelters').doc(shelterId).get();
      if (!shelterSnap.exists) { res.status(200).json({ success: true, shelter: null }); return; }
      res.status(200).json({ success: true, shelter: { id: shelterId, ...shelterSnap.data() } });
      return;
    }

    // ── UPDATE (default): edit shelter profile + dogs ──
    const { shelterId, token, idToken, data } = body;
    if (!shelterId || !data) {
      res.status(400).json({ success: false, error: 'shelterId and data are required.' });
      return;
    }

    // Authorise: a valid share token, OR a logged-in owner of this shelter.
    let authorized = false;
    if (token && (await tokenValid(db, shelterId, token))) authorized = true;
    if (!authorized && idToken) {
      const decoded = await auth.verifyIdToken(idToken);
      const ownerSnap = await db.collection('shelter_owners').doc(decoded.uid).get();
      if (ownerSnap.exists && String(ownerSnap.data()?.shelterId) === String(shelterId)) authorized = true;
    }
    if (!authorized) {
      res.status(403).json({ success: false, error: 'Not authorised to edit this shelter.' });
      return;
    }

    const shelterSnap = await db.collection('shelters').doc(shelterId).get();
    if (!shelterSnap.exists) {
      res.status(404).json({ success: false, error: 'Shelter not found.' });
      return;
    }

    const dogs = Array.isArray(data.dogs)
      ? data.dogs.filter((d: any) => String(d?.name || '').trim()).map(sanitizeDog)
      : [];

    await db.collection('shelters').doc(shelterId).set({
      name: String(data.name || shelterSnap.data()?.name || '').trim(),
      city: String(data.city || shelterSnap.data()?.city || '').trim(),
      blurb: String(data.blurb || '').trim(),
      website: String(data.website || '').trim(),
      ...(data.logo !== undefined ? { logo: String(data.logo || '').trim() } : {}),
      dogs,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    res.status(200).json({ success: true, dogs: dogs.length });
  } catch (err: any) {
    console.error('shelter-update failed', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error.' });
  }
}
