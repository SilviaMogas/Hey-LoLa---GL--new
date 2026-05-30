import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Heart,
  Mail,
  MessageCircle,
  QrCode,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  type FoundationHorse,
  countryLabel,
  rowToFoundationHorse,
} from '../data/foundationHorses';
import {
  copyToClipboard,
  emailShareUrl,
  qrCodeUrl,
  tryNativeShare,
  whatsappShareUrl,
} from '../lib/passportShare';
import { SEO, personSchema } from '../lib/seo';

interface HeyKaiHorsePassportProps {
  slug: string;
  onBack: () => void;
  onNotFound: () => void;
}

// Grass-green palette — sister to Hey Lola sage but unmistakably HeyKai.
const GRASS = '#6E8C5D';
const GRASS_TINT = '#F4F8EF';
const GRASS_SOFT_BORDER = '#e2ead9';

function passportUrl(slug: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/heykai/horses/${slug}`;
  }
  return `https://heylola.co/heykai/horses/${slug}`;
}

export const HeyKaiHorsePassport: React.FC<HeyKaiHorsePassportProps> = ({ slug, onBack, onNotFound }) => {
  const [horse, setHorse] = useState<FoundationHorse | null | undefined>(undefined);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        // Try slug column first (populated by the scraper), then fall back
        // to the passport->>slug JSONB path for parity with foundation_dogs.
        let row: Record<string, unknown> | null = null;
        const { data: bySlug } = await supabase
          .from('foundation_horses')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        row = (bySlug as Record<string, unknown> | null) ?? null;
        if (!row) {
          const { data: byPassport } = await supabase
            .from('foundation_horses')
            .select('*')
            .eq('passport->>slug', slug)
            .maybeSingle();
          row = (byPassport as Record<string, unknown> | null) ?? null;
        }
        setHorse(row ? rowToFoundationHorse(row) : null);
      } catch {
        setHorse(null);
      }
    })();
  }, [slug]);

  if (horse === undefined) {
    return <main className="bg-white min-h-screen" aria-busy="true" />;
  }
  if (!horse) {
    return <NotFound onBack={onBack} onContinue={onNotFound} />;
  }
  if (horse.passport.visibility !== 'public' || horse.status !== 'available') {
    return <NotFound onBack={onBack} onContinue={onNotFound} />;
  }

  const url = passportUrl(horse.passport.slug);
  const breadcrumbs = [
    { name: 'Hey Lola', item: '/' },
    { name: 'HeyKai Foundation', item: '/heykai' },
    { name: 'Horses', item: '/heykai/horses' },
    { name: horse.name, item: horse.passport.publicUrl },
  ];

  const handleShare = async () => {
    const sent = await tryNativeShare(horse.name, url);
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
        title={`Meet ${horse.name} — ${horse.partnerName} · HeyKai Foundation`}
        description={`Rescue passport for ${horse.name} via ${horse.partnerName}. ${horse.description}`}
        url={horse.passport.publicUrl}
        ogType="profile"
        ogImage={horse.imageUrl}
        breadcrumbs={breadcrumbs}
        jsonLd={personSchema({
          name: horse.name,
          role: `Rescue horse · ${horse.partnerName}`,
          image: horse.imageUrl ?? '/og-image.png',
          url: horse.passport.publicUrl,
          description: horse.description,
        })}
      />

      {/* Header */}
      <section className="border-b border-stone-100 pt-10 pb-12 px-5 sm:px-6" style={{ background: GRASS_TINT }}>
        <div className="max-w-5xl mx-auto space-y-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft size={12} /> Horses
          </button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center"
          >
            <div className="md:col-span-2 flex justify-center">
              <div className="aspect-square w-full max-w-sm rounded-[2rem] bg-white border border-stone-100 overflow-hidden flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                {horse.imageUrl ? (
                  <img src={horse.imageUrl} alt={horse.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl" aria-hidden="true">🐴</span>
                )}
              </div>
            </div>
            <div className="md:col-span-3 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full"
                  style={{ background: 'white', color: GRASS, border: `1px solid ${GRASS_SOFT_BORDER}` }}
                >
                  <ShieldCheck size={10} /> Verified by HeyKai Foundation
                </span>
                <span
                  className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full"
                  style={{ background: 'white', color: GRASS, border: `1px solid ${GRASS_SOFT_BORDER}` }}
                >
                  {capitalize(horse.status)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-stone-500 bg-white border border-stone-200 px-2.5 py-1 rounded-full">
                  {horse.partnerName}
                </span>
              </div>
              <h1 id="passport-heading" className="text-5xl sm:text-6xl md:text-7xl font-serif italic tracking-tight leading-[0.9]">
                Meet {horse.name}
                <span
                  aria-hidden="true"
                  className="inline-block ml-2"
                  style={{ width: '0.18em', height: '0.18em', background: GRASS, verticalAlign: 'baseline' }}
                />
              </h1>
              <p className="text-base sm:text-lg text-stone-500 font-light italic leading-snug max-w-md">
                A rescue horse looking for the right adopter through HeyKai Foundation.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {horse.sourceUrl && (
                  <a
                    href={horse.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-11 px-6 text-[10px] font-black tracking-[0.3em] uppercase rounded-full text-white hover:opacity-90 transition-opacity"
                    style={{ background: GRASS }}
                  >
                    <Heart size={13} /> Adopt at {horse.partnerName}
                  </a>
                )}
                {horse.sourceUrl && (
                  <a
                    href={horse.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-11 px-6 text-[10px] font-black tracking-[0.3em] uppercase rounded-full border border-stone-200 text-stone-600 hover:text-charcoal hover:border-charcoal transition-colors bg-white"
                  >
                    <ExternalLink size={13} /> View official listing
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Identity */}
      <section className="py-12 px-5 sm:px-6 max-w-5xl mx-auto" aria-labelledby="identity-heading">
        <header className="mb-6 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Rescue Passport</span>
          <h2 id="identity-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
            Identity
            <span
              aria-hidden="true"
              className="inline-block ml-2"
              style={{ width: '0.22em', height: '0.22em', background: GRASS, verticalAlign: 'baseline' }}
            />
          </h2>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <IdRow label="Name" value={horse.name} />
          {horse.sex !== 'unknown' && <IdRow label="Sex" value={capitalize(horse.sex)} />}
          {horse.ageLabel && <IdRow label="Age" value={horse.ageLabel} />}
          {horse.breed && <IdRow label="Breed" value={horse.breed} />}
          {typeof horse.heightHands === 'number' && (
            <IdRow label="Height" value={`${horse.heightHands} hh`} />
          )}
          {horse.discipline && <IdRow label="Discipline" value={capitalize(horse.discipline)} />}
          {horse.location && <IdRow label="Location" value={horse.location} />}
          {horse.partnerCountry && (
            <IdRow label="Country" value={countryLabel(horse.partnerCountry)} />
          )}
          <IdRow label="Source partner" value={horse.partnerName} />
          {horse.sourceUrl && (
            <IdRow
              label="Source"
              value={
                <a
                  href={horse.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-stone-300 underline-offset-4 hover:decoration-charcoal"
                >
                  Official page <ExternalLink size={10} className="inline-block ml-1" />
                </a>
              }
            />
          )}
        </div>

        {horse.description && (
          <div className="mt-8 rounded-2xl border border-stone-100 p-5 space-y-2" style={{ background: GRASS_TINT }}>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">About {horse.name}</p>
            <p className="text-sm text-stone-600 font-light leading-relaxed">{horse.description}</p>
          </div>
        )}
      </section>

      {/* Trust */}
      <section className="border-y border-stone-100 py-12 px-5 sm:px-6" style={{ background: GRASS_TINT }} aria-labelledby="trust-heading">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
              <ShieldCheck size={11} /> Trust layer
            </span>
            <h2 id="trust-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              Verified by HeyKai Foundation
              <span
                aria-hidden="true"
                className="inline-block ml-2"
                style={{ width: '0.22em', height: '0.22em', background: GRASS, verticalAlign: 'baseline' }}
              />
            </h2>
            <p className="text-sm text-stone-500 font-light italic leading-relaxed max-w-2xl">
              This passport surfaces a horse from a verified rescue partner. Final adoption decisions are managed directly by {horse.partnerName}.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <TrustTile label="Partner" value={horse.partnerName} />
            <TrustTile label="Country" value={horse.partnerCountry ? countryLabel(horse.partnerCountry) : '—'} />
            <TrustTile
              label="Source"
              value={
                horse.sourceUrl ? (
                  <a
                    href={horse.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-stone-300 underline-offset-4 hover:decoration-charcoal"
                  >
                    Official adoption page
                  </a>
                ) : (
                  '—'
                )
              }
            />
            <TrustTile label="Passport created" value={horse.passport.createdAt.slice(0, 10) || '—'} />
          </div>
        </div>
      </section>

      {/* Adopt CTA */}
      {horse.sourceUrl && (
        <section className="py-14 px-5 sm:px-6" aria-labelledby="adopt-heading">
          <div
            className="max-w-3xl mx-auto rounded-[2rem] text-white p-8 sm:p-10 space-y-5 relative overflow-hidden"
            style={{ background: GRASS }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.12), transparent 60%)' }}
            />
            <div className="relative z-10 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 inline-flex items-center gap-2">
                <Heart size={11} /> Adopt
              </span>
              <h2 id="adopt-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
                Could this be your horse?
              </h2>
              <p className="text-sm sm:text-base text-white/80 font-light italic leading-relaxed max-w-xl">
                {horse.partnerName} handles every adoption directly — health checks, home visits, contracts. Open their official listing to start the conversation.
              </p>
              <a
                href={horse.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-charcoal h-10 px-8 text-[11px] font-black tracking-[0.25em] uppercase rounded-full hover:bg-stone-100 transition-colors"
              >
                Adopt at {horse.partnerName} <ArrowRight size={13} />
              </a>
              <p className="text-[11px] text-white/60 italic max-w-xl pt-2">
                HeyKai surfaces rescue listings. We don't operate the adoption process and don't take a fee.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Share */}
      <section className="px-5 sm:px-6 pb-16" aria-labelledby="share-heading">
        <div className="max-w-3xl mx-auto rounded-[2rem] bg-white border border-stone-100 p-6 sm:p-8 space-y-5">
          <header className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">
              <Share2 size={11} /> Share {horse.name}'s passport
            </span>
            <h2 id="share-heading" className="text-xl sm:text-2xl font-serif italic tracking-tight">
              Help {horse.name} find their home
              <span
                aria-hidden="true"
                className="inline-block ml-2"
                style={{ width: '0.16em', height: '0.16em', background: GRASS, verticalAlign: 'baseline' }}
              />
            </h2>
          </header>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-white px-4 h-10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] hover:opacity-90 transition-opacity"
              style={{ background: GRASS }}
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
              href={whatsappShareUrl(horse.name, url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-stone-200 text-stone-600 hover:text-charcoal hover:border-charcoal px-4 h-10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-colors"
            >
              <MessageCircle size={12} /> WhatsApp
            </a>
            <a
              href={emailShareUrl(horse.name, url)}
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

      {showQr && <QrModal horse={horse} url={url} onClose={() => setShowQr(false)} />}
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
        <p className="text-sm text-stone-500 italic font-light">
          The horse may have been adopted, or the passport may be paused for review.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onBack}
            className="h-11 px-6 text-[10px] font-black tracking-[0.3em] uppercase rounded-full border border-stone-200 text-stone-600 hover:text-charcoal hover:border-charcoal transition-colors"
          >
            Back
          </button>
          <button
            onClick={onContinue}
            className="h-11 px-6 text-[10px] font-black tracking-[0.3em] uppercase rounded-full text-white hover:opacity-90 transition-opacity"
            style={{ background: GRASS }}
          >
            See other horses
          </button>
        </div>
      </div>
    </main>
  );
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function QrModal({ horse, url, onClose }: { horse: FoundationHorse; url: string; onClose: () => void }) {
  const qr = qrCodeUrl(url, 600);
  const filename = `heykai-passport-${horse.passport.slug}.png`;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-md rounded-[1.5rem] p-6 sm:p-8 relative font-boutique">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-stone-400 hover:text-charcoal"
        >
          <X size={18} />
        </button>
        <div className="text-center space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2 justify-center">
            <QrCode size={11} /> Passport QR
          </span>
          <h3 className="text-2xl font-serif italic leading-tight">
            Scan to meet {horse.name}
            <span
              aria-hidden="true"
              className="inline-block ml-2"
              style={{ width: '0.18em', height: '0.18em', background: GRASS, verticalAlign: 'baseline' }}
            />
          </h3>
          <p className="text-xs text-stone-500 italic font-light max-w-xs mx-auto">
            Use this QR on flyers and adoption cards. Scanning opens {horse.name}'s rescue passport.
          </p>
          <div className="rounded-2xl border border-stone-100 p-4 inline-block" style={{ background: GRASS_TINT }}>
            <img src={qr} alt={`QR code for ${horse.name}'s rescue passport`} className="w-56 h-56" />
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={qr}
              download={filename}
              className="h-11 px-6 text-[10px] font-black tracking-[0.3em] uppercase rounded-full text-white hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
              style={{ background: GRASS }}
            >
              Download QR PNG
            </a>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 break-all">{url}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
