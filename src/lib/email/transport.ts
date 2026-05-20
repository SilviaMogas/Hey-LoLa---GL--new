import { Resend } from 'resend';

// Shared Resend wiring used by every sendXxxEmails helper in this folder.
// Templates live as React components in /emails/<flow>.tsx and are rendered
// to HTML + plain text by senders.tsx — this file owns the transport (auth,
// envelope, list-unsubscribe header) and nothing else.
//
// Env:
//   RESEND_API_KEY   required for actual delivery
//   EMAIL_FROM       optional; defaults to "Hey Lola <hey@heylola.co>"
//   EMAIL_REPLY_TO   optional; defaults to "hey@heylola.co"

export const DEFAULT_FROM = 'Hey Lola <hey@heylola.co>';
export const DEFAULT_REPLY_TO = 'hey@heylola.co';
export const ADMIN_INBOX = 'hey@heylola.co';

export interface SendResult {
  delivered: boolean;
  /** Reason for not delivering (missing API key, provider error, exception). */
  skippedReason?: string;
  providerMessageId?: string;
}

/**
 * Test-mode redirect. When EMAIL_TEST_MODE=true and the matching test inbox
 * is configured, every outgoing email is rerouted away from the real
 * recipient so designers/copywriters can review templates without spamming
 * users. The original recipient is preserved in the subject line so the
 * inbox makes it obvious which "real" address would have received it.
 *
 *   ADMIN_INBOX  → TEST_ADMIN_EMAIL  (admin alerts)
 *   anything else → TEST_USER_EMAIL  (autoresponders)
 *
 * If EMAIL_TEST_MODE is unset OR the target test address is unset, the
 * email goes to its real recipient. We deliberately require BOTH the
 * gate flag AND the address so a stray env var alone never reroutes.
 */
function maybeRedirect(originalTo: string): { to: string; redirected: boolean } {
  if (process.env.EMAIL_TEST_MODE !== 'true') {
    return { to: originalTo, redirected: false };
  }
  const target = originalTo === ADMIN_INBOX
    ? process.env.TEST_ADMIN_EMAIL?.trim()
    : process.env.TEST_USER_EMAIL?.trim();
  if (!target) return { to: originalTo, redirected: false };
  return { to: target, redirected: true };
}

/**
 * Single low-level send. No-ops gracefully when RESEND_API_KEY is missing so
 * local dev / preview deploys don't break flows. Provider errors are caught
 * and reported via `skippedReason` so callers can keep going.
 */
export async function sendOne(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { delivered: false, skippedReason: 'RESEND_API_KEY is not configured.' };

  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const replyTo = process.env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO;
  const resend = new Resend(apiKey);

  const { to: actualTo, redirected } = maybeRedirect(to);
  const actualSubject = redirected ? `[TEST → ${to}] ${subject}` : subject;

  try {
    const r = await resend.emails.send({
      from,
      to: actualTo,
      subject: actualSubject,
      html,
      text,
      replyTo,
      headers: {
        // Gmail / Outlook trust senders that expose a List-Unsubscribe header.
        'List-Unsubscribe': `<mailto:${replyTo}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
    if ((r as any)?.error) {
      const e = (r as any).error;
      return { delivered: false, skippedReason: `Provider error: ${e.message || e.name || 'unknown'}` };
    }
    return { delivered: true, providerMessageId: (r as any)?.data?.id };
  } catch (err: any) {
    return { delivered: false, skippedReason: `Provider error: ${err?.message || 'unknown'}` };
  }
}
