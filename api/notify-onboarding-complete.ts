import { getAdminDb, appUrl } from './_admin.js';
import { sendOnboardingCompleteEmail } from '../src/lib/email/index.js';

// POST /api/notify-onboarding-complete
//   Body: { userId: string; email: string; firstName: string; petName?: string }
//
// Called by the client right after the user completes the onboarding passport
// flow (handleSubmit in Onboarding.tsx). Sends a "passport ready" confirmation
// email via Resend.

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const body = (req.body || {}) as {
    userId?: string;
    email?: string;
    firstName?: string;
    petName?: string;
  };

  const { userId, email, firstName } = body;
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ success: false, error: 'userId is required.' });
    return;
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ success: false, error: 'email is required.' });
    return;
  }

  // Best-effort profile lookup to get firstName / petName if not provided.
  let profileFirstName = firstName || '';
  let petName = body.petName;
  try {
    const db = getAdminDb();
    if (!profileFirstName) {
      const snap = await db.collection('users').doc(userId).get();
      if (snap.exists) profileFirstName = snap.data()?.firstName || '';
    }
    if (!petName) {
      const petsSnap = await db.collection('pets').where('userId', '==', userId).limit(1).get();
      if (!petsSnap.empty) petName = petsSnap.docs[0].data()?.name;
    }
  } catch (err) {
    console.warn('[notify-onboarding-complete] admin lookup failed (continuing with body data):', err);
  }

  const base = appUrl(req);
  try {
    const result = await sendOnboardingCompleteEmail({
      firstName: profileFirstName,
      email,
      petName,
      dashboardUrl: `${base}/dashboard`,
      exploreUrl: `${base}/explore`,
      userId,
    });
    res.status(200).json({ success: true, delivered: result.delivered, skippedReason: result.skippedReason });
  } catch (err: any) {
    console.error('[notify-onboarding-complete] send failed:', err?.message || err);
    res.status(500).json({ success: false, error: 'Email send failed.', detail: err?.message });
  }
}
