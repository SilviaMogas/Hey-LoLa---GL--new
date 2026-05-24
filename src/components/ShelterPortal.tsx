import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Loader2, PawPrint, Plus, Save, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { handleSupabaseError, OperationType } from '../lib/dbHelpers';
import { SEO } from '../lib/seo';
import { dogSlug, type Shelter, type ShelterDog } from '../data/shelters';

const blankDog = (): ShelterDog => ({ id: `dog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: '', breed: '', age: '', sex: undefined, photo: '', bio: '' });

/**
 * Shelter self-service portal. A shelter opens a shareable link
 * (/shelter/:shelterId?t=TOKEN) handed to them by Hey Lola and edits their
 * own profile + adoptable dogs. Saving goes through /api/shelter-update,
 * which validates the token server-side (no Hey Lola account needed).
 */
export const ShelterPortal: React.FC = () => {
  const { shelterId = '' } = useParams<{ shelterId: string }>();
  const [params] = useSearchParams();
  const token = params.get('t') || '';

  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shelterId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: row, error: fetchErr } = await supabase.from('shelters').select('*').eq('id', shelterId).maybeSingle();
        if (cancelled) return;
        if (row) {
          const s = { ...row, dogs: Array.isArray(row.dogs) ? row.dogs : [] } as Shelter;
          setShelter(s);
        } else {
          setError(fetchErr ? 'Could not load shelter.' : 'Shelter not found.');
        }
      } catch (err) {
        handleSupabaseError(err, OperationType.READ, 'shelters');
        setError('Could not load this shelter.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [shelterId]);

  const patch = (p: Partial<Shelter>) => setShelter((s) => (s ? { ...s, ...p } : s));
  const patchDog = (i: number, p: Partial<ShelterDog>) =>
    setShelter((s) => (s ? { ...s, dogs: s.dogs.map((d, j) => (j === i ? { ...d, ...p } : d)) } : s));

  const save = async () => {
    if (!shelter || saving) return;
    setSaving(true); setSaved(false); setError('');
    try {
      const res = await fetch('/api/shelter-update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          shelterId,
          token,
          data: {
            name: shelter.name, city: shelter.city, blurb: shelter.blurb,
            website: shelter.website,
            dogs: shelter.dogs.map((d) => ({ ...d, id: d.id || dogSlug(d.name) })),
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) { setError(json.error || 'Could not save. Check your link.'); return; }
      setSaved(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return <div className="max-w-xl mx-auto px-5 py-20 text-center font-boutique"><p className="text-stone-500 italic">This editing link is missing its access token. Please use the full link Hey Lola sent you.</p></div>;
  }
  if (loading) return <div className="py-24 text-center"><Loader2 className="mx-auto animate-spin text-stone-300" /></div>;
  if (error && !shelter) return <div className="max-w-xl mx-auto px-5 py-20 text-center font-boutique"><p className="text-stone-500 italic">{error}</p></div>;
  if (!shelter) return null;

  return (
    <main className="bg-white min-h-screen text-charcoal font-boutique">
      <SEO title={`${shelter.name} — Shelter Portal`} description="Edit your shelter profile and adoptable dogs on Hey Lola." url={`/shelter/${shelterId}`} />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 space-y-6">
        <header className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2"><PawPrint size={11} /> Shelter portal</span>
          <h1 className="text-3xl font-serif italic tracking-tight">{shelter.name || 'Your shelter'}<span className="brand-dot" aria-hidden="true" /></h1>
          <p className="text-sm text-stone-500 font-light italic">Edit your profile and adoptable dogs. Changes go live on Hey Lola once you save.</p>
        </header>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={shelter.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Shelter name" className="luxury-input h-10 text-sm" />
            <input value={shelter.city} onChange={(e) => patch({ city: e.target.value })} placeholder="City" className="luxury-input h-10 text-sm" />
            <input value={shelter.website} onChange={(e) => patch({ website: e.target.value })} placeholder="Website (https://…)" className="luxury-input h-10 text-sm sm:col-span-2" />
          </div>
          <textarea value={shelter.blurb} onChange={(e) => patch({ blurb: e.target.value })} placeholder="Short description of your shelter" rows={2} className="luxury-input p-2 text-sm w-full resize-none" />
        </section>

        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Adoptable dogs</h2>
          {shelter.dogs.map((d, i) => (
            <div key={d.id} className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input value={d.name} onChange={(e) => patchDog(i, { name: e.target.value })} placeholder="Dog name" className="luxury-input h-9 text-sm" />
              <input value={d.breed} onChange={(e) => patchDog(i, { breed: e.target.value })} placeholder="Breed" className="luxury-input h-9 text-sm" />
              <input value={d.age} onChange={(e) => patchDog(i, { age: e.target.value })} placeholder="Age (e.g. 2 yrs)" className="luxury-input h-9 text-sm" />
              <select value={d.sex ?? ''} onChange={(e) => patchDog(i, { sex: (e.target.value || undefined) as ShelterDog['sex'] })} className="luxury-input h-9 text-sm">
                <option value="">Sex…</option><option value="Male">Male</option><option value="Female">Female</option>
              </select>
              <input value={d.photo ?? ''} onChange={(e) => patchDog(i, { photo: e.target.value })} placeholder="Photo URL" className="luxury-input h-9 text-sm sm:col-span-2" />
              <textarea value={d.bio} onChange={(e) => patchDog(i, { bio: e.target.value })} placeholder="Short bio" rows={2} className="luxury-input p-2 text-sm w-full resize-none sm:col-span-2" />
              <button type="button" onClick={() => patch({ dogs: shelter.dogs.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-1 sm:col-span-2"><Trash2 size={12} /> Remove dog</button>
            </div>
          ))}
          <button type="button" onClick={() => patch({ dogs: [...shelter.dogs, blankDog()] })} className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-charcoal border-2 border-dashed border-stone-200 rounded-xl py-2 w-full">+ Add dog</button>
        </section>

        <div className="flex items-center justify-between gap-3 pt-2">
          {saved ? <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6E8C5D]">✓ Saved & live</span>
            : error ? <span className="text-[11px] text-red-500">{error}</span>
            : <span />}
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-charcoal/80 disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save changes
          </button>
        </div>
      </div>
    </main>
  );
};
