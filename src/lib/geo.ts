/**
 * Geo detection for the Explore page. We pick a default city out of the
 * three Hey Lola supports today (Barcelona / Miami / New York City), and
 * fall back to `null` when the visitor is anywhere else — the UI then
 * shows a non-personalised "Start exploring" headline.
 *
 * Sources, in priority order:
 *   1. The user's saved `homeCity` (when signed in).
 *   2. IP geolocation via ipapi.co (free, anonymous, cached for 24h).
 *   3. The browser timezone, as a last-resort heuristic.
 */
export type SupportedCity = 'miami' | 'barcelona' | 'nyc';

const CACHE_KEY = 'hl_detected_city_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CachedDetection {
  city: SupportedCity | null;
  cachedAt: number;
}

const HOME_CITY_MAP: Record<string, SupportedCity> = {
  miami: 'miami',
  'new york': 'nyc',
  'new york city': 'nyc',
  nyc: 'nyc',
  manhattan: 'nyc',
  brooklyn: 'nyc',
  barcelona: 'barcelona',
};

const cityFromString = (raw: string | undefined | null): SupportedCity | null => {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  return HOME_CITY_MAP[key] ?? null;
};

const cityFromTimezone = (tz: string | undefined): SupportedCity | null => {
  if (!tz) return null;
  if (tz === 'Europe/Madrid' || tz === 'Europe/Andorra' || tz === 'Europe/Paris') return 'barcelona';
  if (tz === 'America/New_York' || tz === 'America/Toronto') return 'nyc';
  return null;
};

const readCache = (): CachedDetection | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedDetection;
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (city: SupportedCity | null) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ city, cachedAt: Date.now() } satisfies CachedDetection));
  } catch {
    // localStorage may be disabled / full — non-fatal
  }
};

export async function detectCity(homeCity?: string | null): Promise<SupportedCity | null> {
  const fromHome = cityFromString(homeCity);
  if (fromHome) return fromHome;

  const cached = readCache();
  if (cached) return cached.city;

  // Try IP-based geolocation (no API key, anonymous).
  try {
    const res = await fetch('https://ipapi.co/json/', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json() as { city?: string; region?: string; timezone?: string };
      const fromCity = cityFromString(data.city) ?? cityFromString(data.region);
      const fromTz = cityFromTimezone(data.timezone);
      const detected = fromCity ?? fromTz;
      writeCache(detected);
      return detected;
    }
  } catch {
    // Network blocked or rate-limited — fall through to timezone heuristic.
  }

  const browserTz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined;
  const detected = cityFromTimezone(browserTz);
  writeCache(detected);
  return detected;
}
