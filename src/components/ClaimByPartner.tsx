import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, limit, query, setDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2, ShieldCheck, Send } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Place } from '../types';
import { curatedPlaces } from '../data/curatedPlaces';
import { venueSlug } from '../lib/utils';
import { track } from '../lib/analytics';
import { BrandLogo } from './BrandLogo';
import { FormField } from './FormField';

interface ClaimByPartnerProps {
  slug: string;
  user: { uid: string; email: string | null } | null;
  onBack: () => void;
  onLogin: () => void;
  onSubmitted: () => void;
}

interface FormState {
  businessName: string;
  contactPerson: string;
  businessEmail: string;
  phone: string;
  website: string;
  message: string;
}

const placeMatches = (p: Pick<Place, 'name' | 'city'>, slug: string) => venueSlug(p.name, p.city) === slug;

export const ClaimByPartner: React.FC<ClaimByPartnerProps> = ({ slug, user, onBack, onLogin, onSubmitted }) => {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState<FormState>({
    businessName: '', contactPerson: '', businessEmail: '', phone: '', website: '', message: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    const fromSeed = curatedPlaces.find(p => placeMatches(p, slug));
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'places'), limit(500)));
        if (!active) return;
        const fromDb = snap.docs
          .map(d => ({ id: d.id, ...(d.data() as Omit<Place, 'id'>) }))
          .find(p => placeMatches(p, slug) && !p.isHidden);
        const found = fromDb ?? (fromSeed ? ({ ...fromSeed, id: `seed-${slug}` } as Place) : null);
        setPlace(found);
        setNotFound(!found);
        if (found) {
          setForm(prev => ({
            ...prev,
            businessName: prev.businessName || found.name,
            website: prev.website || found.website || '',
            phone: prev.phone || found.phone || '',
          }));
        }
      } catch (err) {
        console.error('ClaimByPartner load error', err);
        if (!active) return;
        setNotFound(!fromSeed);
        setPlace(fromSeed ? ({ ...fromSeed, id: `seed-${slug}` } as Place) : null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    if (!user?.email) return;
    setForm(prev => ({ ...prev, businessEmail: prev.businessEmail || user.email || '' }));
  }, [user]);

  useEffect(() => {
    if (place) {
      document.title = `Claim ${place.name} — Hey Lola`;
    }
  }, [place]);

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const canSubmit = !!(
    user
    && place
    && form.businessName.trim()
    && form.contactPerson.trim()
    && form.businessEmail.trim()
    && agreed
  );

  const handleSubmit = async () => {
    setError(null);
    if (!user || !auth.currentUser) {
      setError('Please sign in to submit this claim.');
      return;
    }
    if (!place) return;
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const ref = collection(db, 'claim_requests');
      await setDoc(doc(ref), {
        userId: auth.currentUser.uid,
        placeId: place.id,
        placeName: place.name,
        businessName: form.businessName.trim(),
        contactPerson: form.contactPerson.trim(),
        businessEmail: form.businessEmail.trim(),
        phone: form.phone.trim(),
        website: form.website.trim(),
        message: form.message.trim(),
        source: 'partner_link',
        partnerSlug: slug,
        status: 'Pending review',
        createdAt: new Date().toISOString(),
      });
      track('place_claimed', { placeId: place.id, placeName: place.name, city: place.city });
      setDone(true);
      onSubmitted();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'claim_requests');
      setError('We could not submit your claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (notFound || !place) {
    return (
      <div className="min-h-screen bg-bone flex flex-col items-center justify-center p-6 text-center gap-4">
        <h1 className="text-3xl font-serif italic text-charcoal">Listing not found</h1>
        <p className="text-stone-500">We couldn't find a venue for <code className="bg-stone-100 px-2 py-1 rounded">{slug}</code>.</p>
        <button onClick={onBack} className="bg-charcoal text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.25em]">
          Back to Hey Lola
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone font-boutique flex flex-col">
      <header className="border-b border-stone-100 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-charcoal text-[10px] font-black uppercase tracking-[0.2em]">
            <ArrowLeft size={14} /> Hey Lola
          </button>
          <BrandLogo size="sm" />
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <section className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Partner Network</span>
          <h1 className="text-3xl md:text-4xl font-serif italic text-charcoal tracking-tight leading-tight">
            Claim {place.name}
          </h1>
          <p className="text-sm text-stone-500 italic">
            {place.category} · {place.city}
          </p>
        </section>

        {!user && (
          <section className="bg-white border border-stone-100 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sign in required</span>
            </div>
            <p className="text-sm text-stone-500 leading-snug">
              For trust and anti-spam, we ask the person claiming a venue to sign in first. It only takes a minute.
            </p>
            <button
              onClick={onLogin}
              className="bg-charcoal text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.25em] hover:bg-stone-800 transition-colors"
            >
              Sign in to continue
            </button>
          </section>
        )}

        {done ? (
          <section className="bg-white border border-stone-100 rounded-2xl p-6 space-y-3 shadow-sm">
            <h2 className="text-2xl font-serif italic text-charcoal tracking-tight">Claim received</h2>
            <p className="text-sm text-stone-500 leading-snug">
              Thanks. Our team will review your submission and email you within 5 business days.
            </p>
            <button
              onClick={onBack}
              className="text-[10px] font-black uppercase tracking-[0.25em] text-charcoal hover:tracking-[0.3em] transition-all"
            >
              Back to {place.name}
            </button>
          </section>
        ) : (
          <section className={`bg-white border border-stone-100 rounded-2xl p-6 space-y-5 shadow-sm ${!user ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Business name" value={form.businessName} onChange={update('businessName')} required />
              <FormField label="Your name" value={form.contactPerson} onChange={update('contactPerson')} required />
              <FormField label="Contact email" type="email" value={form.businessEmail} onChange={update('businessEmail')} required />
              <FormField label="Phone" value={form.phone} onChange={update('phone')} />
              <div className="md:col-span-2">
                <FormField label="Website" value={form.website} onChange={update('website')} />
              </div>
              <div className="md:col-span-2">
                <FormField label="Anything we should know" value={form.message} onChange={update('message')} multiline />
              </div>
            </div>

            <label className="flex items-start gap-3 text-xs text-stone-500 leading-snug cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-charcoal"
              />
              <span>
                I represent this business and agree to the Hey Lola Business Terms. We may contact the email above to verify the claim.
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full flex items-center justify-center gap-2 bg-charcoal text-white py-4 rounded-full font-black text-[11px] uppercase tracking-[0.25em] hover:bg-stone-800 disabled:opacity-40 transition-colors shadow-md"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Submit claim
            </button>
          </section>
        )}
      </main>

      <footer className="border-t border-stone-100 mt-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">
        © {new Date().getFullYear()} Hey Lola
      </footer>
    </div>
  );
};
