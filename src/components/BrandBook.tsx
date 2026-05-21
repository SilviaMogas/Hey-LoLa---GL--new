import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CONCIERGES, POSE_COUNT, type ConciergeProfile } from '../data/concierges';
import { ConciergeAvatar } from './ConciergeAvatar';
import { SEO, personSchema } from '../lib/seo';

const BRAND_BOOK_BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'Brand Book', item: '/brand-book' },
];

interface BrandBookProps {
  onBack: () => void;
  onOpenCharacter: (id: ConciergeProfile['id']) => void;
}

const PALETTE = [
  { name: 'Background', hex: '#FFFFFF', role: 'Primary surfaces' },
  { name: 'Foreground', hex: '#0A0A0A', role: 'Text & wordmark' },
  { name: 'Warm Accent', hex: '#F28C33', role: 'Brand orange accent' },
  { name: 'Sage', hex: '#6E8C5D', role: 'Secondary accent' },
  { name: 'Bone', hex: '#F5F0E8', role: 'Warm surfaces' },
  { name: 'Muted', hex: '#A8A29E', role: 'Muted text' },
];

interface LogoVariant {
  label: string;
  surface: string;
  textTone: 'black' | 'white' | 'orange';
  mark?: boolean;
  /** Transparent-background preview — renders a checkerboard so the
      transparency reads, and the SVG/PNG export keeps no fill. */
  transparent?: boolean;
}

const LOGO_VARIANTS: LogoVariant[] = [
  { label: 'On Light',     surface: 'bg-white',    textTone: 'black' },
  { label: 'On Dark',      surface: 'bg-charcoal', textTone: 'white' },
  { label: 'Transparent',  surface: 'bg-white',    textTone: 'black', transparent: true },
];

const ICON_VARIANTS: LogoVariant[] = [
  { label: 'Icon · On Light', surface: 'bg-white',    textTone: 'black', mark: true },
  { label: 'Icon · On Dark',  surface: 'bg-charcoal', textTone: 'white', mark: true },
  { label: 'Icon · Accent',   surface: 'bg-bone',     textTone: 'orange', mark: true },
];

interface MascotAsset {
  label: string;
  src: string;
  surface: string;
  transparent?: boolean;
  dark?: boolean;
}

// Mascot + wordmark lockups. PNGs live in /public/brand and are exported
// from the master illustration (see brand-assets/).
const MASCOT_ASSETS: MascotAsset[] = [
  { label: 'Transparent',   src: '/brand/heylola-mascot-transparent.png', surface: 'bg-white',    transparent: true },
  { label: 'On Light',      src: '/brand/heylola-mascot-white.png',       surface: 'bg-white' },
  { label: 'On Dark',       src: '/brand/heylola-mascot-black.png',       surface: 'bg-charcoal', dark: true },
  { label: 'On Dark · Card', src: '/brand/heylola-mascot-black-card.png', surface: 'bg-charcoal', dark: true },
];

export const BrandBook: React.FC<BrandBookProps> = ({ onBack, onOpenCharacter }) => {
  return (
    <main className="bg-white page-shell font-boutique text-charcoal" aria-labelledby="brandbook-heading">
      <SEO
        title="Hey Lola Brand Kit — Logos, Colours, Typography & Concierges"
        description="Official brand assets and usage guidelines for Hey Lola, a boutique lifestyle concierge for dog parents. Download the logo, browse the palette and meet the four concierges."
        url="/brand-book"
        breadcrumbs={BRAND_BOOK_BREADCRUMBS}
      />
      {/* Hero */}
      <section className="relative bg-charcoal overflow-hidden pt-14 pb-12 px-5 sm:px-6" aria-labelledby="brandbook-heading">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative z-10 space-y-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
            aria-label="Go back"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">Brand Kit</span>
            <h1 id="brandbook-heading" className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9] text-white">
              Hey Lola Brand Kit<span className="brand-dot" aria-hidden="true" />
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug max-w-2xl">
              Official brand assets and usage guidelines for Hey Lola — a boutique lifestyle concierge for dog parents.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Logo + Wordmark */}
      <section id="logos" aria-labelledby="logos-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Logo + Wordmark</span>
          <h2 id="logos-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
            The HeyLola wordmark<span className="brand-dot" aria-hidden="true" />
          </h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {LOGO_VARIANTS.map((v) => (
            <LogoTile key={v.label} variant={v} />
          ))}
        </div>

        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mt-12 mb-4">Icon Only</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ICON_VARIANTS.map((v) => (
            <LogoTile key={v.label} variant={v} />
          ))}
        </div>

        {/* Mascot + Logo */}
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mt-12 mb-1">Mascot + Logo</h3>
        <p className="text-sm text-stone-500 font-light italic leading-relaxed max-w-2xl mb-4">
          Lola, our mascot, paired with the wordmark. Use the transparent version over photography, the light version on white surfaces and the dark version on charcoal.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MASCOT_ASSETS.map((m) => (
            <MascotTile key={m.label} asset={m} />
          ))}
        </div>
      </section>

      {/* Color Palette */}
      <section id="colors" aria-labelledby="colors-heading" className="py-14 sm:py-16 px-5 sm:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Color Palette</span>
            <h2 id="colors-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              A warm, editorial palette<span className="brand-dot" aria-hidden="true" />
            </h2>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PALETTE.map((c) => (
              <div key={c.hex} className="space-y-2">
                <div
                  className={`aspect-square rounded-2xl border ${c.hex === '#FFFFFF' ? 'border-stone-200' : 'border-transparent'} shadow-sm`}
                  style={{ background: c.hex }}
                  aria-label={`${c.name} swatch, ${c.hex}`}
                />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{c.name}</p>
                  <p className="text-sm font-serif italic text-charcoal">{c.hex}</p>
                  <p className="text-[11px] text-stone-500 italic font-light leading-snug">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typography */}
      <section id="typography" aria-labelledby="type-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Typography</span>
          <h2 id="type-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
            Two typefaces, one voice<span className="brand-dot" aria-hidden="true" />
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="rounded-2xl border border-stone-100 bg-white p-7">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Display Font</span>
            <p className="text-4xl sm:text-5xl font-serif italic mt-3 leading-none">Hey Lola.</p>
            <p className="text-base font-serif italic text-charcoal/70 mt-4">Editorial Serif</p>
            <p className="text-sm text-stone-500 font-light italic leading-relaxed mt-2">
              Used for large headlines, taglines and editorial statements. Always set in italic.
            </p>
          </article>

          <article className="rounded-2xl border border-stone-100 bg-white p-7">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Body Font</span>
            <p className="text-2xl font-boutique mt-3 leading-snug">A boutique lifestyle concierge for life with your dog.</p>
            <p className="text-base font-boutique text-charcoal/70 mt-4">Boutique Sans</p>
            <p className="text-sm text-stone-500 font-light italic leading-relaxed mt-2">
              Used for body text, navigation and UI elements. Wide letter-spacing for uppercase labels.
            </p>
          </article>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section id="usage" aria-labelledby="usage-heading" className="py-14 sm:py-16 px-5 sm:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Usage Guidelines</span>
            <h2 id="usage-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              How to use the brand<span className="brand-dot" aria-hidden="true" />
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Clear Space', body: 'Maintain a minimum clear space equal to the height of the "H" in "Hey" around all logo variations.' },
              { title: 'Minimum Size', body: 'The full wordmark should not be displayed smaller than 120px wide. The icon-only mark minimum is 32px.' },
              { title: 'Background', body: 'Use the light variant on light backgrounds and the dark variant on dark backgrounds. Never place the logo on busy imagery — use the cream surface or a charcoal block instead.' },
              { title: 'Modification', body: 'Do not stretch, rotate, recolor, or add effects to the logo. Use only the provided variations. The trailing period stays orange — always.' },
            ].map((g) => (
              <article key={g.title} className="rounded-2xl bg-white border border-stone-100 p-6 space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{g.title}</h3>
                <p className="text-sm text-stone-600 font-light leading-relaxed">{g.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Concierges */}
      <section id="concierges" aria-labelledby="concierges-heading" className="py-14 sm:py-16 px-5 sm:px-6 max-w-7xl mx-auto">
        <header className="mb-10 space-y-2 max-w-2xl">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Concierges</span>
          <h2 id="concierges-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">The four concierges<span className="brand-dot" aria-hidden="true" /></h2>
          <p className="text-sm text-stone-500 font-light italic leading-relaxed">
            Each concierge has a personality, a role and a full pose pack. Tap any face to open their dedicated page.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CONCIERGES.map((c) => {
            if (!c.revealed) {
              return (
                <article
                  key={c.id}
                  className="relative flex flex-col h-full rounded-[2rem] bg-stone-50 border border-dashed border-stone-200 overflow-hidden"
                  aria-label={`Concierge starting with ${c.name[0]} — coming soon`}
                >
                  <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200/60 flex items-center justify-center relative overflow-hidden">
                    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-[9rem] font-serif italic text-stone-300/40 select-none blur-[2px]">?</span>
                    <span className="relative text-7xl font-serif italic text-stone-400 select-none tracking-tight">{c.name[0]}…</span>
                    <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-[0.3em] bg-white/80 backdrop-blur text-stone-500 rounded-full px-2.5 py-1 border border-stone-100">
                      Coming soon
                    </span>
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="text-2xl font-serif italic tracking-tight leading-none text-stone-500">{c.name[0]}…</h3>
                    <p className="text-[11px] text-stone-400 italic">A new face joining the pack soon.</p>
                  </div>
                </article>
              );
            }
            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => onOpenCharacter(c.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative flex flex-col h-full rounded-[2rem] bg-white border border-stone-100 overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
                aria-label={`Open ${c.name}'s page — ${c.role}`}
              >
                <div className={`aspect-square ${c.color} flex items-center justify-center relative overflow-hidden`}>
                  <ConciergeAvatar
                    id={c.id}
                    poseIndex={1}
                    rounded="none"
                    alt={`${c.name} — ${c.role}`}
                    className="relative z-10 w-full h-full !object-contain group-hover:scale-110 transition-all duration-700"
                  />
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-2xl font-serif italic tracking-tight leading-none">{c.name}</h3>
                  <p className="text-[11px] text-stone-400 italic">{c.role}</p>
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-charcoal inline-flex items-center gap-1 pt-3">
                    Open page <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Footer back link */}
      <section className="py-12 px-5 sm:px-6 text-center border-t border-stone-100">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-charcoal transition-colors"
        >
          <ArrowLeft size={12} /> Back to Hey Lola
        </button>
      </section>
    </main>
  );
};

function LogoTile({ variant }: { variant: LogoVariant }) {
  const isDark = variant.surface.includes('charcoal');
  const logoRef = React.useRef<HTMLDivElement | null>(null);
  const filenameBase = `heylola-${variant.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  const downloadPng = async () => {
    const node = logoRef.current?.querySelector('svg');
    if (!node) return;
    const clone = node.cloneNode(true) as SVGSVGElement;
    if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const xml = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Target 2048px on the longest side for retina sharpness
      const target = 2048;
      const ratio = img.width / img.height;
      const w = ratio >= 1 ? target : target * ratio;
      const h = ratio >= 1 ? target / ratio : target;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); return; }
      if (isDark) {
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) { URL.revokeObjectURL(url); return; }
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${filenameBase}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); };
    img.src = url;
  };

  const pillClass = isDark
    ? 'bg-white/10 text-white/70 hover:bg-white/20'
    : 'bg-charcoal/5 text-stone-500 hover:bg-charcoal/10';

  return (
    <article className={`rounded-2xl ${variant.surface} border ${isDark ? 'border-white/10' : 'border-stone-200'} flex flex-col aspect-[16/10] relative overflow-hidden`}>
      {variant.transparent && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundColor: '#fff',
            backgroundImage:
              'linear-gradient(45deg,#eceae6 25%,transparent 25%),linear-gradient(-45deg,#eceae6 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eceae6 75%),linear-gradient(-45deg,transparent 75%,#eceae6 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0,0 10px,10px -10px,-10px 0',
          }}
        />
      )}
      <div className="flex-1 flex items-center justify-center px-5 py-5 sm:px-6 sm:py-6 min-h-0 relative z-10">
        <div ref={logoRef} className="w-full flex items-center justify-center">
          <BrandLogo
            size="3xl"
            variant={variant.textTone}
            mark={variant.mark}
            className={variant.mark
              ? '!h-auto md:!h-auto w-[62%] max-w-[260px]'
              : '!h-auto md:!h-auto w-[94%] max-w-[640px]'}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1 relative z-10">
        <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-white/50' : 'text-stone-400'}`}>
          {variant.label}
        </span>
        <div className="flex items-center gap-1.5">
          <a
            href="/logo.svg"
            download={`${filenameBase}.svg`}
            className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full transition-colors ${pillClass}`}
            aria-label={`Download ${variant.label} SVG`}
          >
            <Download size={9} /> SVG
          </a>
          <button
            type="button"
            onClick={downloadPng}
            className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full transition-colors ${pillClass}`}
            aria-label={`Download ${variant.label} PNG`}
          >
            <Download size={9} /> PNG
          </button>
        </div>
      </div>
    </article>
  );
}

function MascotTile({ asset }: { asset: MascotAsset }) {
  const isDark = !!asset.dark;
  const filename = `heylola-mascot-${asset.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
  const pillClass = isDark
    ? 'bg-white/10 text-white/70 hover:bg-white/20'
    : 'bg-charcoal/5 text-stone-500 hover:bg-charcoal/10';
  return (
    <article className={`rounded-2xl ${asset.surface} border ${isDark ? 'border-white/10' : 'border-stone-200'} flex flex-col aspect-[4/5] relative overflow-hidden`}>
      {asset.transparent && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundColor: '#fff',
            backgroundImage:
              'linear-gradient(45deg,#eceae6 25%,transparent 25%),linear-gradient(-45deg,#eceae6 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eceae6 75%),linear-gradient(-45deg,transparent 75%,#eceae6 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0,0 10px,10px -10px,-10px 0',
          }}
        />
      )}
      <div className="flex-1 flex items-center justify-center px-5 py-6 min-h-0 relative z-10">
        <img
          src={asset.src}
          alt={`Hey Lola mascot with wordmark — ${asset.label}`}
          loading="lazy"
          className="w-auto h-full max-h-full object-contain"
        />
      </div>
      <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1 relative z-10">
        <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-white/50' : 'text-stone-400'}`}>
          {asset.label}
        </span>
        <a
          href={asset.src}
          download={filename}
          className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full transition-colors ${pillClass}`}
          aria-label={`Download mascot ${asset.label} PNG`}
        >
          <Download size={9} /> PNG
        </a>
      </div>
    </article>
  );
}

interface BrandBookCharacterProps {
  id: ConciergeProfile['id'];
  onBack: () => void;
  onOther: (id: ConciergeProfile['id']) => void;
}

export const BrandBookCharacter: React.FC<BrandBookCharacterProps> = ({ id, onBack, onOther }) => {
  const c = CONCIERGES.find((x) => x.id === id) ?? CONCIERGES[0];
  // The "meet the others" rail at the bottom only links to revealed concierges
  // (Coming-soon ones don't have a detail page yet).
  const others = CONCIERGES.filter((x) => x.id !== c.id && x.revealed);
  const characterBreadcrumbs = [
    { name: 'Hey Lola', item: '/' },
    { name: 'Brand Book', item: '/brand-book' },
    { name: c.name, item: `/brand-book/${c.id}` },
  ];
  const characterJsonLd = personSchema({
    name: c.name,
    role: c.role,
    image: `/${c.id}.png`,
    url: `/brand-book/${c.id}`,
    description: c.bio,
  });

  return (
    <main className="bg-white page-shell font-boutique text-charcoal" aria-labelledby={`concierge-${c.id}-heading`}>
      <SEO
        title={`${c.name} — ${c.role} | Hey Lola Concierges`}
        description={`${c.name} is one of the four Hey Lola concierges — ${c.role}. ${c.bio}`}
        url={`/brand-book/${c.id}`}
        ogType="profile"
        ogImage={`https://heylola.co/${c.id}.png`}
        breadcrumbs={characterBreadcrumbs}
        jsonLd={characterJsonLd}
      />
      {/* Ficha — poster-style: name + role centered, 10 poses below */}
      <section className={`${c.color} relative overflow-hidden pt-10 pb-14 px-5 sm:px-6`}>
        <div className="max-w-6xl mx-auto relative z-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-500 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            aria-label="Back to The Concierges"
          >
            <ArrowLeft size={12} /> Concierges
          </button>

          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-2 mb-10 sm:mb-14"
          >
            <h1 id={`concierge-${c.id}-heading`} className="text-6xl sm:text-7xl md:text-8xl font-serif italic tracking-tight leading-none">
              {c.name}<span className="brand-dot" aria-hidden="true" style={{ backgroundColor: c.accent }} />
            </h1>
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.5em] text-stone-400">
              {c.role}
            </p>
          </motion.header>

          {/* 5×2 poses grid */}
          <div className="grid grid-cols-5 grid-rows-2 gap-2 sm:gap-4 max-w-5xl mx-auto">
            {Array.from({ length: POSE_COUNT }, (_, i) => i + 1).map((pose) => (
              <motion.div
                key={pose}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: pose * 0.04 }}
                className="aspect-square flex items-center justify-center"
              >
                <ConciergeAvatar
                  id={c.id}
                  poseIndex={pose}
                  rounded="none"
                  alt={`${c.name} pose ${pose}`}
                  className="w-full h-full !object-contain hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supporting details */}
      <section className="py-12 px-5 sm:px-6 max-w-5xl mx-auto space-y-8" aria-label={`${c.name} character details`}>
        <p className="text-base sm:text-lg font-light italic text-stone-600 leading-snug max-w-2xl mx-auto text-center">{c.tagline}</p>
        <p className="text-sm sm:text-base text-stone-500 font-light leading-relaxed max-w-2xl mx-auto text-center">{c.bio}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {[
            { label: 'Personality', value: c.personality },
            { label: 'Style', value: c.style },
            { label: 'Vibe', value: c.vibe },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-3 border-l-2 border-stone-100 pl-5">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">{label}</span>
              <p className="text-sm text-stone-600 font-light leading-relaxed italic">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-5 sm:px-6 max-w-7xl mx-auto" aria-labelledby={`others-${c.id}-heading`}>
        <header className="text-center space-y-2 mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">The rest of the concierges</span>
          <h2 id={`others-${c.id}-heading`} className="text-2xl sm:text-3xl font-serif italic tracking-tight">Meet the others<span className="brand-dot" aria-hidden="true" /></h2>
        </header>
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          {others.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onOther(o.id)}
              className="group flex flex-col items-center gap-3 text-center"
              aria-label={`Open ${o.name}'s page`}
            >
              <div className={`aspect-square w-full rounded-[1.5rem] ${o.color} border border-stone-100 overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1`}>
                <ConciergeAvatar id={o.id} poseIndex={1} rounded="none" alt={o.name} className="w-full h-full !object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="text-sm font-serif italic">{o.name}</p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};
