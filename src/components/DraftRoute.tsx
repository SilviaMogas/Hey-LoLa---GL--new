import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFeature } from '../lib/useFeature';
import { FEATURES, type FeatureKey } from '../lib/featureFlags';
import { DraftBanner } from './DraftBanner';

interface DraftRouteProps {
  /** Which feature this route is gated by. */
  flag: FeatureKey;
  /** Where to redirect public visitors when the feature is in draft. */
  fallbackTo?: string;
  /** The actual page to render when the viewer is allowed in. */
  children: React.ReactNode;
}

/**
 * Route guard for stealth / phase-2 features. Wrap any page that should be
 * built but not publicly visible yet:
 *
 *   <Route path="/founder-deals" element={
 *     <DraftRoute flag="founderDeals"><FounderDeals /></DraftRoute>
 *   } />
 *
 *   - Status 'live'  → renders children to everyone, no banner.
 *   - Status 'beta'  → renders children to everyone, with a small "Beta" banner.
 *   - Status 'draft' → renders children ONLY to admins, with a "Preview" banner.
 *                       Everyone else is redirected to `fallbackTo` (default '/').
 *
 * Loading state renders nothing for a moment to avoid a content flash before
 * the Firestore override resolves.
 */
export const DraftRoute: React.FC<DraftRouteProps> = ({ flag, fallbackTo = '/', children }) => {
  const feature = useFeature(flag);
  const profile = FEATURES[flag];

  if (feature.loading) {
    return <main className="bg-white min-h-screen" aria-busy="true" />;
  }

  if (!feature.enabled) {
    return <Navigate to={fallbackTo} replace />;
  }

  return (
    <>
      <DraftBanner status={feature.status} featureLabel={profile.label} />
      {children}
    </>
  );
};
