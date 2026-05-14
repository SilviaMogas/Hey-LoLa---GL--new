/**
 * Hey Lola — Feature flag registry.
 *
 * Three lifecycle stages:
 *   - 'draft' — built but hidden. Only admins can reach the route or render
 *     the component. Public visitors get a 404.
 *   - 'beta'  — public but with a visible "Beta" pill. Use when we want
 *     feedback from real users but haven't fully launched.
 *   - 'live'  — public, no special UI affordances. The feature is shipped.
 *
 * The registry below is the *baseline* state shipped with the code. Admins
 * can override a flag at runtime through the Firestore `feature_flags`
 * collection (see useFeature.ts) so we can flip a feature live without a
 * deploy. Firestore overrides only ever loosen visibility (draft → beta or
 * live, beta → live); they cannot hide a 'live' feature for safety.
 */

export type FeatureStatus = 'draft' | 'beta' | 'live';

export interface FeatureFlag {
  /** Stable identifier used as the doc key in Firestore overrides. */
  key: string;
  /** Human-readable name shown in the admin dashboard. */
  label: string;
  /** One-line description of what this feature is. */
  description: string;
  /** Code-baseline status. */
  status: FeatureStatus;
  /** Optional public route — when set, DraftRoute uses this to compose
   *  the "preview only" experience and the public 404 redirect target. */
  route?: string;
}

export const FEATURES = {
  founderDeals: {
    key: 'founderDeals',
    label: 'Founder Deals',
    description:
      'Members-only deals dashboard with verified partner offers (FounderPass-style). Built but hidden until we have 10+ verified partners signed.',
    status: 'draft',
    route: '/perks/deals',
  },
  conciergeChat: {
    key: 'conciergeChat',
    label: 'Concierge AI Chat',
    description:
      'AI concierge in-app chat surface trained on the Hey Lola voice and city data. Beta with admins for now.',
    status: 'draft',
    route: '/chat',
  },
  petPassportV2: {
    key: 'petPassportV2',
    label: 'Pet Passport v2',
    description:
      'Next-generation pet passport with shareable QR, multi-pet households and emergency-contact share. Currently in beta.',
    status: 'beta',
  },
} as const satisfies Record<string, FeatureFlag>;

export type FeatureKey = keyof typeof FEATURES;

export const ALL_FEATURE_KEYS: FeatureKey[] = Object.keys(FEATURES) as FeatureKey[];
