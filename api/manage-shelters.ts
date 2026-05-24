import { getAdminClient, appUrl } from './_supabase.js';
import { isAdminEmail } from '../src/lib/admin.js';

/**
 * POST /api/manage-shelters
 *
 * Admin endpoint for managing Foundation shelters.
 * Actions: list, create, update, delete, invite, get
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
    shelterId?: string;
    data?: Record<string, any>;
  };

  const { action = 'list', idToken } = body;

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
  } catch (err) {
    console.error('manage-shelters: admin init failed', err);
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
    // ── LIST: get all shelters ──
    if (action === 'list') {
      const { data, error } = await db.from('shelters')
        .select('*').order('order', { ascending: true });
      if (error) throw error;
      const shelters = (data || []).map((s: any) => ({
        ...s,
        dogs: Array.isArray(s.dogs) ? s.dogs : [],
      }));
      res.status(200).json({ success: true, shelters });
      return;
    }

    // ── GET: single shelter details ──
    if (action === 'get') {
      if (!body.shelterId) {
        res.status(400).json({ success: false, error: 'shelterId is required.' });
        return;
      }
      const { data, error } = await db.from('shelters')
        .select('*').eq('id', body.shelterId).maybeSingle();
      if (error) throw error;
      if (!data) {
        res.status(404).json({ success: false, error: 'Shelter not found.' });
        return;
      }
      const shelter = { ...data, dogs: Array.isArray((data as any).dogs) ? (data as any).dogs : [] };
      res.status(200).json({ success: true, shelter });
      return;
    }

    // ── CREATE: add a new shelter ──
    if (action === 'create') {
      const d = body.data || {};
      const id = (d.id || crypto.randomUUID()).trim();
      if (!d.name?.trim()) {
        res.status(400).json({ success: false, error: 'Shelter name is required.' });
        return;
      }
      const { error } = await db.from('shelters').insert({
        id,
        name: d.name.trim(),
        city: d.city?.trim() || '',
        region: d.region || 'Americas',
        blurb: d.blurb?.trim() || '',
        website: d.website?.trim() || '',
        dogs: Array.isArray(d.dogs) ? d.dogs : [],
        logo: d.logo || null,
        order: Number(d.order ?? 99),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      res.status(201).json({ success: true, shelterId: id });
      return;
    }

    // ── UPDATE: edit shelter profile + dogs ──
    if (action === 'update') {
      if (!body.shelterId) {
        res.status(400).json({ success: false, error: 'shelterId is required.' });
        return;
      }
      const d = body.data || {};
      const update: Record<string, any> = { updated_at: new Date().toISOString() };
      if (d.name !== undefined) update.name = typeof d.name === 'string' ? d.name.trim() : d.name;
      if (d.city !== undefined) update.city = typeof d.city === 'string' ? d.city.trim() : d.city;
      if (d.region !== undefined) update.region = d.region;
      if (d.blurb !== undefined) update.blurb = typeof d.blurb === 'string' ? d.blurb.trim() : d.blurb;
      if (d.website !== undefined) update.website = typeof d.website === 'string' ? d.website.trim() : d.website;
      if (d.logo !== undefined) update.logo = d.logo;
      if (d.order !== undefined) update.order = Number(d.order);
      if (Array.isArray(d.dogs)) update.dogs = d.dogs;

      const { error } = await db.from('shelters')
        .update(update).eq('id', body.shelterId);
      if (error) throw error;
      res.status(200).json({ success: true });
      return;
    }

    // ── DELETE: remove a shelter ──
    if (action === 'delete') {
      if (!body.shelterId) {
        res.status(400).json({ success: false, error: 'shelterId is required.' });
        return;
      }
      // Clean up secrets and owners
      await db.from('shelter_secrets').delete().eq('id', body.shelterId);
      await db.from('shelter_owners').delete().eq('shelter_id', body.shelterId);
      const { error } = await db.from('shelters').delete().eq('id', body.shelterId);
      if (error) throw error;
      res.status(200).json({ success: true });
      return;
    }

    // ── INVITE: generate a shareable edit link for a shelter ──
    if (action === 'invite') {
      if (!body.shelterId) {
        res.status(400).json({ success: false, error: 'shelterId is required.' });
        return;
      }
      // Verify shelter exists
      const { data: shelter } = await db.from('shelters')
        .select('id, name').eq('id', body.shelterId).maybeSingle();
      if (!shelter) {
        res.status(404).json({ success: false, error: 'Shelter not found.' });
        return;
      }

      // Generate a secure token
      const token = crypto.randomUUID().replace(/-/g, '');
      const { error } = await db.from('shelter_secrets').upsert({
        id: body.shelterId,
        token,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      const baseUrl = appUrl(req);
      const editUrl = `${baseUrl}/shelter/${body.shelterId}?t=${token}`;

      res.status(200).json({ success: true, editUrl, token });
      return;
    }

    res.status(400).json({ success: false, error: `Unknown action: ${action}` });
  } catch (err) {
    console.error('manage-shelters: error', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}
