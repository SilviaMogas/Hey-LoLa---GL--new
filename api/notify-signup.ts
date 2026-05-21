import { getAdminAuth, getAdminDb, appUrl } from './_admin.js';
import { sendSignupEmails } from '../src/lib/email/index.js';

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
  console.log('[notify-signup] step=start', { method: req.method });

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { userId } = (req.body || {}) as { userId?: string };
  if (!userId || typeof userId !== 'string') {
    console.warn('[notify-signup] exit=missing-userId');
    res.status(400).json({ success: false, error: 'userId is required.' });
    return;
  }
  console.log('[notify-signup] step=have-userId', { userId });

  let db: ReturnType<typeof getAdminDb>;
  let auth: ReturnType<typeof getAdminAuth>;
  try {
    db = getAdminDb();
    auth = getAdminAuth();
  } catch (err) {
    console.error('[notify-signup] exit=admin-init-failed', err);
    res.status(500).json({ success: false, error: 'Server is not configured.' });
    return;
  }
  console.log('[notify-signup] step=admin-init-ok');

  // Pull authoritative email + emailVerified from Firebase Auth.
  let userRecord;
  try {
    userRecord = await auth.getUser(userId);
  } catch (err: any) {
    console.warn('[notify-signup] exit=user-not-found', { userId, message: err?.message || err?.code });
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }
  console.log('[notify-signup] step=user-loaded', {
    email: userRecord.email,
    emailVerified: userRecord.emailVerified,
    providers: (userRecord.providerData || []).map((p) => p.providerId),
  });

  const email = userRecord.email || '';
  if (!email || !email.includes('@')) {
    console.warn('[notify-signup] exit=no-email');
    res.status(422).json({ success: false, error: 'User has no usable email.' });
    return;
  }

  // Pull profile-side fields from /users/{userId}.
  let profile: any = {};
  try {
    const snap = await db.collection('users').doc(userId).get();
    if (snap.exists) profile = snap.data() || {};
  } catch (err) {
    console.warn('[notify-signup] profile lookup failed', err);
  }
  console.log('[notify-signup] step=profile-loaded', {
    hasProfile: !!profile,
    createdAt: profile.createdAt,
    firstName: profile.firstName,
  });

  // Replay protection: only fire when the user was JUST created. Uses the
  // profile's createdAt (ISO string written by Auth.tsx + provisionGoogleUser).
  const createdMs = Date.parse(String(profile.createdAt || '')) || 0;
  if (createdMs && Date.now() - createdMs > RECENT_WINDOW_MS) {
    const ageMin = Math.round((Date.now() - createdMs) / 60000);
    console.warn('[notify-signup] exit=not-recent', { ageMin, windowMin: RECENT_WINDOW_MS / 60000 });
    res.status(409).json({ success: false, error: 'Signup is not recent.', ageMin });
    return;
  }
  console.log('[notify-signup] step=recency-check-ok');

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

  console.log('[notify-signup] step=calling-sendSignupEmails', {
    signupMethod,
    to: email,
    hasVerifyUrl: !!verifyUrl,
  });

  let result;
  try {
    result = await sendSignupEmails({
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
  } catch (err: any) {
    console.error('[notify-signup] exit=sendSignupEmails-threw', {
      message: err?.message,
      stack: err?.stack,
    });
    res.status(500).json({ success: false, error: 'Email render/send threw.', detail: err?.message });
    return;
  }
  console.log('[notify-signup] step=sendSignupEmails-returned', {
    confirmationDelivered: result.confirmation.delivered,
    confirmationReason: result.confirmation.skippedReason,
    alertDelivered: result.alert.delivered,
    alertReason: result.alert.skippedReason,
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
