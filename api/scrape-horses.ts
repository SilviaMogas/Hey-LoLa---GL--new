// POST /api/scrape-horses
//
// Admin-only seeder for the foundation_horses table powering the
// HeyKai Foundation horse-adoption pipeline.
//
// Auth: Bearer <SCRAPER_SECRET> header, validated against
// process.env.SCRAPER_SECRET. Body: { source: 'all' | 'us' | 'es' | 'uk' }.
//
// For each enabled source we GET the listings page with a realistic
// User-Agent, extract horse cards via a small set of HTML-shape
// heuristics (no headless browser, no cheerio dep), and upsert into
// foundation_horses keyed by source_url so re-runs are idempotent.
//
// Per the spec: if a source's HTML is too dynamic to parse, we log a
// warning and continue — the endpoint never crashes mid-run.

import { timingSafeEqual } from 'node:crypto';
import { getAdminClient } from './_supabase.js';

/**
 * Constant-time comparison so an attacker can't infer the expected
 * SCRAPER_SECRET from response-time differences during brute force.
 * Falls back to a length-mismatched compare against a fixed buffer so
 * we always pay the same comparison cost regardless of the candidate.
 */
function safeTokenEqual(candidate: string, expected: string): boolean {
  const a = Buffer.from(candidate, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) {
    // Equalise the length before comparing so timingSafeEqual itself
    // can't throw on mismatched buffers and leak via the catch path.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

const USER_AGENT =
  'Mozilla/5.0 (compatible; HeyKaiBot/1.0; +https://heylola.co/heykai) HeyLolaFoundation';
const FETCH_TIMEOUT_MS = 12_000;

type Country = 'US' | 'ES' | 'UK';

interface ScrapedHorse {
  name: string;
  breed?: string;
  age?: string;
  sex?: string;
  height_hands?: number;
  discipline?: string;
  photo?: string;
  bio?: string;
  location?: string;
  source_url: string;
  partner_name: string;
  partner_country: Country;
}

interface SourceConfig {
  key: string;
  country: Country;
  partnerName: string;
  listUrl: string;
  parse: (html: string, listUrl: string) => ScrapedHorse[];
}

/* ── HTML helpers (regex-only, defensive) ─────────────────────────── */

function absoluteUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMatch(html: string, re: RegExp): string | undefined {
  const m = re.exec(html);
  return m ? m[1] : undefined;
}

function uniqueBy<T>(rows: T[], key: (r: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    const k = key(r);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(r);
    }
  }
  return out;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/* ── Generic listing extractor ────────────────────────────────────── */

/**
 * Many rescue sites render listings as a grid of <a> cards that link
 * to a per-animal page. This pulls the (href, alt-text-or-name) pairs
 * out of the listing HTML, filtered by a per-source URL fragment so
 * we don't pick up nav links.
 */
function extractCards(
  html: string,
  base: string,
  detailFragment: RegExp,
): Array<{ href: string; name: string; photo?: string }> {
  const anchorRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const imgInsideRe = /<img\b[^>]*(?:src|data-src)=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?/i;
  const out: Array<{ href: string; name: string; photo?: string }> = [];

  for (const m of html.matchAll(anchorRe)) {
    const href = m[1];
    if (!detailFragment.test(href)) continue;

    const inner = m[2];
    const imgMatch = imgInsideRe.exec(inner);
    const photo = imgMatch ? absoluteUrl(imgMatch[1], base) : undefined;
    const alt = imgMatch?.[2]?.trim();
    const text = stripTags(inner);
    const name = (alt || text || '').slice(0, 80);
    if (!name) continue;

    out.push({ href: absoluteUrl(href, base), name, photo });
  }
  return uniqueBy(out, (r) => r.href);
}

/* ── Per-source parsers ───────────────────────────────────────────── */

function parseHabitatForHorses(html: string, listUrl: string): ScrapedHorse[] {
  const cards = extractCards(html, listUrl, /\/horse-profile|\/adoptable-horses\//i);
  return cards.map((c) => ({
    name: c.name,
    photo: c.photo,
    source_url: c.href,
    partner_name: 'Habitat for Horses',
    partner_country: 'US' as Country,
  }));
}

function parseRightHorse(html: string, listUrl: string): ScrapedHorse[] {
  const cards = extractCards(html, listUrl, /\/horses?\//i);
  return cards.map((c) => ({
    name: c.name,
    photo: c.photo,
    source_url: c.href,
    partner_name: 'The Right Horse Initiative',
    partner_country: 'US' as Country,
  }));
}

function parsePetfinderHorses(html: string, listUrl: string): ScrapedHorse[] {
  // Petfinder is React-rendered; cards do still appear in the HTML
  // as <a href="/horse/Name-12345"> links. If empty, the caller logs
  // a warning and moves on.
  const cards = extractCards(html, listUrl, /\/horse\/[^"' ]+\d+/i);
  return cards.map((c) => ({
    name: c.name,
    photo: c.photo,
    source_url: c.href,
    partner_name: 'Petfinder',
    partner_country: 'US' as Country,
  }));
}

function parseAnaa(html: string, listUrl: string): ScrapedHorse[] {
  // ANAA (anaaweb.org) lists adoptions under /adopcion/. Filter to
  // entries that look like a horse (caballo / yegua / poni).
  const cards = extractCards(html, listUrl, /\/adopcion\//i).filter((c) =>
    /caballo|yegua|poni|equino/i.test(c.name),
  );
  return cards.map((c) => ({
    name: c.name,
    photo: c.photo,
    source_url: c.href,
    partner_name: 'ANAA',
    partner_country: 'ES' as Country,
  }));
}

function parseFundacionEquina(html: string, listUrl: string): ScrapedHorse[] {
  const cards = extractCards(html, listUrl, /\/(caballos|adopcion|apadrina)\//i);
  return cards.map((c) => ({
    name: c.name,
    photo: c.photo,
    source_url: c.href,
    partner_name: 'Fundación Caballista',
    partner_country: 'ES' as Country,
  }));
}

function parseSaveAHorseSpain(html: string, listUrl: string): ScrapedHorse[] {
  const cards = extractCards(html, listUrl, /\/(horses?|caballos?|adopt)\//i);
  return cards.map((c) => ({
    name: c.name,
    photo: c.photo,
    source_url: c.href,
    partner_name: 'Save a Horse Spain',
    partner_country: 'ES' as Country,
  }));
}

function parseWorldHorseWelfare(html: string, listUrl: string): ScrapedHorse[] {
  const cards = extractCards(html, listUrl, /\/rehome-a-horse\/|\/horse\//i);
  return cards.map((c) => ({
    name: c.name,
    photo: c.photo,
    source_url: c.href,
    partner_name: 'World Horse Welfare',
    partner_country: 'UK' as Country,
  }));
}

function parseBlueCross(html: string, listUrl: string): ScrapedHorse[] {
  const cards = extractCards(html, listUrl, /\/pet\/|\/rehome\//i).filter((c) =>
    /horse|pony|cob|gelding|mare/i.test(c.name),
  );
  return cards.map((c) => ({
    name: c.name,
    photo: c.photo,
    source_url: c.href,
    partner_name: 'Blue Cross',
    partner_country: 'UK' as Country,
  }));
}

function parseRedwings(html: string, listUrl: string): ScrapedHorse[] {
  const cards = extractCards(html, listUrl, /\/adopt-a-horse\/|\/horses?\//i);
  return cards.map((c) => ({
    name: c.name,
    photo: c.photo,
    source_url: c.href,
    partner_name: 'Redwings',
    partner_country: 'UK' as Country,
  }));
}

/* ── Source registry ──────────────────────────────────────────────── */

const SOURCES: SourceConfig[] = [
  // United States
  {
    key: 'habitat-for-horses',
    country: 'US',
    partnerName: 'Habitat for Horses',
    listUrl: 'https://www.habitatforhorses.org/adoptable-horses/',
    parse: parseHabitatForHorses,
  },
  {
    key: 'right-horse',
    country: 'US',
    partnerName: 'The Right Horse Initiative',
    listUrl: 'https://www.therighthorse.org/adopt',
    parse: parseRightHorse,
  },
  {
    key: 'petfinder',
    country: 'US',
    partnerName: 'Petfinder',
    listUrl: 'https://www.petfinder.com/search/horses-for-adoption/',
    parse: parsePetfinderHorses,
  },

  // Spain
  {
    key: 'anaa',
    country: 'ES',
    partnerName: 'ANAA',
    listUrl: 'https://www.anaaweb.org/adopcion/',
    parse: parseAnaa,
  },
  {
    key: 'fundacion-equina',
    country: 'ES',
    partnerName: 'Fundación Caballista',
    listUrl: 'https://www.fundacionequina.es/caballos/',
    parse: parseFundacionEquina,
  },
  {
    key: 'save-a-horse-spain',
    country: 'ES',
    partnerName: 'Save a Horse Spain',
    listUrl: 'https://saveahorse.es/horses/',
    parse: parseSaveAHorseSpain,
  },

  // United Kingdom
  {
    key: 'world-horse-welfare',
    country: 'UK',
    partnerName: 'World Horse Welfare',
    listUrl: 'https://www.worldhorsewelfare.org/rehome-a-horse',
    parse: parseWorldHorseWelfare,
  },
  {
    key: 'blue-cross',
    country: 'UK',
    partnerName: 'Blue Cross',
    listUrl: 'https://www.bluecross.org.uk/rehome/horse',
    parse: parseBlueCross,
  },
  {
    key: 'redwings',
    country: 'UK',
    partnerName: 'Redwings',
    listUrl: 'https://www.redwings.org.uk/adopt-a-horse',
    parse: parseRedwings,
  },
];

/* ── Detail-page enrichment (best effort) ─────────────────────────── */

/**
 * Fetch the detail page for a horse to fill in breed/age/discipline/bio.
 * Anything we fail to parse is left undefined — the listing already
 * gives us a usable card.
 *
 * SSRF guard: horse.source_url is extracted from third-party HTML, so
 * we only follow URLs whose hostname matches the trusted rescue listing
 * we just scraped. Anything else (internal infra, file://, redirected
 * shorteners) is rejected before fetch.
 */
async function enrich(horse: ScrapedHorse, trustedListUrl: string): Promise<ScrapedHorse> {
  let target: URL;
  try {
    target = new URL(horse.source_url);
    const trusted = new URL(trustedListUrl);
    if (target.protocol !== 'https:' && target.protocol !== 'http:') return horse;
    if (target.hostname !== trusted.hostname) return horse;
  } catch {
    return horse;
  }
  try {
    const res = await fetch(target.toString(), {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return horse;
    const html = await res.text();

    const breed = firstMatch(html, /breed[^<]{0,40}<[^>]+>\s*([A-Za-z][A-Za-z \-/]+)/i);
    const age =
      firstMatch(html, /age[^<]{0,40}<[^>]+>\s*([0-9]{1,2}\s*(?:years?|yrs?))/i) ??
      firstMatch(html, />\s*(\d{1,2}\s*(?:years?|yrs?)\s*old)\s*</i);
    const heightStr = firstMatch(
      html,
      /(\d{1,2}(?:\.\d)?)\s*(?:hands?|hh\b|\bh\b)/i,
    );
    const sex = firstMatch(
      html,
      /\b(gelding|mare|stallion|colt|filly|male|female)\b/i,
    );
    const discipline = firstMatch(
      html,
      /\b(dressage|western|leisure|hacking|jumping|driving|companion|retired|in[- ]hand)\b/i,
    );

    // Best-effort bio: first <p> tag of meaningful length.
    const pMatch = /<p[^>]*>([\s\S]{60,600}?)<\/p>/i.exec(html);
    const bio = pMatch ? stripTags(pMatch[1]) : undefined;

    // Open Graph image as a backup photo.
    const ogImg = firstMatch(
      html,
      /<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    );

    return {
      ...horse,
      breed: horse.breed ?? (breed ? stripTags(breed) : undefined),
      age: horse.age ?? (age ? stripTags(age) : undefined),
      sex: horse.sex ?? (sex ? sex.toLowerCase() : undefined),
      height_hands: horse.height_hands ?? (heightStr ? Number(heightStr) : undefined),
      discipline: horse.discipline ?? (discipline ? discipline.toLowerCase() : undefined),
      bio: horse.bio ?? bio,
      photo: horse.photo ?? (ogImg ? absoluteUrl(ogImg, horse.source_url) : undefined),
    };
  } catch {
    return horse;
  }
}

/* ── Source runner ────────────────────────────────────────────────── */

interface SourceResult {
  source: string;
  partner: string;
  country: Country;
  url: string;
  ok: boolean;
  found: number;
  inserted: number;
  skipped: number;
  error?: string;
}

async function runSource(cfg: SourceConfig, enableEnrich: boolean): Promise<SourceResult> {
  const result: SourceResult = {
    source: cfg.key,
    partner: cfg.partnerName,
    country: cfg.country,
    url: cfg.listUrl,
    ok: false,
    found: 0,
    inserted: 0,
    skipped: 0,
  };

  let html = '';
  try {
    const res = await fetch(cfg.listUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.5',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      result.error = `HTTP ${res.status}`;
      console.warn(`[scrape-horses] ${cfg.key}: ${result.error}`);
      return result;
    }
    html = await res.text();
  } catch (err) {
    result.error = (err as Error).message || 'fetch failed';
    console.warn(`[scrape-horses] ${cfg.key}: fetch failed —`, result.error);
    return result;
  }

  let horses: ScrapedHorse[] = [];
  try {
    horses = cfg.parse(html, cfg.listUrl);
  } catch (err) {
    result.error = `parse: ${(err as Error).message}`;
    console.warn(`[scrape-horses] ${cfg.key}: parse failed —`, result.error);
    return result;
  }

  result.found = horses.length;
  result.ok = true;

  if (horses.length === 0) {
    console.warn(`[scrape-horses] ${cfg.key}: 0 horses parsed — markup may have changed`);
    return result;
  }

  // Enrich up to N horses to keep the function under Vercel's 10s default.
  if (enableEnrich) {
    const MAX_ENRICH = 8;
    const enriched: ScrapedHorse[] = [];
    for (let i = 0; i < horses.length; i++) {
      enriched.push(i < MAX_ENRICH ? await enrich(horses[i], cfg.listUrl) : horses[i]);
    }
    horses = enriched;
  }

  // Upsert to Supabase, one source_url at a time so a bad row can't
  // poison the whole batch. ON CONFLICT (source_url) DO NOTHING.
  const db = getAdminClient();
  for (const h of horses) {
    try {
      const slug = `${slugify(h.name)}-${cfg.key}`;
      const now = new Date().toISOString();
      const passport = {
        slug,
        publicUrl: `/heykai/horses/${slug}`,
        visibility: 'public' as const,
        verificationStatus: 'partner_source' as const,
        createdAt: now,
        updatedAt: now,
      };

      const { error } = await db
        .from('foundation_horses')
        .upsert(
          {
            name: h.name,
            slug,
            breed: h.breed ?? '',
            discipline: h.discipline ?? null,
            age: h.age ?? '',
            sex: h.sex ?? null,
            height_hands: h.height_hands ?? null,
            photo: h.photo ?? null,
            bio: h.bio ?? '',
            location: h.location ?? null,
            source_url: h.source_url,
            partner_name: h.partner_name,
            partner_country: h.partner_country,
            passport,
            visibility: 'public',
            status: 'available',
            updated_at: now,
          },
          { onConflict: 'source_url', ignoreDuplicates: false },
        );
      if (error) {
        result.skipped++;
        console.warn(`[scrape-horses] ${cfg.key}: upsert failed for ${h.source_url}:`, error.message);
      } else {
        result.inserted++;
      }
    } catch (err) {
      result.skipped++;
      console.warn(`[scrape-horses] ${cfg.key}: upsert threw for ${h.source_url}:`, (err as Error).message);
    }
  }

  return result;
}

/* ── Handler ──────────────────────────────────────────────────────── */

interface ScrapeBody {
  source?: 'all' | 'us' | 'es' | 'uk';
  enrich?: boolean;
}

interface VercelLikeReq {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: ScrapeBody;
}
interface VercelLikeRes {
  status: (code: number) => VercelLikeRes;
  json: (body: unknown) => void;
}

export default async function handler(req: VercelLikeReq, res: VercelLikeRes) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // Bearer auth — Vercel may pass headers lower or mixed case.
  const authHeader = (req.headers['authorization'] ?? req.headers['Authorization']) as string | undefined;
  const expected = process.env.SCRAPER_SECRET;
  if (!expected) {
    res.status(500).json({ success: false, error: 'SCRAPER_SECRET is not configured.' });
    return;
  }
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim() ?? '';
  if (!token || !safeTokenEqual(token, expected)) {
    res.status(401).json({ success: false, error: 'Unauthorized.' });
    return;
  }

  const body = (req.body || {}) as ScrapeBody;
  const which = (body.source || 'all').toLowerCase();
  const enableEnrich = body.enrich !== false;

  const wanted = SOURCES.filter((s) => {
    if (which === 'all') return true;
    if (which === 'us') return s.country === 'US';
    if (which === 'es') return s.country === 'ES';
    if (which === 'uk') return s.country === 'UK';
    return false;
  });

  if (wanted.length === 0) {
    res.status(400).json({ success: false, error: `Unknown source: ${which}` });
    return;
  }

  try {
    getAdminClient(); // fail fast if env vars are missing
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
    return;
  }

  const results: SourceResult[] = [];
  for (const cfg of wanted) {
    results.push(await runSource(cfg, enableEnrich));
  }

  const totalFound = results.reduce((s, r) => s + r.found, 0);
  const totalInserted = results.reduce((s, r) => s + r.inserted, 0);

  res.status(200).json({
    success: true,
    source: which,
    totals: { found: totalFound, inserted: totalInserted },
    results,
  });
}
