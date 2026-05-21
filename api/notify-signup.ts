import { getAdminAuth, getAdminDb, appUrl } from './_admin.js';
import { sendSignupEmails } from '../src/lib/email/index.js';

// POST /api/notify-signup
//   Body: { userId: string }
//
// Called by the client right after a new account is created via Auth.tsx —
// both the email/password flow and the Google OAuth flow. Also re-triggered
// when the user clicks "Resend link" on /verify-email.
//
// CONTRACT: Always attempt to deliver via Resend. No replay window, no
// Firebase fallback, no clever skipping. The Firebase default verification
// email lands in spam and is unacceptable, so this endpoint owns the entire
// signup-email lifecycle.

export default async function handler(req: any, res: any) {
  console.log('[notify-signup] step=start', { method: req.method });

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // Accept fallback fields from the body so the endpoint can send via
  // Resend even if Firebase Admin is misconfigured. The client (Auth.tsx)
  // already has these from the signup form — the only reason we previously
  // re-fetched from Firebase Auth was to avoid trusting client input. For
  // a brand-new signup the client IS the source of truth.
  const body = (req.body || {}) as {
    userId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    userType?: string;
    referredBy?: string;
    signupMethod?: 'email' | 'google';
  };
  const { userId } = body;
  if (!userId || typeof userId !== 'string') {
    console.warn('[notify-signup] exit=missing-userId');
    res.status(400).json({ success: false, error: 'userId is required.' });
    return;
  }
  console.log('[notify-signup] step=have-userId', {
    userId,
    bodyEmail: body.email,
    bodyFirstName: body.firstName,
    bodySignupMethod: body.signupMethod,
  });

  // Firebase Admin is OPTIONAL from here on. If it fails (bad credentials,
  // wrong env vars, revoked key, etc.) we still attempt to send the Resend
  // welcome using the body data — because Firebase being broken cannot
  // block our transactional email.
  let db: ReturnType<typeof getAdminDb> | null = null;
  let auth: ReturnType<typeof getAdminAuth> | null = null;
  try {
    db = getAdminDb();
    auth = getAdminAuth();
    console.log('[notify-signup] step=admin-init-ok');
  } catch (err: any) {
    console.warn('[notify-signup] admin-init failed (continuing with body data):', err?.message || err);
  }

  // Try to pull canonical email from Firebase Auth, but fall back to body.
  let canonicalEmail: string | undefined;
  let canonicalEmailVerified = false;
  let providers: string[] = [];
  let canonicalDisplayName: string | undefined;
  if (auth) {
    try {
      const userRecord = await auth.getUser(userId);
      canonicalEmail = userRecord.email || undefined;
      canonicalEmailVerified = !!userRecord.emailVerified;
      providers = (userRecord.providerData || []).map((p) => p.providerId);
      canonicalDisplayName = userRecord.displayName || undefined;
      console.log('[notify-signup] step=user-loaded-from-auth', {
        email: canonicalEmail,
        emailVerified: canonicalEmailVerified,
        providers,
      });
    } catch (err: any) {
      console.warn('[notify-signup] auth.getUser failed (falling back to body):', err?.message || err?.code);
    }
  }

  const email = canonicalEmail || body.email;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.warn('[notify-signup] exit=no-email-anywhere', { canonicalEmail, bodyEmail: body.email });
    res.status(422).json({ success: false, error: 'No usable email — pass `email` in the body or fix Firebase Admin credentials.' });
    return;
  }

  // Profile lookup is best-effort.
  let profile: any = {};
  if (db) {
    try {
      const snap = await db.collection('users').doc(userId).get();
      if (snap.exists) profile = snap.data() || {};
      console.log('[notify-signup] step=profile-loaded', {
        firstName: profile.firstName,
        createdAt: profile.createdAt,
      });
    } catch (err) {
      console.warn('[notify-signup] profile lookup failed', err);
    }
  }

  // Decide signup method: prefer Firebase-detected providers, then body hint.
  const signupMethod: 'email' | 'google' =
    providers.includes('google.com') && !providers.includes('password')
      ? 'google'
      : (body.signupMethod === 'google' ? 'google' : 'email');

  // Generate the Firebase verification link if the user is unverified and
  // signed up with email/password. Failure here is NON-FATAL — the welcome
  // email still goes out, just without the verify CTA.
  let verifyUrl: string | undefined;
  let verifyUrlError: string | undefined;
  if (auth && signupMethod === 'email' && !canonicalEmailVerified) {
    try {
      verifyUrl = await auth.generateEmailVerificationLink(email, {
        url: `${appUrl(req)}/dashboard`,
        handleCodeInApp: false,
      });
      console.log('[notify-signup] step=verifyUrl-generated');
    } catch (err: any) {
      verifyUrlError = err?.message || err?.code || String(err);
      console.error('[notify-signup] generateEmailVerificationLink failed (sending welcome without link):', verifyUrlError);
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
      firstName: String(profile.firstName || body.firstName || canonicalDisplayName?.split(' ')[0] || ''),
      lastName: profile.lastName || body.lastName,
      email,
      username: profile.username || body.username,
      userType: profile.userType || body.userType,
      signupMethod,
      emailVerified: canonicalEmailVerified,
      referredBy: profile.referredBy || body.referredBy,
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
