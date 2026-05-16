import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Instagram, Check, ArrowRight, PawPrint, Store } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';
import { paths } from '../lib/routes';
import { BrandLogo } from './BrandLogo';

const SUPPORT_EMAIL = 'hey@heylola.co';

interface FooterColumn {
  heading: string;
  links: { label: string; path: string; ariaLabel?: string }[];
}

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleNavigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(path);
  };

  const handleCopyEmail = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SUPPORT_EMAIL);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Clipboard not available — let the mailto: fallback handle it.
    }
    void e;
  };

  const columns: FooterColumn[] = [
    {
      heading: 'Discover',
      links: [
        { label: 'Explore Gems', path: paths.explore },
        { label: 'Community', path: paths.community },
        { label: "What's On", path: paths.whatsOn },
        { label: 'Journal', path: paths.blog },
        { label: 'FAQ', path: paths.faq },
      ],
    },
    {
      heading: 'Membership',
      links: [
        { label: 'Hey Lola Club', path: paths.club },
        { label: 'Join Hey Lola', path: paths.start },
        { label: 'Manifesto', path: paths.about },
      ],
    },
    {
      heading: 'Brand',
      links: [
        { label: 'Brand Book', path: paths.brandBook },
        { label: 'The Concierges', path: paths.concierges },
        { label: 'Foundation', path: paths.foundation },
        { label: 'Press & Media', path: paths.media },
      ],
    },
    {
      heading: 'Partners',
      links: [
        { label: 'Partner Network', path: paths.partners },
        { label: 'Creator Partners', path: paths.creators },
        { label: t.footer.privacy, path: paths.privacy },
        { label: t.footer.terms, path: paths.terms },
      ],
    },
  ];

  return (
    <footer
      id="footer"
      role="contentinfo"
      aria-label="Hey Lola site footer"
      className="relative overflow-hidden font-boutique"
    >
      {/* ── Pre-footer CTA ───────────────────────────────────────────── */}
      <section className="bg-charcoal text-white px-5 sm:px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
            Still exploring?
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic tracking-tight leading-[0.95]">
            Find your way in<span className="text-brand-orange">.</span>
          </h2>
          <p className="text-sm sm:text-base text-white/50 font-light italic max-w-md mx-auto leading-snug">
            Two ways to step into the Hey Lola world — as a dog parent, or as a partner who welcomes them.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-7 max-w-2xl mx-auto text-left">
            <button
              type="button"
              onClick={() => handleNavigate(paths.signup)}
              className="group rounded-[1.25rem] bg-bone text-charcoal p-6 flex flex-col gap-3 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-500"
            >
              <PawPrint size={18} className="text-brand-orange" />
              <span className="text-lg font-serif italic">Join Hey Lola</span>
              <span className="text-xs text-stone-500 font-light leading-snug">
                Organise your dog's life, discover trusted places and unlock curated local perks.
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] pt-1">
                Get started <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate(paths.partners)}
              className="group rounded-[1.25rem] bg-white/[0.06] border border-white/10 text-white p-6 flex flex-col gap-3 hover:bg-white/[0.1] hover:-translate-y-0.5 transition-all duration-500"
            >
              <Store size={18} className="text-white/70" />
              <span className="text-lg font-serif italic">Become a Partner</span>
              <span className="text-xs text-white/50 font-light leading-snug">
                Be discovered by modern dog parents and earn the Hey Lola Verified badge.
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] pt-1">
                Partner with us <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>

          <div className="pt-10 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Want to talk?</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-2 bg-white text-charcoal text-[11px] font-black uppercase tracking-[0.25em] px-6 py-3 rounded-full hover:bg-stone-100 transition-colors"
            >
              {SUPPORT_EMAIL}
              {copied && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                  <Check size={10} /> Copied
                </span>
              )}
            </a>
          </div>
        </div>
      </section>

      {/* ── Main footer ──────────────────────────────────────────────── */}
      <div className="border-t border-stone-100 bg-stone-50/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-10 py-12 sm:py-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start gap-5 text-center lg:text-left">
              <button
                type="button"
                className="cursor-pointer group flex flex-col items-center lg:items-start gap-3"
                onClick={() => handleNavigate(paths.home)}
                aria-label="Go to Hey Lola home"
              >
                <BrandLogo size="2xl" className="group-hover:scale-105 transition-transform duration-700 grayscale-[0.5] group-hover:grayscale-0" />
                <span className="h-0.5 w-12 bg-stone-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
              </button>
              <p className="text-base sm:text-lg font-serif italic text-charcoal/80 leading-snug max-w-sm">
                {t.footer.tagline}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-charcoal hover:shadow-md transition-all duration-300"
                  aria-label="Hey Lola on LinkedIn"
                >
                  <Linkedin size={15} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-charcoal hover:shadow-md transition-all duration-300"
                  aria-label="Hey Lola on Instagram"
                >
                  <Instagram size={15} />
                </a>
              </div>
            </div>

            <nav aria-label="Footer navigation" className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {columns.map((col) => (
                <div key={col.heading} className="space-y-3">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-stone-400 border-b border-stone-100 pb-2">
                    {col.heading}
                  </h2>
                  <ul className="space-y-2.5 text-sm text-stone-500 italic">
                    {col.links.map((link) => (
                      <li key={`${col.heading}-${link.label}`}>
                        <button
                          type="button"
                          onClick={() => handleNavigate(link.path)}
                          className="hover:text-charcoal transition-colors text-left"
                          aria-label={link.ariaLabel ?? link.label}
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Legal strip */}
          <div className="mt-12 pt-6 border-t border-stone-100 flex flex-col md:flex-row items-center md:items-baseline gap-3 md:gap-4 justify-between text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/70">
              © {new Date().getFullYear()} BMBWeb3 Global FZCO — {t.footer.rights}
            </p>
            <p className="text-[11px] text-stone-400 font-light italic leading-relaxed">
              IFZA Business Park · Dubai Silicon Oasis · P.O. Box 342001 · Dubai, UAE
            </p>
          </div>
        </div>
      </div>

      {/* ── Big brand band ───────────────────────────────────────────── */}
      <div className="bg-stone-100/70 border-t border-stone-200/60 py-12 sm:py-16 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 text-center sm:text-left">
          <BrandLogo size="2xl" className="opacity-30" />
          <p className="text-xl sm:text-2xl md:text-3xl font-serif italic tracking-tight text-stone-400/80">
            Your dog's lifestyle concierge<span className="text-brand-orange/60">.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
