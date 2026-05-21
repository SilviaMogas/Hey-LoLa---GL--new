import { getAdminAuth, getAdminDb, appUrl } from './_admin';
import { sendSignupEmails } from '../src/lib/email';

// POST /api/notify-signup
//   Body: { userId: string }
//
// Called by the client right after a new account is created via Auth.tsx —
// both the email/password flow and the Google OAuth flow. The server pulls
// the canonical record from Firebase Auth (via Admin SDK) and the profile
// from /users/{userId}; it never trusts the request body for recipient data.
//
// Sends a branded welcome to the new user + an internal alert to ADMIN_INBOX.
// Best-effort: failures here never roll back the signup itself.

const RECENT_WINDOW_MS = 10 * 60 * 1000;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { userId } = (req.body || {}) as { userId?: string };
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ success: false, error: 'userId is required.' });
    return;
  }

  let db: ReturnType<typeof getAdminDb>;
  let auth: ReturnType<typeof getAdminAuth>;
  try {
    db = getAdminDb();
    auth = getAdminAuth();
  } catch (err) {
    console.error('notify-signup: admin init failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }

  // Pull authoritative email + emailVerified from Firebase Auth.
  let userRecord;
  try {
    userRecord = await auth.getUser(userId);
  } catch (err) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }
  const email = userRecord.email || '';
  if (!email || !email.includes('@')) {
    res.status(422).json({ success: false, error: 'User has no usable email.' });
    return;
  }

  // Pull profile-side fields from /users/{userId}.
  let profile: any = {};
  try {
    const snap = await db.collection('users').doc(userId).get();
    if (snap.exists) profile = snap.data() || {};
  } catch (err) {
    console.warn('notify-signup: profile lookup failed', err);
  }

  // Replay protection: only fire when the user was JUST created. Uses the
  // profile's createdAt (ISO string written by Auth.tsx + provisionGoogleUser).
  const createdMs = Date.parse(String(profile.createdAt || '')) || 0;
  if (createdMs && Date.now() - createdMs > RECENT_WINDOW_MS) {
    res.status(409).json({ success: false, error: 'Signup is not recent.' });
    return;
  }

  // Detect signup method from the provider data Firebase tracks on the
  // user record. `google.com` (sole or first provider) → OAuth; otherwise
  // we treat it as email/password (matches what Auth.tsx writes).
  const providers = (userRecord.providerData || []).map((p) => p.providerId);
  const signupMethod: 'email' | 'google' = providers.includes('google.com') && !providers.includes('password')
    ? 'google'
    : 'email';

  // For email/password signups, generate the Firebase verification link
  // server-side and embed it as the primary CTA in our branded welcome —
  // this lets us send ONE email instead of two. We do NOT fall back to
  // Firebase's default sendEmailVerification if generation fails: the
  // ugly Firebase email lands in spam and defeats the purpose. Instead
  // we surface the actual failure reason so Vercel function logs (and
  // the response body) make the problem diagnosable.
  let verifyUrl: string | undefined;
  let verifyUrlError: string | undefined;
  if (signupMethod === 'email' && !userRecord.emailVerified) {
    try {
      verifyUrl = await auth.generateEmailVerificationLink(email, {
        url: `${appUrl(req)}/dashboard`,
        handleCodeInApp: false,
      });
    } catch (err: any) {
      verifyUrlError = err?.message || err?.code || String(err);
      console.error('notify-signup: generateEmailVerificationLink failed', {
        userId,
        appUrl: appUrl(req),
        message: verifyUrlError,
      });
      // Continue without the verify CTA. The welcome email still goes out,
      // and the user can re-trigger verification via the Resend Link button
      // on /verify-email once the underlying config (Authorized Domains,
      // APP_URL env, etc.) is fixed.
    }
  }

  const result = await sendSignupEmails({
    firstName: String(profile.firstName || userRecord.displayName?.split(' ')[0] || ''),
    lastName: typeof profile.lastName === 'string' ? profile.lastName : undefined,
    email,
    username: typeof profile.username === 'string' ? profile.username : undefined,
    userType: typeof profile.userType === 'string' ? profile.userType : undefined,
    signupMethod,
    emailVerified: !!userRecord.emailVerified,
    referredBy: typeof profile.referredBy === 'string' ? profile.referredBy : undefined,
    dashboardUrl: `${appUrl(req)}/dashboard`,
    userId,
    verifyUrl,
  });

  if (!result.confirmation.delivered) {
    console.error('notify-signup: confirmation email failed to deliver', {
      userId,
      to: email,
      skippedReason: result.confirmation.skippedReason,
    });
  }
  if (!result.alert.delivered) {
    console.error('notify-signup: admin alert failed to deliver', {
      userId,
      skippedReason: result.alert.skippedReason,
    });
  }

  res.status(200).json({
    success: true,
    confirmationDelivered: result.confirmation.delivered,
    alertDelivered: result.alert.delivered,
    confirmationReason: result.confirmation.skippedReason,
    alertReason: result.alert.skippedReason,
    verifyUrlError,
  });
}
