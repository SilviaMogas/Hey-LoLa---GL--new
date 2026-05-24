import { getAdminClient } from './_supabase.js';
import { sendBusinessLeadEmails } from '../src/lib/email/index.js';

// POST /api/notify-business-lead
//   Body: { leadId: string }
//
// Called by the client right after a B2B inquiry doc is written to
// business_leads (Auth.tsx → "Business" signup branch). The server re-reads
// the doc via Admin SDK so the client cannot forge recipients. Sends a
// confirmation to the contact email and an alert to ADMIN_INBOX.

const RECENT_WINDOW_MS = 10 * 60 * 1000;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { leadId } = (req.body || {}) as { leadId?: string };
  if (!leadId || typeof leadId !== 'string') {
    res.status(400).json({ success: false, error: 'leadId is required.' });
    return;
  }

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
  } catch (err) {
    console.error('notify-business-lead: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  const { data: row } = await db.from('business_leads').select('*').eq('id', leadId).maybeSingle();
  if (!row) {
    res.status(404).json({ success: false, error: 'Lead not found.' });
    return;
  }
  const data = row as Record<string, any>;

  // createdAt here is an ISO string (Auth.tsx writes `new Date().toISOString()`),
  // not a Firestore Timestamp.
  const createdMs = Date.parse(String(data.created_at || data.createdAt || '')) || 0;
  if (createdMs && Date.now() - createdMs > RECENT_WINDOW_MS) {
    res.status(409).json({ success: false, error: 'Lead is not recent.' });
    return;
  }

  if (typeof data.email !== 'string' || !data.email.includes('@')) {
    res.status(422).json({ success: false, error: 'Lead has no usable email.' });
    return;
  }

  const result = await sendBusinessLeadEmails({
    businessName: String(data.business_name || data.businessName || 'New business'),
    contactRole: typeof data.contact_role === 'string' ? data.contact_role : (typeof data.contactRole === 'string' ? data.contactRole : undefined),
    location: typeof data.location === 'string' ? data.location : undefined,
    reason: typeof data.reason === 'string' ? data.reason : undefined,
    email: String(data.email),
    leadId,
  });

  res.status(200).json({
    success: true,
    confirmationDelivered: result.confirmation.delivered,
    alertDelivered: result.alert.delivered,
  });
}
