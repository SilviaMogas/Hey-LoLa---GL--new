import { getAdminClient } from './_supabase.js';

// POST /api/shelter-update
//
// One endpoint, three actions:
//   action 'update': Edit shelter profile + dogs
//   action 'claim': Link a signed-up account to a shelter
//   action 'mine': Return the shelter the logged-in user owns

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

async function tokenValid(db: ReturnType<typeof getAdminClient>, shelterId: string, token: string): Promise<boolean> {
  const { data } = await db.from('shelter_secrets').select('token').eq('id', shelterId).maybeSingle();
  return !!data && String((data as any).token || '') === String(token);
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

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
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
      const { data: shelter } = await db.from('shelters').select('id').eq('id', shelterId).maybeSingle();
      if (!shelter) {
        res.status(404).json({ success: false, error: 'Shelter not found.' });
        return;
      }
      const { data: { user }, error } = await db.auth.getUser(idToken);
      if (error || !user) {
        res.status(401).json({ success: false, error: 'Invalid auth token.' });
        return;
      }
      await db.from('shelter_owners').upsert({
        id: user.id,
        shelter_id: shelterId,
        email: user.email || null,
        claimed_at: new Date().toISOString(),
      });
      res.status(200).json({ success: true, shelterId });
      return;
    }

    // ── MINE: which shelter does this logged-in user own? ──
    if (action === 'mine') {
      const { idToken } = body;
      if (!idToken) { res.status(400).json({ success: false, error: 'idToken is required.' }); return; }
      const { data: { user }, error } = await db.auth.getUser(idToken);
      if (error || !user) { res.status(401).json({ success: false, error: 'Invalid auth token.' }); return; }
      const { data: ownerRow } = await db.from('shelter_owners').select('shelter_id').eq('id', user.id).maybeSingle();
      if (!ownerRow) { res.status(200).json({ success: true, shelter: null }); return; }
      const shelterId = String((ownerRow as any).shelter_id || '');
      const { data: shelterRow } = await db.from('shelters').select('*').eq('id', shelterId).maybeSingle();
      if (!shelterRow) { res.status(200).json({ success: true, shelter: null }); return; }
      res.status(200).json({ success: true, shelter: { id: shelterId, ...(shelterRow as Record<string, any>) } });
      return;
    }

    // ── UPDATE (default): edit shelter profile + dogs ──
    const { shelterId, token, idToken, data } = body;
    if (!shelterId || !data) {
      res.status(400).json({ success: false, error: 'shelterId and data are required.' });
      return;
    }

    let authorized = false;
    if (token && (await tokenValid(db, shelterId, token))) authorized = true;
    if (!authorized && idToken) {
      const { data: { user }, error } = await db.auth.getUser(idToken);
      if (!error && user) {
        const { data: ownerRow } = await db.from('shelter_owners').select('shelter_id').eq('id', user.id).maybeSingle();
        if (ownerRow && String((ownerRow as any).shelter_id) === String(shelterId)) authorized = true;
      }
    }
    if (!authorized) {
      res.status(403).json({ success: false, error: 'Not authorised to edit this shelter.' });
      return;
    }

    const { data: shelterRow } = await db.from('shelters').select('*').eq('id', shelterId).maybeSingle();
    if (!shelterRow) {
      res.status(404).json({ success: false, error: 'Shelter not found.' });
      return;
    }
    const existing = shelterRow as Record<string, any>;

    const dogs = Array.isArray(data.dogs)
      ? data.dogs.filter((d: any) => String(d?.name || '').trim()).map(sanitizeDog)
      : [];

    await db.from('shelters').upsert({
      id: shelterId,
      name: String(data.name || existing.name || '').trim(),
      city: String(data.city || existing.city || '').trim(),
      blurb: String(data.blurb || '').trim(),
      website: String(data.website || '').trim(),
      ...(data.logo !== undefined ? { logo: String(data.logo || '').trim() } : {}),
      dogs,
      updated_at: new Date().toISOString(),
    });

    res.status(200).json({ success: true, dogs: dogs.length });
  } catch (err: any) {
    console.error('shelter-update failed', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error.' });
  }
}
