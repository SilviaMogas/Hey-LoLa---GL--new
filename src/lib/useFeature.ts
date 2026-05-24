import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from './useAuth';
import { isAdminEmail } from './admin';
import { FEATURES, type FeatureKey, type FeatureStatus } from './featureFlags';

interface FeatureState {
  status: FeatureStatus;
  enabled: boolean;
  isDraft: boolean;
  isBeta: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const ORDER: Record<FeatureStatus, number> = { draft: 0, beta: 1, live: 2 };

export function useFeature(key: FeatureKey): FeatureState {
  const { user } = useAuth();
  const baseline = FEATURES[key];
  const [override, setOverride] = useState<FeatureStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    supabase
      .from('feature_flags')
      .select('status')
      .eq('key', baseline.key)
      .maybeSingle()
      .then(({ data }) => {
        const raw = data?.status;
        if (raw === 'draft' || raw === 'beta' || raw === 'live') {
          setOverride(raw);
        }
        setLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel(`feature-flag-${baseline.key}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'feature_flags',
        filter: `key=eq.${baseline.key}`,
      }, (payload) => {
        const raw = (payload.new as Record<string, unknown>)?.status;
        if (raw === 'draft' || raw === 'beta' || raw === 'live') {
          setOverride(raw);
        } else {
          setOverride(null);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
