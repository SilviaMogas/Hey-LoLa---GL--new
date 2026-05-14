import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './useAuth';
import { isAdminEmail } from './admin';
import { FEATURES, type FeatureKey, type FeatureStatus } from './featureFlags';

interface FeatureState {
  /** Final, effective status after applying Firestore overrides. */
  status: FeatureStatus;
  /** Should this feature render for the current viewer? */
  enabled: boolean;
  /** Is the feature currently in 'draft' mode? */
  isDraft: boolean;
  /** Is the feature currently in 'beta' mode? */
  isBeta: boolean;
  /** Is the current viewer an admin? Drives the "preview" banner. */
  isAdmin: boolean;
  /** Are we still resolving the override from Firestore? */
  loading: boolean;
}

const ORDER: Record<FeatureStatus, number> = { draft: 0, beta: 1, live: 2 };

/**
 * Resolves the effective feature status for the current viewer.
 *
 * Visibility rules (after applying the highest-promoted status between code
 * baseline and Firestore override — overrides can only promote, never hide):
 *
 *   - live    → enabled for everyone
 *   - beta    → enabled for everyone, page typically shows a "Beta" chip
 *   - draft   → enabled ONLY for admins; everyone else gets enabled=false
 *
 * The hook subscribes to the Firestore `feature_flags/<key>` doc so admins
 * can flip a feature live from the admin panel without a redeploy.
 */
export function useFeature(key: FeatureKey): FeatureState {
  const { user } = useAuth();
  const baseline = FEATURES[key];
  const [override, setOverride] = useState<FeatureStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'feature_flags', baseline.key);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data();
        const raw = data?.status;
        if (raw === 'draft' || raw === 'beta' || raw === 'live') {
          setOverride(raw);
        } else {
          setOverride(null);
        }
        setLoading(false);
      },
      () => { setOverride(null); setLoading(false); },
    );
    return () => unsub();
  }, [baseline.key]);

  const promoted: FeatureStatus =
    override && ORDER[override] > ORDER[baseline.status] ? override : baseline.status;

  const isAdmin = isAdminEmail(user?.email);
  const enabled = promoted !== 'draft' || isAdmin;

  return {
    status: promoted,
    enabled,
    isDraft: promoted === 'draft',
    isBeta: promoted === 'beta',
    isAdmin,
    loading,
  };
}
