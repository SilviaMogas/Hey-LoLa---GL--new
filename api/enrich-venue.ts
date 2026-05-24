// POST /api/enrich-venue
// Authorization: Bearer <Supabase access token>
// Body: { placeId: string }

import { isAdminEmail } from '../src/lib/admin.js';
import { getAdminClient } from './_supabase.js';

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
const IG_RE = /instagram\.com\/([A-Za-z0-9_.]+)/gi;
const CONTACT_HREF_RE = /href=["']([^"']*(?:contact|contacto|reach-us|get-in-touch|about)[^"']*)['"]/gi;

const EMAIL_PRIORITY = ['partnership', 'hello', 'contact', 'info', 'events', 'marketing', 'press', 'reservations'];
const EXCLUDE_EXT = /\.(png|jpg|gif|svg|webp|pdf|js|css|woff|ttf|ico|mp4)$/i;
const IG_SKIP = new Set(['p', 'explore', 'reel', 'stories', 'tv', 'accounts', 'sharer', 'share', 'login', 'about', 'legal', 'privacy', 'help']);

function normalizeUrl(raw: string): string {
  const s = raw.trim();
  return s.startsWith('http') ? s : `https://${s}`;
}

function rankEmail(email: string): number {
  const local = email.split('@')[0].toLowerCase();
  const idx = EMAIL_PRIORITY.findIndex(p => local.startsWith(p));
  return idx >= 0 ? idx : EMAIL_PRIORITY.length;
}

function pickBestEmail(emails: string[]): string | undefined {
  const valid = emails.filter(e => !EXCLUDE_EXT.test(e));
  return valid.sort((a, b) => rankEmail(a) - rankEmail(b))[0];
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'HeyLolaBot/1.0 (+https://heylola.co) venue-enrichment',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(9000),
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('html') && !ct.includes('text')) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function stripScriptsAndStyles(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const authHeader = (req.headers?.authorization as string) || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    res.status(401).json({ success: false, error: 'No auth token provided.' });
    return;
  }

  let db: ReturnType<typeof getAdminClient>;
  try {
    db = getAdminClient();
  } catch {
    res.status(500).json({ success: false, error: 'Supabase not configured.' });
    return;
  }

  let callerEmail: string;
  try {
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) throw error || new Error('No user');
    callerEmail = user.email || '';
    if (!isAdminEmail(callerEmail)) {
      res.status(403).json({ success: false, error: 'Admin access required.' });
      return;
    }
  } catch {
    res.status(401).json({ success: false, error: 'Invalid auth token.' });
    return;
  }

  const { placeId } = (req.body || {}) as { placeId?: string };
  if (!placeId || typeof placeId !== 'string') {
    res.status(400).json({ success: false, error: 'placeId is required.' });
    return;
  }

  const { data: placeRow } = await db.from('places').select('*').eq('id', placeId).maybeSingle();
  if (!placeRow) {
    res.status(404).json({ success: false, error: 'Place not found.' });
    return;
  }
  const place: Record<string, any> = { id: placeId, ...(placeRow as Record<string, any>) };

  if (!place.website) {
    res.status(400).json({ success: false, error: 'Place has no website URL.' });
    return;
  }

  const baseUrl = normalizeUrl(place.website).replace(/\/$/, '');

  const homeHtml = await fetchPage(baseUrl);

  let contactPageUrl: string | undefined;
  let contactHtml: string | null = null;

  if (homeHtml) {
    const stripped = stripScriptsAndStyles(homeHtml);
    for (const m of stripped.matchAll(CONTACT_HREF_RE)) {
      let href = m[1];
      if (href.startsWith('//')) href = 'https:' + href;
      else if (href.startsWith('/')) href = baseUrl + href;
      if (!href.startsWith('http')) continue;
      if (href === baseUrl || href === baseUrl + '/') continue;
      contactPageUrl = href;
      contactHtml = await fetchPage(href);
      if (contactHtml) break;
    }
    if (!contactHtml) {
      for (const path of ['/contact', '/contact-us', '/contacto', '/reach-us']) {
        const url = baseUrl + path;
        const html = await fetchPage(url);
        if (html) {
          contactPageUrl = url;
          contactHtml = html;
          break;
        }
      }
    }
  }

  const combined = [homeHtml, contactHtml].filter(Boolean).join('\n');
  const text = stripScriptsAndStyles(combined);

  const allEmails = [...new Set(text.match(EMAIL_RE) || [])];
  const phones = [...new Set(text.match(PHONE_RE) || [])];
  const igRaw = [...text.matchAll(IG_RE)];
  const igHandles = [...new Set(igRaw.map(m => m[1].replace(/\/$/, '')))]
    .filter(h => !IG_SKIP.has(h.toLowerCase()));

  const primaryEmail = pickBestEmail(allEmails);
  const secondaryEmails = allEmails.filter(e => e !== primaryEmail && !EXCLUDE_EXT.test(e));
  const instagram = igHandles[0] ? `@${igHandles[0]}` : undefined;
  const phone = phones[0];

  const hasData = primaryEmail || instagram || phone;
  const enrichmentStatus: string = !homeHtml
    ? 'failed'
    : hasData
      ? (primaryEmail ? 'enriched' : 'partial')
      : 'needs_manual_review';

  const enriched: Record<string, any> = {
    enrichment_status: enrichmentStatus,
    enrichment_source: 'website_scrape',
    enrichment_last_checked_at: new Date().toISOString(),
    outreach_ready: !!primaryEmail,
  };
  if (primaryEmail) enriched.primary_email = primaryEmail;
  if (secondaryEmails.length) enriched.secondary_emails = secondaryEmails;
  if (contactPageUrl) enriched.contact_page_url = contactPageUrl;
  if (instagram) enriched.instagram = instagram;
  if (phone) enriched.phone = phone;

  const diff: Array<{ field: string; label: string; current: string; suggested: string }> = [];
  if (primaryEmail && place.contact_email && place.contact_email !== primaryEmail) {
    diff.push({ field: 'contactEmail', label: 'Contact Email', current: place.contact_email, suggested: primaryEmail });
  }
  if (instagram && place.instagram && place.instagram !== instagram) {
    diff.push({ field: 'instagram', label: 'Instagram', current: place.instagram, suggested: instagram });
  }
  if (phone && place.phone && place.phone !== phone) {
    diff.push({ field: 'phone', label: 'Phone', current: place.phone, suggested: phone });
  }

  const patch: Record<string, any> = { ...enriched, updated_at: new Date().toISOString() };
  if (primaryEmail && !place.contact_email) patch.contact_email = primaryEmail;
  if (instagram && !place.instagram) patch.instagram = instagram;
  if (phone && !place.phone) patch.phone = phone;

  await db.from('places').update(patch).eq('id', placeId);

  res.status(200).json({ success: true, enriched, diff, status: enrichmentStatus });
}
