/**
 * HeyKai Foundation — horses data layer.
 *
 * Mirrors src/data/foundationDogs.ts but for horses. All rows come from
 * Supabase `foundation_horses` (populated by /api/scrape-horses); there
 * is no committed seed data — the spec is explicit about that.
 */

export type HorseStatus = 'available' | 'unavailable' | 'hidden';
export type HorseCountry = 'US' | 'ES' | 'UK';
export type Sex = 'male' | 'female' | 'gelding' | 'mare' | 'stallion' | 'colt' | 'filly' | 'unknown';
export type VerificationStatus = 'partner_source' | 'manually_verified' | 'pending';

export interface HorsePassport {
  slug: string;
  publicUrl: string;
  visibility: 'public' | 'hidden';
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FoundationHorse {
  id: string;
  name: string;
  partnerName: string;
  partnerCountry: HorseCountry | null;
  sourceUrl?: string;
  imageUrl?: string;
  sex: Sex;
  ageLabel?: string;
  breed?: string;
  discipline?: string;
  heightHands?: number;
  location?: string;
  description: string;
  status: HorseStatus;
  passport: HorsePassport;
}

const COUNTRY_LABEL: Record<HorseCountry, string> = {
  US: 'United States',
  ES: 'Spain',
  UK: 'United Kingdom',
};

export function countryLabel(c: HorseCountry | null | undefined): string {
  if (!c) return '';
  return COUNTRY_LABEL[c] ?? c;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Build a stable passport object for a horse — same shape as dogs. */
export function buildHorsePassport(name: string, partnerKey: string, status: HorseStatus): HorsePassport {
  const slug = `${slugify(name)}-${partnerKey}`;
  const visibility: 'public' | 'hidden' = status === 'available' ? 'public' : 'hidden';
  const now = new Date().toISOString();
  return {
    slug,
    publicUrl: `/heykai/horses/${slug}`,
    visibility,
    verificationStatus: 'partner_source',
    createdAt: now,
    updatedAt: now,
  };
}

/** Convert a snake_case Supabase row into a camelCase FoundationHorse. */
export function rowToFoundationHorse(row: Record<string, unknown>): FoundationHorse {
  const passportRaw = row.passport as Partial<HorsePassport> | undefined;
  const slug = (row.slug as string | undefined) ?? passportRaw?.slug ?? '';
  const passport: HorsePassport = {
    slug,
    publicUrl: passportRaw?.publicUrl ?? `/heykai/horses/${slug}`,
    visibility: (passportRaw?.visibility as 'public' | 'hidden') ?? 'public',
    verificationStatus: (passportRaw?.verificationStatus as VerificationStatus) ?? 'partner_source',
    createdAt: passportRaw?.createdAt ?? (row.created_at as string) ?? '',
    updatedAt: passportRaw?.updatedAt ?? (row.updated_at as string) ?? '',
  };

  const country = row.partner_country as HorseCountry | null | undefined;
  const heightRaw = row.height_hands;
  const heightHands = typeof heightRaw === 'number'
    ? heightRaw
    : typeof heightRaw === 'string' && heightRaw !== ''
      ? Number(heightRaw)
      : undefined;

  return {
    id: row.id as string,
    name: ((row.name as string) ?? '').trim(),
    partnerName: (row.partner_name as string) ?? '',
    partnerCountry: country ?? null,
    sourceUrl: (row.source_url as string) || undefined,
    imageUrl: (row.photo as string) || undefined,
    sex: (row.sex as Sex) ?? 'unknown',
    ageLabel: (row.age as string) || undefined,
    breed: (row.breed as string) || undefined,
    discipline: (row.discipline as string) || undefined,
    heightHands: Number.isFinite(heightHands) ? heightHands : undefined,
    location: (row.location as string) || undefined,
    description: (row.bio as string) ?? '',
    status: (row.status as HorseStatus) ?? 'available',
    passport,
  };
}
