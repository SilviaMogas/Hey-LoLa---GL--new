import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { dogSlug, type Shelter, type ShelterDog } from '../data/shelters';

/**
 * Admin CRUD for the Foundation `shelters` collection. Lets Hey Lola add /
 * edit / delete partner shelters and their adoptable dogs (real profiles)
 * without touching code — the /foundation page reads this live.
 */
const blankDog = (): ShelterDog => ({ id: `dog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: '', breed: '', age: '', sex: undefined, photo: '', bio: '' });
const blankShelter = (): Shelter => ({ id: '', name: '', city: '', region: 'Americas', blurb: '', website: '', dogs: [], order: 99 });

export const AdminShelters: React.FC = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});

  const shareLink = async (i: number) => {
    const s = shelters[i];
    if (!s.id) { alert('Save the shelter first, then generate its edit link.'); return; }
    const token = (crypto.randomUUID?.() || `${Date.now()}${Math.random()}`).replace(/-/g, '');
    try {
      await setDoc(doc(db, 'shelter_secrets', s.id), { token, updatedAt: serverTimestamp() }, { merge: true });
      const url = `${window.location.origin}/shelter/${s.id}?t=${token}`;
      setLinks((p) => ({ ...p, [s.id]: url }));
      try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'shelter_secrets');
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'shelters'));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Shelter, 'id'>) }))
        .map((s) => ({ ...s, dogs: Array.isArray(s.dogs) ? s.dogs : [] }))
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      setShelters(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.READ, 'shelters');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const patch = (i: number, p: Partial<Shelter>) =>
    setShelters((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...p } : s)));
  const patchDog = (si: number, di: number, p: Partial<ShelterDog>) =>
    setShelters((prev) => prev.map((s, idx) => (idx === si ? { ...s, dogs: s.dogs.map((d, j) => (j === di ? { ...d, ...p } : d)) } : s)));

  const save = async (i: number) => {
    const s = shelters[i];
    const id = (s.id || dogSlug(s.name) || `shelter-${Date.now()}`).trim();
    if (!s.name.trim()) { alert('Shelter needs a name.'); return; }
    setSavingId(id);
    try {
      await setDoc(doc(db, 'shelters', id), {
        name: s.name.trim(),
        city: s.city.trim(),
        region: s.region || 'Americas',
        blurb: s.blurb.trim(),
        website: s.website.trim(),
        order: Number(s.order ?? 99),
        dogs: s.dogs
          .filter((d) => d.name.trim())
          .map((d) => ({
            id: d.id || dogSlug(d.name),
            name: d.name.trim(), breed: d.breed.trim(), age: d.age.trim(),
            ...(d.sex ? { sex: d.sex } : {}),
            ...(d.photo?.trim() ? { photo: d.photo.trim() } : {}),
            bio: d.bio.trim(),
          })),
        updatedAt: serverTimestamp(),
      }, { merge: false });
      if (!s.id) patch(i, { id }); // adopt the generated id locally
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'shelters');
    } finally {
      setSavingId(null);
    }
  };

  const removeShelter = async (i: number) => {
    const s = shelters[i];
    if (!confirm(`Delete shelter "${s.name || 'Untitled'}"?`)) return;
    try {
      if (s.id) await deleteDoc(doc(db, 'shelters', s.id));
      setShelters((prev) => prev.filter((_, idx) => idx !== i));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'shelters');
    }
  };

  if (loading) return <div className="col-span-full py-10 text-center"><Loader2 className="mx-auto animate-spin text-stone-300" /></div>;

  return (
    <div className="col-span-full space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-stone-400">Foundation shelters</h3>
        <button
          type="button"
          onClick={() => setShelters((prev) => [...prev, blankShelter()])}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-charcoal/80"
        >
          <Plus size={14} /> Add shelter
        </button>
      </div>

      {shelters.map((s, i) => (
        <div key={s.id || `new-${i}`} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={s.name} onChange={(e) => patch(i, { name: e.target.value })} placeholder="Shelter name" className="luxury-input h-10 text-sm" />
            <input value={s.city} onChange={(e) => patch(i, { city: e.target.value })} placeholder="City (e.g. Brooklyn, NY)" className="luxury-input h-10 text-sm" />
            <input value={s.website} onChange={(e) => patch(i, { website: e.target.value })} placeholder="Website (https://…)" className="luxury-input h-10 text-sm" />
            <input type="number" value={s.order ?? 99} onChange={(e) => patch(i, { order: Number(e.target.value) })} placeholder="Order" className="luxury-input h-10 text-sm" />
          </div>
          <textarea value={s.blurb} onChange={(e) => patch(i, { blurb: e.target.value })} placeholder="Short description" rows={2} className="luxury-input p-2 text-sm w-full resize-none" />

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Dogs</p>
            {s.dogs.map((d, di) => (
              <div key={d.id} className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={d.name} onChange={(e) => patchDog(i, di, { name: e.target.value })} placeholder="Dog name" className="luxury-input h-9 text-sm" />
                <input value={d.breed} onChange={(e) => patchDog(i, di, { breed: e.target.value })} placeholder="Breed" className="luxury-input h-9 text-sm" />
                <input value={d.age} onChange={(e) => patchDog(i, di, { age: e.target.value })} placeholder="Age (e.g. 2 yrs)" className="luxury-input h-9 text-sm" />
                <select value={d.sex ?? ''} onChange={(e) => patchDog(i, di, { sex: (e.target.value || undefined) as ShelterDog['sex'] })} className="luxury-input h-9 text-sm">
                  <option value="">Sex…</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input value={d.photo ?? ''} onChange={(e) => patchDog(i, di, { photo: e.target.value })} placeholder="Photo URL" className="luxury-input h-9 text-sm sm:col-span-2" />
                <textarea value={d.bio} onChange={(e) => patchDog(i, di, { bio: e.target.value })} placeholder="Short bio" rows={2} className="luxury-input p-2 text-sm w-full resize-none sm:col-span-2" />
                <button type="button" onClick={() => patch(i, { dogs: s.dogs.filter((_, j) => j !== di) })} className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-1 sm:col-span-2">
                  <Trash2 size={12} /> Remove dog
                </button>
              </div>
            ))}
            <button type="button" onClick={() => patch(i, { dogs: [...s.dogs, blankDog()] })} className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-charcoal border-2 border-dashed border-stone-200 rounded-xl py-2 w-full">
              + Add dog
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-stone-100">
            <button type="button" onClick={() => removeShelter(i)} className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-1">
              <Trash2 size={13} /> Delete
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => shareLink(i)} className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-stone-200 text-stone-600 text-[10px] font-black uppercase tracking-[0.2em] hover:border-charcoal/40">
                Share edit link
              </button>
              <button type="button" onClick={() => save(i)} disabled={savingId !== null} className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-charcoal/80 disabled:opacity-50">
                {savingId ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save shelter
              </button>
            </div>
          </div>
          {s.id && links[s.id] && (
            <div className="rounded-xl bg-[#F7F9F5] border border-[#e3ece0] p-3 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6E8C5D]">Edit link copied — share with the shelter</p>
              <input readOnly value={links[s.id]} onFocus={(e) => e.target.select()} className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-[11px] text-stone-600" />
              <p className="text-[10px] text-stone-400">Anyone with this link can edit this shelter's profile and dogs. Generate again to revoke the old one.</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
