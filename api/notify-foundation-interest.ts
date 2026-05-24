import { getAdminClient, appUrl } from './_supabase.js';
import { sendFoundationInterestEmails } from '../src/lib/email/index.js';

// Public endpoint called by the client immediately after a foundation_interest
// document is created from a rescue passport. We re-read the document via the
// Admin SDK (bypassing rules) so the server is the source of truth for the
// email target — the client cannot forge a recipient by passing arbitrary
// fields in the request body.
//
// POST /api/notify-foundation-interest
//   Body: { interestId: string }
const RECENT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { interestId } = (req.body || {}) as { interestId?: string };
  if (!interestId || typeof interestId !== 'string') {
    res.status(400).json({ success: false, error: 'interestId is required.' });
    return;
  }

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
  } catch (err) {
    console.error('notify-foundation-interest: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  const { data: row } = await db.from('foundation_interests').select('*').eq('id', interestId).maybeSingle();
  if (!row) {
    res.status(404).json({ success: false, error: 'Interest not found.' });
    return;
  }
  const data = row as Record<string, any>;

  const createdAtMs = Date.parse(String(data.created_at || '')) || 0;
  if (createdAtMs && Date.now() - createdAtMs > RECENT_WINDOW_MS) {
    res.status(409).json({ success: false, error: 'Interest is not recent.' });
    return;
  }

  const contactEmail = data.contact?.email;
  if (typeof contactEmail !== 'string' || !contactEmail.includes('@')) {
    res.status(422).json({ success: false, error: 'Interest has no usable email.' });
    return;
  }

  // Look up the dog passport for the name + partner name (best-effort).
  let dogName = 'a rescue dog';
  let partnerName: string | undefined;
  let dogSlug = String(data.dogSlug || '');
  if (data.dog_id) {
    const { data: dogRow } = await db.from('foundation_dogs').select('*').eq('id', String(data.dog_id)).maybeSingle();
    if (dogRow) {
      const dog = dogRow as Record<string, any>;
      dogName = String(dog.name || dogName);
      partnerName = typeof dog.partner_name === 'string' ? dog.partner_name : undefined;
      dogSlug = String(dog.passport?.slug || dogSlug);
    }
  }

  const passportUrl = dogSlug ? `${appUrl(req)}/foundation/dogs/${dogSlug}` : appUrl(req);

  const result = await sendFoundationInterestEmails({
    dogName,
    dogSlug,
    partnerName,
    contactName: typeof data.contact?.name === 'string' ? data.contact.name : undefined,
    contactEmail,
    contactPhone: typeof data.contact?.phone === 'string' ? data.contact.phone : undefined,
    message: typeof data.message === 'string' ? data.message : undefined,
    interestId,
    passportUrl,
  });

  res.status(200).json({ success: true, ...result });
}
