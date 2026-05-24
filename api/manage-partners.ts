import { getAdminClient } from './_supabase.js';

/**
 * POST /api/manage-partners
 *
 * Admin endpoint for managing partner applications.
 * Actions: list, approve, reject, get
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
    applicationId?: string;
    status?: string;
    notes?: string;
    filters?: { status?: string; city?: string };
  };

  const { action = 'list', idToken } = body;

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
  } catch (err) {
    console.error('manage-partners: admin init failed', err);
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

  try {
    // ── LIST: get all partner applications with optional filters ──
    if (action === 'list') {
      let query = db.from('partner_applications').select('*').order('created_at', { ascending: false });
      if (body.filters?.status) {
        query = query.eq('status', body.filters.status);
      }
      if (body.filters?.city) {
        query = query.eq('city', body.filters.city);
      }
      const { data, error } = await query;
      if (error) throw error;
      res.status(200).json({ success: true, applications: data || [] });
      return;
    }

    // ── GET: single application details ──
    if (action === 'get') {
      if (!body.applicationId) {
        res.status(400).json({ success: false, error: 'applicationId is required.' });
        return;
      }
      const { data, error } = await db.from('partner_applications')
        .select('*').eq('id', body.applicationId).maybeSingle();
      if (error) throw error;
      if (!data) {
        res.status(404).json({ success: false, error: 'Application not found.' });
        return;
      }
      res.status(200).json({ success: true, application: data });
      return;
    }

    // ── APPROVE: mark application as approved, optionally create a place ──
    if (action === 'approve') {
      if (!body.applicationId) {
        res.status(400).json({ success: false, error: 'applicationId is required.' });
        return;
      }
      const { data: app, error: fetchErr } = await db.from('partner_applications')
        .select('*').eq('id', body.applicationId).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!app) {
        res.status(404).json({ success: false, error: 'Application not found.' });
        return;
      }

      // Update application status
      const { error: updateErr } = await db.from('partner_applications').update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email || user.id,
        updated_at: new Date().toISOString(),
      }).eq('id', body.applicationId);
      if (updateErr) throw updateErr;

      // Auto-create a place entry for local partners
      const appData = app as Record<string, any>;
      const partnerType = appData.partner_type || appData.partnerType;
      if (partnerType === 'local' || partnerType === 'both') {
        const { error: placeErr } = await db.from('places').insert({
          name: appData.business_name || appData.businessName || 'New Partner',
          category: Array.isArray(appData.categories) ? appData.categories[0] : (appData.category || 'other'),
          city: appData.city || '',
          address: appData.address || '',
          website: appData.website || '',
          instagram: appData.instagram || '',
          contact_email: appData.email || '',
          phone: appData.phone || '',
          partner_status: 'active',
          verification_status: 'verified',
          status: 'Verified partner',
          perk_type: appData.perk?.types?.[0] || null,
          perk_description: appData.perk?.description || null,
          perk_conditions: appData.perk?.conditions || null,
          perk_status: appData.offers_perk ? 'approved' : 'no_perks',
          approved_at: new Date().toISOString(),
          approved_by: user.email || user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (placeErr) console.warn('manage-partners: auto-create place failed', placeErr);
      }

      // Auto-ingest into CRM
      try {
        await db.from('crm_leads').insert({
          businessName: appData.business_name || appData.businessName || 'New partner',
          category: Array.isArray(appData.categories) ? appData.categories[0] : (appData.category || 'other'),
          tier: 2,
          city: appData.city || '',
          contact: {
            name: appData.contact_name || appData.contactName || '',
            role: appData.contact_role || appData.contactRole || '',
            email: appData.email || '',
            phone: appData.phone || '',
            ig: appData.instagram || '',
          },
          source: 'partner_approved',
          stage: 'signed',
          tags: ['partner', 'approved'],
          notes: [],
          linkedPartnerApplicationId: body.applicationId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastTouchAt: Date.now(),
          lastTouchBy: user.email || 'admin',
          createdBy: user.email || 'admin',
        });
      } catch (crmErr) {
        console.warn('manage-partners: CRM auto-ingest failed', crmErr);
      }

      res.status(200).json({ success: true, status: 'approved' });
      return;
    }

    // ── REJECT: mark application as rejected ──
    if (action === 'reject') {
      if (!body.applicationId) {
        res.status(400).json({ success: false, error: 'applicationId is required.' });
        return;
      }
      const { error: updateErr } = await db.from('partner_applications').update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email || user.id,
        updated_at: new Date().toISOString(),
      }).eq('id', body.applicationId);
      if (updateErr) throw updateErr;
      res.status(200).json({ success: true, status: 'rejected' });
      return;
    }

    res.status(400).json({ success: false, error: `Unknown action: ${action}` });
  } catch (err) {
    console.error('manage-partners: error', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}
