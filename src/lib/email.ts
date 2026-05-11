import { Resend } from 'resend';

// Server-side email helper. Used by /api/invite-venue. Falls back gracefully
// when RESEND_API_KEY is missing — the caller still gets the rendered
// invitation link in the response so an operator can copy/paste it
// manually until the email provider is wired up on Vercel.
//
// Env:
//   RESEND_API_KEY     (required for actual delivery)
//   EMAIL_FROM         optional; defaults to "Hey Lola <hey@heylola.co>"
//   EMAIL_REPLY_TO     optional; defaults to "hey@heylola.co"
//
// Deliverability checklist (one-time setup, *not* in code):
//   1. Verify the sending domain (heylola.co) in Resend → Domains.
//   2. Publish the DNS records Resend prints: SPF (TXT), DKIM (CNAME×3),
//      DMARC (TXT, p=none to start, then move to quarantine).
//   3. Set EMAIL_FROM on a verified subdomain (e.g. notifications@heylola.co)
//      and keep replies routed to a real inbox via EMAIL_REPLY_TO.
//   4. Warm up the domain — start with low volume.
//   5. Avoid attachments, ALL CAPS subjects, or naked link copy.

const DEFAULT_FROM = 'Hey Lola <hey@heylola.co>';
const DEFAULT_REPLY_TO = 'hey@heylola.co';

export interface SendVenueInviteOptions {
  venueName: string;
  recipientEmail: string;
  claimUrl: string;
}

export interface SendVenueInviteResult {
  delivered: boolean;
  /** Reason for not delivering, if delivered === false. */
  skippedReason?: string;
  providerMessageId?: string;
}

export async function sendVenueInviteEmail(
  opts: SendVenueInviteOptions
): Promise<SendVenueInviteResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { delivered: false, skippedReason: 'RESEND_API_KEY is not configured.' };
  }
  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const replyTo = process.env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO;
  const subject = 'Your Hey Lola listing is ready to claim';
  const text = renderInviteText(opts);
  const html = renderInviteHtml(opts);
  try {
    const r = await resend.emails.send({
      from,
      to: opts.recipientEmail,
      subject,
      text,
      html,
      replyTo,
      headers: {
        // Gmail / Outlook trust senders that expose a List-Unsubscribe
        // header — required by Gmail bulk-sender policy from Feb 2024.
        'List-Unsubscribe': `<mailto:${replyTo}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
    // Resend's SDK reports per-call errors in the response body even when the
    // HTTP request itself succeeds; surface those here instead of swallowing
    // them as a successful delivery.
    if ((r as any)?.error) {
      const e = (r as any).error;
      return { delivered: false, skippedReason: `Provider error: ${e.message || e.name || 'unknown'}` };
    }
    return { delivered: true, providerMessageId: (r as any)?.data?.id };
  } catch (err: any) {
    return { delivered: false, skippedReason: `Provider error: ${err?.message || 'unknown'}` };
  }
}

function renderInviteText({ venueName, claimUrl }: SendVenueInviteOptions): string {
  return [
    `Hi ${venueName} team,`,
    '',
    'We are reaching out from Hey Lola, a trust-first platform for pet lovers',
    'discovering pet-friendly places, services, and experiences across different',
    'cities.',
    '',
    'Your venue has been listed on Hey Lola because it appears to be relevant',
    'for our community of pet owners and animal lovers.',
    '',
    'We would love to invite you to claim and verify your listing for free as',
    'part of our early Hey Lola Partner Network.',
    '',
    'By joining, you can:',
    '- Confirm that your business information is accurate.',
    '- Show pet owners that your venue is officially recognised by Hey Lola.',
    '- Build trust with potential visitors.',
    '- Increase visibility among a highly relevant pet-loving audience.',
    '- Highlight your pet-friendly policies, services, or conditions.',
    '- Be discovered by locals and travellers looking for trusted pet-friendly places.',
    '- Join an early partner ecosystem before we launch premium features.',
    '- Optionally offer perks, benefits, or special experiences to Hey Lola users.',
    '',
    'In the future, Hey Lola users will be able to discover verified venues',
    'and access selected benefits from partner locations, similar to a curated',
    'membership experience for pet-friendly places.',
    '',
    'For now, joining and verifying your listing is completely free.',
    '',
    'To claim your listing, please click the link below:',
    '',
    claimUrl,
    '',
    'Once submitted, our team will review the information before marking your',
    'venue as verified.',
    '',
    'Thank you,',
    'The Hey Lola Team',
    'hey@heylola.co',
  ].join('\n');
}

function renderInviteHtml({ venueName, claimUrl }: SendVenueInviteOptions): string {
  const safeName = escapeHtml(venueName);
  const safeUrl = escapeHtml(claimUrl);
  return `
  <div style="font-family: -apple-system, system-ui, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 32px 16px; line-height: 1.55;">
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 24px;">Join the Hey Lola Partner Network</h1>
    <p>Hi <strong>${safeName}</strong> team,</p>
    <p>We are reaching out from <strong>Hey Lola</strong>, a trust-first platform for pet lovers discovering pet-friendly places, services, and experiences across different cities.</p>
    <p>Your venue has been listed on Hey Lola because it appears to be relevant for our community of pet owners and animal lovers.</p>
    <p>We would love to invite you to <strong>claim and verify your listing for free</strong> as part of our early Hey Lola Partner Network.</p>
    <p>By joining, you can:</p>
    <ul style="padding-left: 20px;">
      <li>Confirm that your business information is accurate.</li>
      <li>Show pet owners that your venue is officially recognised by Hey Lola.</li>
      <li>Build trust with potential visitors.</li>
      <li>Increase visibility among a highly relevant pet-loving audience.</li>
      <li>Highlight your pet-friendly policies, services, or conditions.</li>
      <li>Be discovered by locals and travellers looking for trusted pet-friendly places.</li>
      <li>Join an early partner ecosystem before we launch premium features.</li>
      <li>Optionally offer perks, benefits, or special experiences to Hey Lola users.</li>
    </ul>
    <p>In the future, Hey Lola users will be able to discover verified venues and access selected benefits from partner locations, similar to a curated membership experience for pet-friendly places.</p>
    <p><strong>For now, joining and verifying your listing is completely free.</strong></p>
    <p style="margin: 28px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: #0A0A0A; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: 700; font-size: 14px; letter-spacing: 0.02em;">Claim your listing →</a>
    </p>
    <p style="font-size: 12px; color: #777;">Or paste this link in your browser:<br/><a href="${safeUrl}" style="color:#777; word-break: break-all;">${safeUrl}</a></p>
    <p>Once submitted, our team will review the information before marking your venue as verified.</p>
    <p style="margin-top: 32px;">Thank you,<br/>The Hey Lola Team<br/><a href="mailto:hey@heylola.co" style="color:#1a1a1a;">hey@heylola.co</a></p>
  </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
