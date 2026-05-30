/**
 * Single source of truth for every URL the app exposes. Every route is
 * declared once here; App.tsx wires the components, Navbar/Footer link
 * to the path constants, and the sitemap is generated from PUBLIC_PATHS.
 *
 * To add a new page:
 *   1. Add a constant under `paths` (and a builder if it has params).
 *   2. Render it from a <Route> in App.tsx.
 *   3. If it should appear in /sitemap.xml, push it into PUBLIC_PATHS below.
 *   4. If it requires auth, wrap the element in <ProtectedRoute>.
 */

export const paths = {
  /* ── Public marketing & content ────────────────────────────────── */
  home: '/',
  about: '/about',
  blog: '/blog',
  blogArticle: '/blog/:slug',
  faq: '/faq',
  privacy: '/privacy',
  terms: '/terms',
  start: '/start',
  creators: '/creators',
  partners: '/partners',
  partnerOnboarding: '/partners/onboard',
  perks: '/perks',
  /** Founder Deals dashboard — stealth / admin-only until promoted live. */
  founderDeals: '/perks/deals',
  foundation: '/foundation',
  foundationShelter: '/foundation/shelter/:shelterId',
  foundationDogs: '/foundation/dogs',
  foundationDogPassport: '/foundation/dogs/:slug',
  heyKaiFoundation: '/heykai',
  heyKaiHorses: '/heykai/horses',
  heyKaiHorsePassport: '/heykai/horses/:slug',
  club: '/club',
  clubWelcome: '/club/welcome',
  brandBook: '/brand-book',
  brandBookCharacter: '/brand-book/:name',
  concierges: '/concierges',
  media: '/media',
  whatsOn: '/whats-on',

  /* ── Public app surfaces (no auth) ─────────────────────────────── */
  explore: '/explore',
  community: '/community',
  communityGroup: '/community/:groupId',
  petProfile: '/pet/:petId',
  shelterPortal: '/shelter/:shelterId',
  venue: '/venue/:slug',
  verifyVenue: '/verify/:placeId/:token',
  claimListing: '/claim-listing/:token',

  /* ── Auth flow ─────────────────────────────────────────────────── */
  login: '/login',
  signup: '/signup',
  verifyEmail: '/verify-email',
  onboarding: '/onboarding',

  /* ── Authenticated app ─────────────────────────────────────────── */
  dashboard: '/dashboard',
  passport: '/passport',
  saved: '/saved',
  claim: '/claim',
  admin: '/admin',
} as const;

/** Builders for routes that take params. Always go through these — don't
 *  hand-craft path strings, the type system will not catch typos. */
export const buildPath = {
  blogArticle: (slug: string) => `/blog/${encodeURIComponent(slug)}`,
  venue: (slug: string) => `/venue/${encodeURIComponent(slug)}`,
  foundationDogPassport: (slug: string) => `/foundation/dogs/${encodeURIComponent(slug)}`,
  heyKaiHorsePassport: (slug: string) => `/heykai/horses/${encodeURIComponent(slug)}`,
  foundationShelter: (shelterId: string) => `/foundation/shelter/${encodeURIComponent(shelterId)}`,
  verifyVenue: (placeId: string, token: string) =>
    `/verify/${encodeURIComponent(placeId)}/${encodeURIComponent(token)}`,
  claimListing: (token: string) => `/claim-listing/${encodeURIComponent(token)}`,
  claim: (partnerSlug: string) => `/claim?partner=${encodeURIComponent(partnerSlug)}`,
  brandBookCharacter: (name: string) => `/brand-book/${encodeURIComponent(name.toLowerCase())}`,
  communityGroup: (groupId: string) => `/community/${encodeURIComponent(groupId)}`,
  petProfile: (petId: string) => `/pet/${encodeURIComponent(petId)}`,
  shelterPortal: (shelterId: string, token: string) => `/shelter/${encodeURIComponent(shelterId)}?t=${encodeURIComponent(token)}`,
};

/** Pages we actively want indexed by search engines. Used to generate
 *  /sitemap.xml at build time. Do NOT include auth-gated paths or paths
 *  with required URL params (venue/:slug is added dynamically by SSR
 *  builds — out of scope here). */
export const PUBLIC_PATHS: ReadonlyArray<keyof typeof paths> = [
  'home',
  'about',
  'blog',
  'faq',
  'privacy',
  'terms',
  'start',
  'creators',
  'partners',
  'club',
  'explore',
  'community',
  'brandBook',
  'whatsOn',
  'media',
];

/** Legacy ?view= values that were used before path-based routing.
 *  Mapped to their new path so vercel.json can issue 301s and nothing
 *  in old emails / shared links breaks. */
export const LEGACY_VIEW_TO_PATH: Record<string, string> = {
  home: paths.home,
  explore: paths.explore,
  community: paths.community,
  blog: paths.blog,
  about: paths.about,
  dashboard: paths.dashboard,
  passport: paths.passport,
  admin: paths.admin,
  saved: paths.saved,
  faq: paths.faq,
  privacy: paths.privacy,
  terms: paths.terms,
  club: paths.club,
  creators: paths.creators,
  partners: paths.partners,
  start: paths.start,
  auth: paths.login,
};
