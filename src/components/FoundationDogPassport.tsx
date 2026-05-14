import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Heart,
  Loader2,
  Mail,
  MessageCircle,
  QrCode,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FOUNDATION_DOGS, type FoundationDog } from '../data/foundationDogs';
import {
  copyToClipboard,
  emailShareUrl,
  passportUrl,
  qrCodeUrl,
  tryNativeShare,
  whatsappShareUrl,
} from '../lib/passportShare';
import { SEO, personSchema } from '../lib/seo';

interface FoundationDogPassportProps {
  slug: string;
  onBack: () => void;
  onNotFound: () => void;
}

function findDogBySlug(slug: string): FoundationDog | undefined {
  return FOUNDATION_DOGS.find((d) => d.passport.slug === slug);
}

export const FoundationDogPassport: React.FC<FoundationDogPassportProps> = ({ slug, onBack, onNotFound }) => {
  const seedDog = useMemo(() => findDogBySlug(slug), [slug]);
  const [liveDog, setLiveDog] = useState<FoundationDog | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInterest, setShowInterest] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  // Prefer the live Firestore record when it exists; fall back to seed.
  useEffect(() => {
    const q = query(collection(db, 'foundationDogs'), where('passport.slug', '==', slug));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const first = snap.docs[0];
        if (first) {
          setLiveDog({ id: first.id, ...(first.data() as Omit<FoundationDog, 'id'>) });
        } else {
          setLiveDog(null);
        }
        setLoading(false);
      },
      () => { setLiveDog(null); setLoading(false); },
    );
    return () => unsubscribe();
  }, [slug]);

  const dog = liveDog ?? seedDog;

  if (loading && !seedDog) {
    return <main className="bg-white min-h-screen" aria-busy="true" />;
  }

  if (!dog) {
    return <NotFound onBack={onBack} onContinue={onNotFound} />;
  }

  if (dog.passport.visibility !== 'public' || dog.status !== 'available') {
    return <NotFound onBack={onBack} onContinue={onNotFound} />;
  }

  const url = passportUrl(dog.passport.slug);
  const breadcrumbs = [
    { name: 'Hey Lola', item: '/' },
    { name: 'Foundation', item: '/foundation' },
    { name: 'Rescue Dogs', item: '/foundation/dogs' },
    { name: dog.name, item: dog.passport.publicUrl },
  ];

  const handleShare = async () => {
    const sent = await tryNativeShare(dog.name, url);
    if (!sent) {
      const ok = await copyToClipboard(url);
      if (ok) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <main className="bg-white min-h-screen text-charcoal font-boutique" aria-labelledby="passport-heading">
      <SEO
        title={`Meet ${dog.name} — ${dog.partnerName} · Hey Lola Foundation`}
        description={`Rescue passport for ${dog.name} via ${dog.partnerName}. ${dog.description}`}
        url={dog.passport.publicUrl}
        ogType="profile"
        ogImage={dog.imageUrl ? `https://heylola.co${dog.imageUrl}` : undefined}
        breadcrumbs={breadcrumbs}
        jsonLd={personSchema({
          name: dog.name,
          role: `Rescue dog · ${dog.partnerName}`,
          image: dog.imageUrl ?? '/og-image.png',
          url: dog.passport.publicUrl,
          description: dog.description,
        })}
      />

      {/* Header */}
      <section className="bg-stone-50 border-b border-stone-100 pt-10 pb-12 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft size={12} /> Rescue Dogs
          </button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center"
          >
            <div className="md:col-span-2 flex justify-center">
              <div className="aspect-square w-full max-w-sm rounded-[2rem] bg-white border border-stone-100 overflow-hidden flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                {dog.imageUrl ? (
                  <img src={dog.imageUrl} alt={dog.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-7xl">🐶</span>
                )}
              </div>
            </div>
            <div className="md:col-span-3 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-charcoal bg-white border border-stone-200 px-2.5 py-1 rounded-full">
                  <ShieldCheck size={10} className="text-[#7A8C6E]" /> Verified by Hey Lola Foundation
                </span>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-[#7A8C6E] bg-[#EBF1E9] px-2.5 py-1 rounded-full">
                  {capitalize(dog.status)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                  {dog.partnerName}
                </span>
              </div>
              <h1 id="passport-heading" className="text-5xl sm:text-6xl md:text-7xl font-serif italic tracking-tight leading-[0.9]">
                Meet {dog.name}<span className="text-brand-orange">.</span>
              </h1>
              <p className="text-base sm:text-lg text-stone-500 font-light italic leading-snug max-w-md">
                A rescue dog looking for the right home through Hey Lola Foundation.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInterest(true)}
                  className="luxury-button bg-charcoal text-white h-11 px-6 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-charcoal/80 inline-flex items-center gap-2"
                >
                  <Heart size={13} /> I'm interested
                </button>
                {dog.sourceUrl && (
                  <a
                    href={dog.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="luxury-button border border-stone-200 text-stone-600 hover:text-charcoal hover:border-charcoal h-11 px-6 text-[10px] font-black tracking-[0.3em] uppercase inline-flex items-center gap-2"
                  >
                    <ExternalLink size={13} /> View official {dog.partnerName} profile
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Identity + Rescue profile */}
      <section className="py-12 px-5 sm:px-6 max-w-5xl mx-auto" aria-labelledby="identity-heading">
        <header className="mb-6 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Rescue Passport</span>
          <h2 id="identity-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
            Identity<span className="text-brand-orange">.</span>
          </h2>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <IdRow label="Name" value={dog.name} />
          <IdRow label="Sex" value={capitalize(dog.sex)} />
          {dog.ageLabel && <IdRow label="Age" value={dog.ageLabel} />}
          {dog.breed && <IdRow label="Breed" value={dog.breed} />}
          {typeof dog.weightKg === 'number' && <IdRow label="Weight" value={`${dog.weightKg} kg`} />}
          {dog.location && <IdRow label="Location" value={dog.location} />}
          <IdRow label="Source partner" value={dog.partnerName} />
          {dog.sourceUrl && (
            <IdRow
              label="Source"
              value={
                <a href={dog.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-stone-300 underline-offset-4 hover:decoration-charcoal">
                  Official page <ExternalLink size={10} className="inline-block ml-1" />
                </a>
              }
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <article className="rounded-2xl border border-stone-100 bg-stone-50 p-5 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">About {dog.name}</p>
            <p className="text-sm text-stone-600 font-light leading-relaxed">{dog.description}</p>
          </article>
          {(dog.specialCareNotes || typeof dog.adoptionFeeUsd === 'number') && (
            <article className="rounded-2xl border border-stone-100 bg-stone-50 p-5 space-y-3">
              {dog.specialCareNotes && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Special care</p>
                  <p className="text-sm text-stone-600 font-light leading-relaxed italic">{dog.specialCareNotes}</p>
                </div>
              )}
              {typeof dog.adoptionFeeUsd === 'number' && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Adoption fee</p>
                  <p className="text-sm text-charcoal/80 font-serif italic">${dog.adoptionFeeUsd} (via {dog.partnerName})</p>
                </div>
              )}
              {dog.lastSyncedAt && (
                <div className="space-y-1 pt-1 border-t border-stone-200">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Last updated</p>
                  <p className="text-xs text-stone-500 italic">{dog.lastSyncedAt}</p>
                </div>
              )}
            </article>
          )}
        </div>
      </section>

      {/* Trust */}
      <section className="bg-stone-50 border-y border-stone-100 py-12 px-5 sm:px-6" aria-labelledby="trust-heading">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
              <ShieldCheck size={11} /> Trust layer
            </span>
            <h2 id="trust-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              Verified by Hey Lola Foundation<span className="text-brand-orange">.</span>
            </h2>
            <p className="text-sm text-stone-500 font-light italic leading-relaxed max-w-2xl">
              This rescue passport helps animal lovers discover verified foundation partners and express interest in dogs looking for a home.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <TrustTile label="Partner" value={dog.partnerName} />
            <TrustTile
              label="Source"
              value={
                dog.sourceUrl ? (
                  <a href={dog.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-stone-300 underline-offset-4 hover:decoration-charcoal">
                    Official adoption page
                  </a>
                ) : (
                  '—'
                )
              }
            />
            <TrustTile label="Last synced" value={dog.lastSyncedAt ?? '—'} />
            <TrustTile label="Passport created" value={dog.passport.createdAt.slice(0, 10)} />
          </div>
        </div>
      </section>

      {/* Interest CTA */}
      <section className="py-14 px-5 sm:px-6" aria-labelledby="interest-heading">
        <div className="max-w-3xl mx-auto rounded-[2rem] bg-charcoal text-white p-8 sm:p-10 space-y-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.04),transparent_60%)]" />
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 inline-flex items-center gap-2">
              <Heart size={11} /> Interest
            </span>
            <h2 id="interest-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              Could this be your dog<span className="text-brand-orange">?</span>
            </h2>
            <p className="text-sm sm:text-base text-stone-400 font-light italic leading-relaxed max-w-xl">
              Tell us you are interested and we'll help you continue through the official foundation partner process.
            </p>
            <button
              type="button"
              onClick={() => setShowInterest(true)}
              className="luxury-button bg-white text-charcoal h-12 px-8 text-[11px] font-black tracking-[0.25em] uppercase hover:bg-stone-100 transition-colors inline-flex items-center gap-2"
            >
              I'm interested <ArrowRight size={13} />
            </button>
            <p className="text-[11px] text-white/40 italic max-w-xl pt-2">
              This is not an adoption application. Final adoption steps and adoption decisions are managed directly by the rescue partner.
            </p>
          </div>
        </div>
      </section>

      {/* Share */}
      <section className="px-5 sm:px-6 pb-16" aria-labelledby="share-heading">
        <div className="max-w-3xl mx-auto rounded-[2rem] bg-white border border-stone-100 p-6 sm:p-8 space-y-5">
          <header className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
              <Share2 size={11} /> Share {dog.name}'s passport
            </span>
            <h2 id="share-heading" className="text-xl sm:text-2xl font-serif italic tracking-tight">
              Help {dog.name} find their home<span className="text-brand-orange">.</span>
            </h2>
          </header>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-charcoal text-white px-4 h-10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] hover:bg-charcoal/80 transition-colors"
            >
              <Share2 size={12} /> Share
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 border border-stone-200 text-stone-600 hover:text-charcoal hover:border-charcoal px-4 h-10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy link'}
            </button>
            <a
              href={whatsappShareUrl(dog.name, url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-stone-200 text-stone-600 hover:text-charcoal hover:border-charcoal px-4 h-10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-colors"
            >
              <MessageCircle size={12} /> WhatsApp
            </a>
            <a
              href={emailShareUrl(dog.name, url)}
              className="inline-flex items-center gap-2 border border-stone-200 text-stone-600 hover:text-charcoal hover:border-charcoal px-4 h-10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-colors"
            >
              <Mail size={12} /> Email
            </a>
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="inline-flex items-center gap-2 border border-stone-200 text-stone-600 hover:text-charcoal hover:border-charcoal px-4 h-10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-colors"
            >
              <QrCode size={12} /> QR code
            </button>
          </div>
        </div>
      </section>

      {showInterest && (
        <InterestModal dog={dog} onClose={() => setShowInterest(false)} />
      )}
      {showQr && (
        <QrModal dog={dog} url={url} onClose={() => setShowQr(false)} />
      )}
    </main>
  );
};

function IdRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-100 bg-white p-3 space-y-1">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400">{label}</p>
      <p className="text-sm text-charcoal font-light leading-snug">{value}</p>
    </div>
  );
}

function TrustTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 space-y-1">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400">{label}</p>
      <p className="text-sm text-charcoal font-serif italic leading-snug">{value}</p>
    </div>
  );
}

function NotFound({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <main className="bg-white min-h-screen flex items-center justify-center px-5">
      <div className="max-w-md text-center space-y-5 font-boutique">
        <h1 className="text-3xl font-serif italic">This passport isn't available.</h1>
        <p className="text-sm text-stone-500 italic font-light">The dog may already be home, or the passport may be paused for review.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onBack} className="luxury-button border border-stone-200 text-stone-600 h-11 px-6 text-[10px] font-black tracking-[0.3em] uppercase hover:text-charcoal hover:border-charcoal">Back</button>
          <button onClick={onContinue} className="luxury-button bg-charcoal text-white h-11 px-6 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-charcoal/80">See other dogs</button>
        </div>
      </div>
    </main>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── Interest modal ─────────────────────────────────────────────── */

function InterestModal({ dog, onClose }: { dog: FoundationDog; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedEmail = email.trim();
  const valid =
    name.trim().length > 1 &&
    trimmedEmail.length > 3 &&
    trimmedEmail.includes('@') &&
    trimmedEmail.indexOf('.', trimmedEmail.indexOf('@')) > -1 &&
    agree;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, 'foundation_interests'), {
        dogId: dog.id,
        dogName: dog.name,
        dogSlug: dog.passport.slug,
        partnerId: dog.partnerId,
        partnerName: dog.partnerName,
        contact: { name, email, phone },
        message,
        source: 'rescue_passport',
        status: 'new',
        createdAt: serverTimestamp(),
      });
      // Fire-and-forget notification (confirmation to submitter + admin alert).
      // The endpoint re-reads the doc via the Admin SDK so it cannot be spoofed.
      void fetch('/api/notify-foundation-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interestId: docRef.id }),
      }).catch(() => { /* email is best-effort */ });
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm" role="dialog" aria-modal="true">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-white w-full max-w-lg rounded-[1.5rem] p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto font-boutique"
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-stone-400 hover:text-charcoal">
          <X size={18} />
        </button>
        {submitted ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#EBF1E9] text-[#7A8C6E] flex items-center justify-center">
              <Check size={22} />
            </div>
            <h3 className="text-2xl font-serif italic">We've passed it along<span className="text-brand-orange">.</span></h3>
            <p className="text-sm text-stone-500 font-light italic leading-relaxed">
              We will help you continue through the official {dog.partnerName} adoption process. Final adoption decisions are managed directly by the rescue partner.
            </p>
            <button onClick={onClose} className="luxury-button bg-charcoal text-white h-11 px-6 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-charcoal/80 mt-3">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Express interest</span>
              <h3 className="text-2xl sm:text-3xl font-serif italic leading-tight">Could {dog.name} be your dog?</h3>
              <p className="text-xs text-stone-500 italic font-light leading-relaxed">
                This is not an adoption application. We'll help you continue through {dog.partnerName}'s official process.
              </p>
            </div>
            <Field label="Your name">
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adriana" className="luxury-input h-11 w-full text-sm" />
            </Field>
            <Field label="Email">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="luxury-input h-11 w-full text-sm" />
            </Field>
            <Field label="Phone" optional>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 305 …" className="luxury-input h-11 w-full text-sm" />
            </Field>
            <Field label="A few words about your home" optional>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Family, other dogs, schedule, lifestyle…" className="luxury-input p-3 h-24 w-full text-sm resize-none" />
            </Field>
            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 w-4 h-4 accent-charcoal" />
              <span className="text-xs text-stone-600 leading-relaxed">
                I understand this is not an adoption application. Final adoption steps and decisions are managed directly by the rescue partner.
              </span>
            </label>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={!valid || submitting}
              className="luxury-button bg-charcoal text-white h-12 w-full text-[11px] font-black tracking-[0.3em] uppercase hover:bg-charcoal/80 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              I'm interested
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
        {label}
        {optional && <span className="text-stone-300 normal-case font-light italic ml-1">— optional</span>}
      </span>
      {children}
    </label>
  );
}

/* ── QR modal ─────────────────────────────────────────────────────── */

function QrModal({ dog, url, onClose }: { dog: FoundationDog; url: string; onClose: () => void }) {
  const qr = qrCodeUrl(url, 600);
  const filename = `heylola-passport-${dog.passport.slug}.png`;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-md rounded-[1.5rem] p-6 sm:p-8 relative font-boutique">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-stone-400 hover:text-charcoal">
          <X size={18} />
        </button>
        <div className="text-center space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2 justify-center">
            <QrCode size={11} /> Passport QR
          </span>
          <h3 className="text-2xl font-serif italic leading-tight">Scan to meet {dog.name}<span className="text-brand-orange">.</span></h3>
          <p className="text-xs text-stone-500 italic font-light max-w-xs mx-auto">
            Use this QR on flyers, stickers and adoption cards. Scanning opens {dog.name}'s rescue passport.
          </p>
          <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4 inline-block">
            <img src={qr} alt={`QR code for ${dog.name}'s rescue passport`} className="w-56 h-56" />
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={qr}
              download={filename}
              className="luxury-button bg-charcoal text-white h-11 px-6 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-charcoal/80 inline-flex items-center justify-center gap-2"
            >
              Download QR PNG
            </a>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 break-all">
              {url}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
