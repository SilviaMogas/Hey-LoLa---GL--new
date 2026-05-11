// POST /api/scrape-venue
// Body: { url: string }
// Returns: { email?, phone?, instagram?, error? }
//
// Fetches the venue website and extracts contact info via regex.
// No auth required — public endpoint, rate-limiting is handled by Vercel.

export const config = { runtime: 'edge' };

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
const IG_RE = /instagram\.com\/([A-Za-z0-9_.]+)/gi;

function normalizeUrl(raw: string): string {
  const s = raw.trim();
  return s.startsWith('http') ? s : `https://${s}`;
}

function pickBestEmail(emails: string[]): string | undefined {
  const exclude = /\.(png|jpg|gif|svg|webp|pdf|js|css)$/i;
  const prefer = /^(info|hello|contact|hola|reservations?|booking)/i;
  const valid = emails.filter(e => !exclude.test(e));
  return valid.find(e => prefer.test(e)) || valid[0];
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let url: string;
  try {
    const body = await req.json();
    url = normalizeUrl(body.url || '');
    new URL(url); // throws if invalid
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'HeyLolaBot/1.0 (+https://heylola.co)' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Site returned ${res.status}` }), { status: 200 });
    }

    const html = await res.text();
    const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');

    const emails = [...new Set(stripped.match(EMAIL_RE) || [])];
    const phones = [...new Set(stripped.match(PHONE_RE) || [])];
    const igMatches = [...stripped.matchAll(IG_RE)];
    const igHandles = [...new Set(igMatches.map(m => m[1].replace(/\/$/, '')))].filter(h => !['p', 'explore', 'reel', 'stories', 'tv'].includes(h));

    return new Response(JSON.stringify({
      email: pickBestEmail(emails),
      phone: phones[0],
      instagram: igHandles[0] ? `@${igHandles[0]}` : undefined,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    const msg = err?.name === 'TimeoutError' ? 'Request timed out' : 'Could not fetch site';
    return new Response(JSON.stringify({ error: msg }), { status: 200 });
  }
}
