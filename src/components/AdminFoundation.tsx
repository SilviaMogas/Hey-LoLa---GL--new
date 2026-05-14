import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Copy, QrCode, Eye, EyeOff, Mail, ExternalLink, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/firebase';
import type { FoundationDog } from '../data/foundationDogs';
import { passportUrl, qrCodeUrl } from '../lib/passportShare';

type FoundationInterestStatus = 'new' | 'contacted' | 'closed';

interface FoundationInterest {
  id: string;
  dogId: string;
  dogSlug: string;
  partnerId?: string;
  status: FoundationInterestStatus;
  contact: { email: string; name?: string; phone?: string };
  message?: string;
  userId?: string;
  createdAt?: Timestamp;
}

/**
 * Admin moderation surface for the Foundation:
 *  - foundationDogs catalogue with quick visibility toggle, copy-passport-link
 *    and QR-code modal per dog.
 *  - foundation_interests inbox with status transitions.
 *
 * Writes go through the existing Firestore admin rules (which require
 * the signed-in admin email allow-list).
 */
export const AdminFoundation: React.FC = () => {
  const [dogs, setDogs] = useState<FoundationDog[]>([]);
  const [interests, setInterests] = useState<FoundationInterest[]>([]);
  const [qrFor, setQrFor] = useState<FoundationDog | null>(null);
  const [copiedDogId, setCopiedDogId] = useState<string | null>(null);

  useEffect(() => {
    const dogsQ = query(collection(db, 'foundationDogs'), orderBy('passport.createdAt', 'desc'));
    const unsubDogs = onSnapshot(dogsQ, (snap) => {
      setDogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FoundationDog, 'id'>) })));
    });
    const interestsQ = query(collection(db, 'foundation_interests'), orderBy('createdAt', 'desc'));
    const unsubInterests = onSnapshot(interestsQ, (snap) => {
      setInterests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FoundationInterest, 'id'>) })));
    });
    return () => { unsubDogs(); unsubInterests(); };
  }, []);

  // Auto-clear the "Copied" affordance after a short delay. Effect-based
  // (not a setTimeout inside the click handler) so the timer is tied to
  // component lifecycle — no setState-on-unmounted-component risk.
  useEffect(() => {
    if (!copiedDogId) return;
    const t = window.setTimeout(() => setCopiedDogId(null), 2200);
    return () => window.clearTimeout(t);
  }, [copiedDogId]);

  const toggleVisibility = async (dog: FoundationDog) => {
    const next = dog.passport.visibility === 'public' ? 'hidden' : 'public';
    await updateDoc(doc(db, 'foundationDogs', dog.id), {
      'passport.visibility': next,
      updatedAt: serverTimestamp(),
    });
  };

  const copyLink = async (dog: FoundationDog) => {
    const url = passportUrl(dog.passport.slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedDogId(dog.id);
    } catch {
      window.prompt('Copy this passport link', url);
    }
  };

  const setInterestStatus = async (id: string, status: FoundationInterestStatus) => {
    await updateDoc(doc(db, 'foundation_interests', id), {
      status,
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div className="col-span-full space-y-10">
      {/* Dogs catalogue */}
      <section className="space-y-4">
        <header className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-serif italic text-2xl">Rescue passports</h2>
            <p className="text-sm text-stone-500 font-light">{dogs.length} dog{dogs.length === 1 ? '' : 's'} in the catalogue</p>
          </div>
        </header>

        {dogs.length === 0 ? (
          <p className="text-sm text-stone-400 italic py-6">No dogs in Firestore yet — the public page is using the seed sample.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map((dog) => {
              const isPublic = dog.passport.visibility === 'public';
              return (
                <article key={dog.id} className="rounded-2xl border border-stone-100 bg-white p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={dog.imageUrl}
                      alt={dog.name}
                      className="w-16 h-16 rounded-xl object-cover bg-stone-50 border border-stone-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif italic text-lg leading-tight truncate">{dog.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mt-1">
                        {dog.breed} · {dog.partnerName}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-0.5">
                        <span className={isPublic ? 'text-emerald-600' : 'text-stone-400'}>
                          {dog.passport.visibility}
                        </span>
                        <span className="text-stone-300"> · </span>
                        <span className="text-stone-500">{dog.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleVisibility(dog)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1.5 rounded-full border border-stone-200 text-stone-600 hover:border-charcoal hover:text-charcoal transition-colors"
                      aria-label={isPublic ? 'Hide passport' : 'Publish passport'}
                    >
                      {isPublic ? <EyeOff size={11} /> : <Eye size={11} />}
                      {isPublic ? 'Hide' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyLink(dog)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1.5 rounded-full border border-stone-200 text-stone-600 hover:border-charcoal hover:text-charcoal transition-colors"
                    >
                      {copiedDogId === dog.id ? <CheckCircle2 size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      {copiedDogId === dog.id ? 'Copied' : 'Link'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrFor(dog)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1.5 rounded-full border border-stone-200 text-stone-600 hover:border-charcoal hover:text-charcoal transition-colors"
                    >
                      <QrCode size={11} /> QR
                    </button>
                    <a
                      href={`/foundation/dogs/${dog.passport.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1.5 rounded-full border border-stone-200 text-stone-600 hover:border-charcoal hover:text-charcoal transition-colors"
                    >
                      <ExternalLink size={11} /> View
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Interest inbox */}
      <section className="space-y-4">
        <header>
          <h2 className="font-serif italic text-2xl">Interest inbox</h2>
          <p className="text-sm text-stone-500 font-light">{interests.length} interest{interests.length === 1 ? '' : 's'} received</p>
        </header>

        {interests.length === 0 ? (
          <p className="text-sm text-stone-400 italic py-6">No interest submissions yet. They will appear here when someone fills the passport form.</p>
        ) : (
          <div className="space-y-3">
            {interests.map((i) => {
              const dog = dogs.find((d) => d.id === i.dogId || d.passport.slug === i.dogSlug);
              const dogLabel = dog ? `${dog.name} · ${dog.partnerName}` : i.dogSlug;
              return (
                <article key={i.id} className="rounded-2xl border border-stone-100 bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                        {dogLabel}
                      </p>
                      <p className="font-serif italic text-lg leading-tight">
                        {i.contact.name || i.contact.email}
                      </p>
                      <p className="text-sm text-stone-500 font-light flex flex-wrap items-center gap-x-3 gap-y-1">
                        <a href={`mailto:${i.contact.email}`} className="inline-flex items-center gap-1 hover:underline">
                          <Mail size={12} /> {i.contact.email}
                        </a>
                        {i.contact.phone && <span className="text-stone-400">· {i.contact.phone}</span>}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full ${
                      i.status === 'new' ? 'bg-brand-orange/10 text-[#9E5826]' :
                      i.status === 'contacted' ? 'bg-stone-100 text-stone-600' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {i.status}
                    </span>
                  </div>
                  {i.message && (
                    <p className="text-sm text-stone-600 font-light leading-relaxed border-l-2 border-stone-100 pl-3 italic">
                      "{i.message}"
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(['new', 'contacted', 'closed'] as FoundationInterestStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setInterestStatus(i.id, s)}
                        disabled={s === i.status}
                        className={`text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full border transition-colors ${
                          s === i.status
                            ? 'border-charcoal bg-charcoal text-white cursor-default'
                            : 'border-stone-200 text-stone-500 hover:border-charcoal hover:text-charcoal'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* QR modal */}
      {qrFor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center px-5"
          onClick={() => setQrFor(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Passport QR</p>
            <h3 className="font-serif italic text-2xl">{qrFor.name}</h3>
            <img
              src={qrCodeUrl(passportUrl(qrFor.passport.slug), 320)}
              alt={`QR for ${qrFor.name}'s passport`}
              className="w-64 h-64 mx-auto"
            />
            <p className="text-[11px] text-stone-500 break-all">{passportUrl(qrFor.passport.slug)}</p>
            <button
              type="button"
              onClick={() => setQrFor(null)}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-charcoal transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
