import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Loader2, MapPin, PawPrint, X } from 'lucide-react';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { FOUNDATION_LOCATION, dogSlug, type Shelter, type ShelterDog } from '../data/shelters';

const DOG_FALLBACK = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';

interface Selected { shelter: Shelter; dog: ShelterDog }

/**
 * Foundation shelters directory. Each shelter is a card; its dogs are listed
 * as Hey Lola profiles with an "Adopt" tag. Tapping Adopt opens a form whose
 * submission is sent to Hey Lola (foundation_interests) and distributed
 * manually to the shelter.
 */
export const FoundationShelters: React.FC = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // Live from Firestore — no hardcoded shelters/dogs in the app.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'shelters'));
        if (cancelled) return;
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Shelter, 'id'>) }))
          .map((s) => ({ ...s, dogs: Array.isArray(s.dogs) ? s.dogs : [] }))
          .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
        setShelters(list);
      } catch (err) {
        handleFirestoreError(err, OperationType.READ, 'shelters');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const open = (shelter: Shelter, dog: ShelterDog) => {
    setSelected({ shelter, dog });
    setForm({ name: '', email: '', phone: '', message: '' });
    setSent(false);
  };
  const close = () => setSelected(null);

  const submit = async () => {
    if (!selected) return;
    if (!form.name.trim() || form.email.trim().length < 5) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'foundation_interests'), {
        source: 'rescue_passport',
        status: 'new',
        dogId: selected.dog.id,
        dogSlug: dogSlug(selected.dog.name),
        dogName: selected.dog.name,
        partnerId: selected.shelter.id,
        shelterName: selected.shelter.name,
        contact: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        },
        createdAt: serverTimestamp(),
      });
      setSent(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'foundation_interests');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-14 sm:py-16 px-5 sm:px-6 max-w-6xl mx-auto" aria-labelledby="shelters-heading">
      <header className="mb-8 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
          <PawPrint size={11} /> Rescue partners
        </span>
        <h2 id="shelters-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
          Dogs looking for a home<span className="brand-dot" aria-hidden="true" />
        </h2>
        <p className="text-sm text-stone-500 font-light italic leading-relaxed max-w-2xl">
          Each rescue partner below has dogs ready for adoption, each with their own Hey Lola profile. Tap “Adopt” to send your details to Hey Lola — we connect you with the shelter.
        </p>
        <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 bg-stone-50 border border-stone-100 px-3 py-1.5 rounded-full">
          <MapPin size={11} /> Currently in: {FOUNDATION_LOCATION.region} · {FOUNDATION_LOCATION.city}
        </p>
      </header>

      {loading ? (
        <div className="py-12 text-center"><PawPrint size={24} className="mx-auto text-stone-300 animate-pulse" /></div>
      ) : shelters.length === 0 ? (
        <p className="text-sm text-stone-400 italic">Shelters coming soon.</p>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {shelters.map((shelter) => (
          <article key={shelter.id} className="rounded-[1.5rem] border border-stone-100 bg-white p-5 sm:p-6 space-y-4">
            <header className="border-b border-stone-100 pb-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-serif italic leading-tight">{shelter.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 mt-1 inline-flex items-center gap-1">
                    <MapPin size={9} /> {shelter.city}
                  </p>
                </div>
                <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.2em] text-[#6E8C5D] bg-[#F7F9F5] rounded-full px-2.5 py-1">
                  {shelter.dogs.length} {shelter.dogs.length === 1 ? 'dog' : 'dogs'}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-light leading-relaxed">{shelter.blurb}</p>
              <a
                href={shelter.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-charcoal transition-colors"
              >
                See all dogs ↗
              </a>
            </header>

            <ul className="space-y-3">
              {shelter.dogs.map((dog) => (
                <li key={dog.id} className="flex items-center gap-3 rounded-2xl bg-stone-50/60 border border-stone-100 p-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                    <img src={dog.photo || DOG_FALLBACK} alt={dog.name} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-serif italic tracking-tight leading-none">{dog.name}</h4>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#C4622D] bg-[#FDF8F6] border border-[#f3e3da] rounded-full px-2 py-0.5">Adopt</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1">{dog.breed} · {dog.age}{dog.sex ? ` · ${dog.sex}` : ''}</p>
                    <p className="text-xs text-stone-500 font-light leading-snug mt-1 line-clamp-2">{dog.bio}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => open(shelter, dog)}
                    className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-charcoal text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-charcoal/80 transition-colors"
                  >
                    <Heart size={11} /> Adopt me
                  </button>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      )}

      {/* Adoption interest form modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[1.75rem] w-full max-w-md p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto"
            >
              <button type="button" onClick={close} aria-label="Close" className="absolute top-4 right-4 text-stone-400 hover:text-charcoal transition-colors">
                <X size={18} />
              </button>

              {sent ? (
                <div className="text-center space-y-3 py-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#F7F9F5] text-[#6E8C5D] flex items-center justify-center">
                    <Heart size={20} />
                  </div>
                  <h3 className="text-2xl font-serif italic tracking-tight">Thank you<span className="brand-dot" aria-hidden="true" /></h3>
                  <p className="text-sm text-stone-500 font-light leading-relaxed">
                    Your interest in <strong className="font-bold text-charcoal">{selected.dog.name}</strong> is on its way to Hey Lola. We'll connect you with {selected.shelter.name} and follow up by email.
                  </p>
                  <button type="button" onClick={close} className="mt-2 inline-flex items-center justify-center h-10 px-6 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-charcoal/80 transition-colors">
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                      <img src={selected.dog.photo || DOG_FALLBACK} alt={selected.dog.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Adopt</p>
                      <h3 className="text-xl font-serif italic tracking-tight leading-none">{selected.dog.name}</h3>
                      <p className="text-[10px] text-stone-400 mt-0.5">{selected.shelter.name}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name" className="luxury-input h-11 w-full text-sm" />
                    <input
                      type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Your email" className="luxury-input h-11 w-full text-sm" />
                    <input
                      type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Phone (optional)" className="luxury-input h-11 w-full text-sm" />
                    <textarea
                      value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={3} maxLength={500}
                      placeholder={`Tell ${selected.shelter.name} a little about you and your home…`}
                      className="luxury-input p-3 w-full text-sm resize-none" />
                    <button
                      type="button" onClick={submit} disabled={submitting || !form.name.trim() || form.email.trim().length < 5}
                      className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-charcoal/80 transition-colors disabled:opacity-40"
                    >
                      {submitting ? <Loader2 size={13} className="animate-spin" /> : <Heart size={13} />} Send to Hey Lola
                    </button>
                    <p className="text-[10px] text-stone-400 text-center leading-relaxed">
                      Hey Lola receives your interest and connects you with the shelter. No commitment yet.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
