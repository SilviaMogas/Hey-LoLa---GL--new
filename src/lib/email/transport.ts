import { Resend } from 'resend';

// Shared Resend wiring used by every sendXxxEmails helper in this folder.
// Templates live as React components in /emails/<flow>.tsx and are rendered
// to HTML + plain text by senders.tsx — this file owns the transport (auth,
// envelope, list-unsubscribe header) and nothing else.
//
// Env:
//   RESEND_API_KEY      required for actual delivery
//   EMAIL_FROM          optional; defaults to "Hey Lola <hey@heylola.co>"
//   EMAIL_REPLY_TO      optional; defaults to "hey@heylola.co"
//   ADMIN_INBOX_EMAIL   optional; overrides the destination for admin alerts.
//                       Set this when you want admin notifications to go to
//                       a different inbox (staging, QA, personal review).

export const DEFAULT_FROM = 'Hey Lola <hey@heylola.co>';
export const DEFAULT_REPLY_TO = 'hey@heylola.co';
export const ADMIN_INBOX = process.env.ADMIN_INBOX_EMAIL?.trim() || 'hey@heylola.co';

export interface SendResult {
  delivered: boolean;
  /** Reason for not delivering (missing API key, provider error, exception). */
  skippedReason?: string;
  providerMessageId?: string;
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

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo,
      headers: {
        // Gmail / Outlook trust senders that expose a List-Unsubscribe header.
        'List-Unsubscribe': `<mailto:${replyTo}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
    if (error) {
      return { delivered: false, skippedReason: `Provider error: ${error.message || error.name || 'unknown'}` };
    }
    return { delivered: true, providerMessageId: data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    return { delivered: false, skippedReason: `Provider error: ${message}` };
  }
}
