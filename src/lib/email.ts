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

/* ──────────────────────────────────────────────────────────────────────────
 * Transactional notifications (Partner applications, Foundation interests)
 *
 * Each flow sends TWO emails: a confirmation to the submitter (trust signal)
 * and a heads-up to the team inbox so we can act quickly. Both no-op
 * gracefully when RESEND_API_KEY is missing.
 * ────────────────────────────────────────────────────────────────────────── */

const ADMIN_INBOX = 'hey@heylola.co';

interface SendResult {
  delivered: boolean;
  skippedReason?: string;
}

async function sendOne(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { delivered: false, skippedReason: 'RESEND_API_KEY is not configured.' };
  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const replyTo = process.env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO;
  try {
    const r = await resend.emails.send({
      from, to, subject, html, text, replyTo,
      headers: {
        'List-Unsubscribe': `<mailto:${replyTo}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
    if ((r as any)?.error) {
      return { delivered: false, skippedReason: `Provider error: ${(r as any).error.message || 'unknown'}` };
    }
    return { delivered: true };
  } catch (err: any) {
    return { delivered: false, skippedReason: `Provider error: ${err?.message || 'unknown'}` };
  }
}

export interface PartnerApplicationEmailOpts {
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactRole?: string;
  city?: string;
  applicationId: string;
}

export async function sendPartnerApplicationEmails(opts: PartnerApplicationEmailOpts): Promise<{ confirmation: SendResult; alert: SendResult }> {
  const confirmation = await sendOne(
    opts.contactEmail,
    'Welcome to the Hey Lola Partner Network',
    renderPartnerConfirmationHtml(opts),
    renderPartnerConfirmationText(opts),
  );
  const alert = await sendOne(
    ADMIN_INBOX,
    `New partner application — ${opts.businessName}`,
    renderPartnerAdminHtml(opts),
    renderPartnerAdminText(opts),
  );
  return { confirmation, alert };
}

function renderPartnerConfirmationText(o: PartnerApplicationEmailOpts): string {
  return [
    `Hi ${o.contactName},`,
    '',
    `Thank you for applying to join the Hey Lola Partner Network as ${o.businessName}.`,
    '',
    'Our team will review your application within 1–2 business days. Once verified,',
    "your venue will be featured on Hey Lola's curated city guide and your perk",
    'will be available to our members.',
    '',
    'In the meantime, you can reach us anytime at hey@heylola.co.',
    '',
    'Welcome aboard,',
    'The Hey Lola Team',
  ].join('\n');
}

function renderPartnerConfirmationHtml(o: PartnerApplicationEmailOpts): string {
  const safeName = escapeHtml(o.contactName);
  const safeBiz = escapeHtml(o.businessName);
  return `
  <div style="font-family: -apple-system, system-ui, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 32px 16px; line-height: 1.55;">
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 24px;">Welcome to the Hey Lola Partner Network</h1>
    <p>Hi <strong>${safeName}</strong>,</p>
    <p>Thank you for applying to join the Hey Lola Partner Network as <strong>${safeBiz}</strong>.</p>
    <p>Our team will review your application within <strong>1&ndash;2 business days</strong>. Once verified, your venue will be featured on Hey Lola's curated city guide and your perk will be available to our members.</p>
    <p>In the meantime, reach us anytime at <a href="mailto:hey@heylola.co" style="color:#1a1a1a;">hey@heylola.co</a>.</p>
    <p style="margin-top: 32px;">Welcome aboard,<br/>The Hey Lola Team</p>
  </div>`;
}

function renderPartnerAdminText(o: PartnerApplicationEmailOpts): string {
  return [
    'New partner application received.',
    '',
    `Business: ${o.businessName}`,
    `Contact: ${o.contactName}${o.contactRole ? ` (${o.contactRole})` : ''}`,
    `Email: ${o.contactEmail}`,
    o.city ? `City: ${o.city}` : '',
    `Application ID: ${o.applicationId}`,
    '',
    'Open the Admin -> Partner Apps tab to review.',
  ].filter(Boolean).join('\n');
}

function renderPartnerAdminHtml(o: PartnerApplicationEmailOpts): string {
  return `
  <div style="font-family: -apple-system, system-ui, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px 16px; line-height: 1.6;">
    <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 16px;">New partner application</h2>
    <table style="width:100%; font-size: 14px; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #777; width: 130px;">Business</td><td><strong>${escapeHtml(o.businessName)}</strong></td></tr>
      <tr><td style="padding: 6px 0; color: #777;">Contact</td><td>${escapeHtml(o.contactName)}${o.contactRole ? ` <span style="color:#777;">(${escapeHtml(o.contactRole)})</span>` : ''}</td></tr>
      <tr><td style="padding: 6px 0; color: #777;">Email</td><td><a href="mailto:${escapeHtml(o.contactEmail)}" style="color:#1a1a1a;">${escapeHtml(o.contactEmail)}</a></td></tr>
      ${o.city ? `<tr><td style="padding: 6px 0; color: #777;">City</td><td>${escapeHtml(o.city)}</td></tr>` : ''}
      <tr><td style="padding: 6px 0; color: #777;">App ID</td><td style="font-family: ui-monospace, monospace; font-size: 12px;">${escapeHtml(o.applicationId)}</td></tr>
    </table>
    <p style="margin-top: 20px; font-size: 13px; color: #555;">Open Admin &rarr; Partner Apps to review.</p>
  </div>`;
}

export interface FoundationInterestEmailOpts {
  dogName: string;
  dogSlug: string;
  partnerName?: string;
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
  message?: string;
  interestId: string;
  passportUrl: string;
}

export async function sendFoundationInterestEmails(opts: FoundationInterestEmailOpts): Promise<{ confirmation: SendResult; alert: SendResult }> {
  const confirmation = await sendOne(
    opts.contactEmail,
    `Hey Lola — Your interest in ${opts.dogName}`,
    renderInterestConfirmationHtml(opts),
    renderInterestConfirmationText(opts),
  );
  const alert = await sendOne(
    ADMIN_INBOX,
    `New interest — ${opts.dogName}${opts.partnerName ? ` (${opts.partnerName})` : ''}`,
    renderInterestAdminHtml(opts),
    renderInterestAdminText(opts),
  );
  return { confirmation, alert };
}

function renderInterestConfirmationText(o: FoundationInterestEmailOpts): string {
  const name = o.contactName || 'there';
  return [
    `Hi ${name},`,
    '',
    `Thank you for expressing interest in ${o.dogName} through the Hey Lola Foundation.`,
    '',
    'This is not an adoption application — it is a warm signal that connects you',
    `with ${o.partnerName || 'the rescue partner'} so they can guide you through their official process.`,
    '',
    'We have forwarded your details to the partner and to our team. Someone will',
    'be in touch within 1–2 business days.',
    '',
    'In the meantime, you can review the full passport here:',
    o.passportUrl,
    '',
    'With love,',
    'The Hey Lola Foundation',
  ].join('\n');
}

function renderInterestConfirmationHtml(o: FoundationInterestEmailOpts): string {
  const name = escapeHtml(o.contactName || 'there');
  const dog = escapeHtml(o.dogName);
  const partner = escapeHtml(o.partnerName || 'the rescue partner');
  const url = escapeHtml(o.passportUrl);
  return `
  <div style="font-family: -apple-system, system-ui, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 32px 16px; line-height: 1.55;">
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 24px;">Thank you for showing interest in ${dog}</h1>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for expressing interest in <strong>${dog}</strong> through the Hey Lola Foundation.</p>
    <p style="background:#FDF6EE; padding: 16px 18px; border-radius: 12px; font-size: 14px; color: #6B4421;">
      <strong>This is not an adoption application.</strong> It is a warm signal that connects you with ${partner} so they can guide you through their official process.
    </p>
    <p>We have forwarded your details to the partner and to our team. Someone will be in touch within <strong>1&ndash;2 business days</strong>.</p>
    <p style="margin: 28px 0;">
      <a href="${url}" style="display: inline-block; background: #C4622D; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: 700; font-size: 14px; letter-spacing: 0.02em;">View ${dog}'s passport &rarr;</a>
    </p>
    <p style="margin-top: 32px;">With love,<br/>The Hey Lola Foundation</p>
  </div>`;
}

function renderInterestAdminText(o: FoundationInterestEmailOpts): string {
  return [
    'New rescue passport interest.',
    '',
    `Dog: ${o.dogName}${o.partnerName ? ` (${o.partnerName})` : ''}`,
    `Passport: ${o.passportUrl}`,
    '',
    `From: ${o.contactName || '—'} <${o.contactEmail}>`,
    o.contactPhone ? `Phone: ${o.contactPhone}` : '',
    '',
    o.message ? `Message:\n${o.message}` : '',
    '',
    `Interest ID: ${o.interestId}`,
  ].filter(Boolean).join('\n');
}

function renderInterestAdminHtml(o: FoundationInterestEmailOpts): string {
  return `
  <div style="font-family: -apple-system, system-ui, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px 16px; line-height: 1.6;">
    <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 16px;">New rescue passport interest</h2>
    <table style="width:100%; font-size: 14px; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #777; width: 110px;">Dog</td><td><strong>${escapeHtml(o.dogName)}</strong>${o.partnerName ? ` <span style="color:#777;">(${escapeHtml(o.partnerName)})</span>` : ''}</td></tr>
      <tr><td style="padding: 6px 0; color: #777;">Passport</td><td><a href="${escapeHtml(o.passportUrl)}" style="color:#1a1a1a;">${escapeHtml(o.passportUrl)}</a></td></tr>
      <tr><td style="padding: 6px 0; color: #777;">From</td><td>${escapeHtml(o.contactName || '—')} &lt;<a href="mailto:${escapeHtml(o.contactEmail)}" style="color:#1a1a1a;">${escapeHtml(o.contactEmail)}</a>&gt;</td></tr>
      ${o.contactPhone ? `<tr><td style="padding: 6px 0; color: #777;">Phone</td><td>${escapeHtml(o.contactPhone)}</td></tr>` : ''}
    </table>
    ${o.message ? `<p style="background:#F7F5F2; padding: 14px 16px; border-radius: 10px; font-size: 14px; margin-top: 16px; font-style: italic; color: #444;">"${escapeHtml(o.message)}"</p>` : ''}
    <p style="margin-top: 20px; font-size: 13px; color: #555;">Open Admin &rarr; Foundation &rarr; Interest inbox to manage status.</p>
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

// ────────── COMMUNITY GROUP JOIN ──────────

export interface GroupJoinEmailOpts {
  /** Recipient address (the user who just joined). */
  to: string;
  /** First name (or full display name). Used in greeting. */
  name: string;
  /** Display name of the group, e.g. "Crew in Miami". */
  groupName: string;
  /** Direct URL to the group's room (Reddit-style page). */
  groupUrl: string;
}

/**
 * One-shot welcome email fired when a member joins a community group.
 * Resend-only — silently no-ops when RESEND_API_KEY is missing so
 * local dev / preview deploys don't break the join flow.
 */
export async function sendGroupJoinEmail(opts: GroupJoinEmailOpts): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { delivered: false, skippedReason: 'RESEND_API_KEY is not configured.' };
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const replyTo = process.env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO;
  const resend = new Resend(apiKey);
  const firstName = (opts.name || 'there').trim().split(/\s+/)[0];
  const safeGroup = esc(opts.groupName);
  const subject = `Welcome to ${opts.groupName}`;

  const text = [
    `Hi ${firstName},`,
    '',
    `You're in — welcome to ${opts.groupName}.`,
    '',
    `Drop in to introduce yourself, share a spot or just lurk: ${opts.groupUrl}`,
    '',
    'See you in the pack,',
    'Hey Lola',
    '— hey@heylola.co',
  ].join('\n');

  const html = `<!doctype html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#1a1a1a; max-width:560px; margin:0 auto; padding:24px;">
    <p>Hi ${esc(firstName)},</p>
    <p>You&rsquo;re in — welcome to <strong>${safeGroup}</strong>.</p>
    <p>Drop in to introduce yourself, share a spot or just lurk:</p>
    <p style="margin: 24px 0;">
      <a href="${esc(opts.groupUrl)}" style="display:inline-block; padding: 12px 22px; background:#0A0A0A; color:#fff; text-decoration:none; border-radius:999px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; font-size:11px;">Open ${safeGroup}</a>
    </p>
    <p style="margin-top: 32px;">See you in the pack,<br/>The Hey Lola Team<br/><a href="mailto:hey@heylola.co" style="color:#1a1a1a;">hey@heylola.co</a></p>
  </body></html>`;

  try {
    const r = await resend.emails.send({
      from,
      to: opts.to,
      subject,
      text,
      html,
      replyTo,
    });
    if (r.error) return { delivered: false, error: r.error.message ?? 'Resend error' };
    return { delivered: true };
  } catch (err) {
    return { delivered: false, error: (err as Error).message ?? 'Send failed' };
  }
}
