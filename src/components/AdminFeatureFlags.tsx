import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';
import { ALL_FEATURE_KEYS, FEATURES, type FeatureFlag, type FeatureKey, type FeatureStatus } from '../lib/featureFlags';

const STATUS_OPTIONS: FeatureStatus[] = ['draft', 'beta', 'live'];

const STATUS_ICON: Record<FeatureStatus, React.ReactNode> = {
  draft: <Eye size={11} />,
  beta: <Sparkles size={11} />,
  live: <CheckCircle2 size={11} />,
};

const STATUS_CHIP: Record<FeatureStatus, string> = {
  draft: 'bg-brand-orange/10 text-[#9E5826]',
  beta: 'bg-stone-100 text-stone-600',
  live: 'bg-emerald-50 text-emerald-700',
};

interface FlagRowProps {
  flagKey: FeatureKey;
}

/**
 * Lightweight admin panel for promoting feature flags between draft / beta /
 * live without a redeploy. Mounted from the existing Admin page; the
 * collection is locked down to admins by the firestore.rules update that
 * ships alongside this component.
 */
const FlagRow: React.FC<FlagRowProps> = ({ flagKey }) => {
  const baseline: FeatureFlag = FEATURES[flagKey];
  const [override, setOverride] = useState<FeatureStatus | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState<FeatureStatus | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const ref = doc(db, 'feature_flags', baseline.key);
    return onSnapshot(ref, (snap) => {
      const data = snap.data();
      const raw = data?.status;
      setOverride(raw === 'draft' || raw === 'beta' || raw === 'live' ? raw : null);
      setUpdatedAt(data?.updatedAt?.toMillis?.() ?? null);
    });
  }, [baseline.key]);

  const effective: FeatureStatus = override ?? baseline.status;

  const promote = async (next: FeatureStatus) => {
    if (saving) return;
    setSaving(next);
    try {
      await setDoc(
        doc(db, 'feature_flags', baseline.key),
        {
          status: next,
          updatedAt: serverTimestamp(),
          updatedBy: user?.email ?? 'admin',
        },
        { merge: true },
      );
    } finally {
      setSaving(null);
    }
  };

  return (
    <article className="rounded-2xl border border-stone-100 bg-white p-5 space-y-4">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-serif italic text-xl text-charcoal">{baseline.label}</h3>
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] px-2 py-0.5 rounded-full ${STATUS_CHIP[effective]}`}>
            {STATUS_ICON[effective]}
            {effective}
          </span>
        </div>
        <p className="text-sm text-stone-500 font-light leading-relaxed">{baseline.description}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
          Key <span className="text-stone-600">{baseline.key}</span>
          {baseline.route && <> · Route <span className="text-stone-600">{baseline.route}</span></>}
          {updatedAt && <> · Updated <span className="text-stone-600">{new Date(updatedAt).toLocaleString()}</span></>}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const isCurrent = opt === effective;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => promote(opt)}
              disabled={saving !== null || isCurrent}
              className={`text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full border transition-colors ${
                isCurrent
                  ? 'border-charcoal bg-charcoal text-white cursor-default'
                  : 'border-stone-200 text-stone-500 hover:border-charcoal hover:text-charcoal'
              } ${saving === opt ? 'opacity-50 cursor-wait' : ''}`}
              aria-pressed={isCurrent}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </article>
  );
};

export const AdminFeatureFlags: React.FC = () => {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="font-serif italic text-2xl">Feature flags</h2>
        <p className="text-sm text-stone-500 font-light">
          Promote a draft feature to beta or live without a deploy. Live changes propagate in real time to every signed-in client.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {ALL_FEATURE_KEYS.map((key) => (
          <FlagRow key={key} flagKey={key} />
        ))}
      </div>
    </section>
  );
};
