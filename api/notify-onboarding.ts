import { getAdminClient } from './_supabase.js';
import { sendOnboardingSubmissionEmails } from '../src/lib/email/index.js';

// POST /api/notify-onboarding
//   Body: { submissionId: string }
//
// Called by the client right after a doc is written to onboarding_submissions
// from the public /start page (Pet Parent or Animal Lover form). The server
// re-reads the doc via the Admin SDK so the client cannot forge recipients
// or types. Sends a confirmation to the submitter and an alert to ADMIN_INBOX.

const RECENT_WINDOW_MS = 10 * 60 * 1000;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { submissionId } = (req.body || {}) as { submissionId?: string };
  if (!submissionId || typeof submissionId !== 'string') {
    res.status(400).json({ success: false, error: 'submissionId is required.' });
    return;
  }

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
  } catch (err) {
    console.error('notify-onboarding: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  const { data: row } = await db.from('onboarding_submissions').select('*').eq('id', submissionId).maybeSingle();
  if (!row) {
    res.status(404).json({ success: false, error: 'Submission not found.' });
    return;
  }
  const data = row as Record<string, any>;

  const createdAtMs = Date.parse(String(data.created_at || '')) || 0;
  if (createdAtMs && Date.now() - createdAtMs > RECENT_WINDOW_MS) {
    res.status(409).json({ success: false, error: 'Submission is not recent.' });
    return;
  }

  if (typeof data.email !== 'string' || !data.email.includes('@')) {
    res.status(422).json({ success: false, error: 'Submission has no usable email.' });
    return;
  }

  const t: 'pet_parent' | 'animal_lover' = data.type === 'animal_lover' ? 'animal_lover' : 'pet_parent';

  const result = await sendOnboardingSubmissionEmails({
    type: t,
    firstName: String(data.firstName || ''),
    lastName: typeof data.lastName === 'string' ? data.lastName : undefined,
    email: String(data.email),
    city: String(data.city || ''),
    petName: typeof data.petName === 'string' ? data.petName : undefined,
    petType: typeof data.petType === 'string' ? data.petType : undefined,
    instagram: typeof data.instagram === 'string' ? data.instagram : undefined,
    foundingClubInterest: typeof data.foundingClubInterest === 'string' ? data.foundingClubInterest : undefined,
    interests: Array.isArray(data.interests) ? data.interests : undefined,
    submissionId,
  });

  res.status(200).json({
    success: true,
    confirmationDelivered: result.confirmation.delivered,
    alertDelivered: result.alert.delivered,
  });
}
