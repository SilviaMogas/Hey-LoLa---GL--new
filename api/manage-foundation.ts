import { getAdminClient } from './_supabase.js';
import { isAdminEmail } from '../src/lib/admin.js';

/**
 * POST /api/manage-foundation
 *
 * Admin endpoint for managing Foundation dogs and interest submissions.
 * Actions: list-dogs, add-dog, update-dog, remove-dog,
 *          list-interests, update-interest
 *
 * All actions require a valid Supabase auth token (admin user).
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const body = (req.body || {}) as {
    action?: string;
    idToken?: string;
    dogId?: string;
    interestId?: string;
    data?: Record<string, any>;
    filters?: { status?: string; shelter_id?: string };
  };

  const { action = 'list-dogs', idToken } = body;

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
  } catch (err) {
    console.error('manage-foundation: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  // Verify the caller is an authenticated user
  if (!idToken) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }
  const { data: { user }, error: authErr } = await db.auth.getUser(idToken);
  if (authErr || !user) {
    res.status(401).json({ success: false, error: 'Invalid auth token.' });
    return;
  }
  if (!isAdminEmail(user.email)) {
    res.status(403).json({ success: false, error: 'Admin only.' });
    return;
  }

  try {
    // ── LIST-DOGS: get all foundation dogs with optional filters ──
    if (action === 'list-dogs') {
      let query = db.from('foundation_dogs').select('*').order('created_at', { ascending: false });
      if (body.filters?.status) {
        query = query.eq('status', body.filters.status);
      }
      if (body.filters?.shelter_id) {
        query = query.eq('shelter_id', body.filters.shelter_id);
      }
      const { data, error } = await query;
      if (error) throw error;
      res.status(200).json({ success: true, dogs: data || [] });
      return;
    }

    // ── ADD-DOG: create a new foundation dog profile ──
    if (action === 'add-dog') {
      const d = body.data || {};
      if (!d.name?.trim()) {
        res.status(400).json({ success: false, error: 'Dog name is required.' });
        return;
      }
      const { data: row, error } = await db.from('foundation_dogs').insert({
        name: d.name.trim(),
        breed: d.breed?.trim() || '',
        age: d.age?.trim() || '',
        sex: d.sex || null,
        photo: d.photo || null,
        bio: d.bio?.trim() || '',
        shelter_id: d.shelter_id || null,
        status: d.status || 'available',
        ens_name: d.ens_name?.trim() || null,
        passport: d.passport || {},
        data: d.extra || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select('id').single();
      if (error) throw error;
      res.status(201).json({ success: true, dogId: row?.id });
      return;
    }

    // ── UPDATE-DOG: edit a foundation dog profile ──
    if (action === 'update-dog') {
      if (!body.dogId) {
        res.status(400).json({ success: false, error: 'dogId is required.' });
        return;
      }
      const d = body.data || {};
      const update: Record<string, any> = { updated_at: new Date().toISOString() };
      if (d.name !== undefined) update.name = typeof d.name === 'string' ? d.name.trim() : d.name;
      if (d.breed !== undefined) update.breed = typeof d.breed === 'string' ? d.breed.trim() : d.breed;
      if (d.age !== undefined) update.age = typeof d.age === 'string' ? d.age.trim() : d.age;
      if (d.sex !== undefined) update.sex = d.sex;
      if (d.photo !== undefined) update.photo = d.photo;
      if (d.bio !== undefined) update.bio = typeof d.bio === 'string' ? d.bio.trim() : d.bio;
      if (d.shelter_id !== undefined) update.shelter_id = d.shelter_id;
      if (d.status !== undefined) update.status = d.status;
      if (d.ens_name !== undefined) update.ens_name = typeof d.ens_name === 'string' ? d.ens_name.trim() : d.ens_name;
      if (d.passport !== undefined) update.passport = d.passport;

      const { error } = await db.from('foundation_dogs')
        .update(update).eq('id', body.dogId);
      if (error) throw error;
      res.status(200).json({ success: true });
      return;
    }

    // ── REMOVE-DOG: delete a foundation dog profile ──
    if (action === 'remove-dog') {
      if (!body.dogId) {
        res.status(400).json({ success: false, error: 'dogId is required.' });
        return;
      }
      const { error } = await db.from('foundation_dogs')
        .delete().eq('id', body.dogId);
      if (error) throw error;
      res.status(200).json({ success: true });
      return;
    }

    // ── LIST-INTERESTS: get adoption/foster interest submissions ──
    if (action === 'list-interests') {
      let query = db.from('foundation_interests').select('*').order('created_at', { ascending: false });
      if (body.filters?.status) {
        query = query.eq('status', body.filters.status);
      }
      const { data, error } = await query;
      if (error) throw error;
      res.status(200).json({ success: true, interests: data || [] });
      return;
    }

    // ── UPDATE-INTEREST: change status of an interest submission ──
    if (action === 'update-interest') {
      if (!body.interestId) {
        res.status(400).json({ success: false, error: 'interestId is required.' });
        return;
      }
      const d = body.data || {};
      const { error } = await db.from('foundation_interests').update({
        status: d.status || 'reviewed',
        updated_at: new Date().toISOString(),
      }).eq('id', body.interestId);
      if (error) throw error;
      res.status(200).json({ success: true });
      return;
    }

    res.status(400).json({ success: false, error: `Unknown action: ${action}` });
  } catch (err) {
    console.error('manage-foundation: error', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}
