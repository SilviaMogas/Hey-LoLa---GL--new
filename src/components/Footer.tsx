import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Instagram, Check } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';
import { paths } from '../lib/routes';
import { BrandLogo } from './BrandLogo';

const SUPPORT_EMAIL = 'hey@heylola.co';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleNavigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(path);
  };

  // The plain `mailto:` only works for visitors who have a default email
  // client set on their device — most desktops don't. So we also copy the
  // address to the clipboard and surface a small "Copied" confirmation,
  // while letting the mailto navigate in parallel.
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
    // Don't preventDefault — the browser still tries the mailto: handler.
    void e;
  };

  return (
    <footer id="footer" className="py-8 sm:py-10 px-5 sm:px-8 md:px-10 border-t border-stone-100 bg-stone-50/60 relative overflow-hidden">
      {/* Decorative vertical mask line */}
      <div className="absolute left-[8%] top-0 bottom-0 w-px bg-stone-50 hidden lg:block" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-8 lg:gap-10 items-start relative z-10 font-boutique">
        <div className="flex flex-col items-center lg:items-start gap-4 sm:gap-5 lg:gap-6 lg:col-span-4">
          <div
            className="cursor-pointer group flex flex-col items-center lg:items-start gap-3"
            onClick={() => handleNavigate(paths.home)}
          >
            <BrandLogo size="2xl" className="group-hover:scale-105 transition-transform duration-1000 grayscale-[0.5] group-hover:grayscale-0" />
            <div className="h-0.5 w-[50%] bg-stone-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
          </div>
          <div className="space-y-2 max-w-sm text-center lg:text-left">
            <p className="text-base sm:text-lg md:text-xl font-serif italic text-charcoal/80 leading-[1.15] tracking-tight">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-3 justify-center lg:justify-start opacity-30">
              <div className="w-1.5 h-1.5 bg-charcoal rounded-full" />
              <div className="w-20 h-px bg-charcoal" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:gap-6 lg:col-span-4 lg:pt-4">
           <div className="space-y-3 sm:space-y-4">
              <h4 className="text-[10px] font-black font-sans uppercase tracking-[0.4em] text-stone-400 border-b border-stone-100 pb-2">Platform</h4>
              <nav className="flex flex-col gap-2 sm:gap-3 items-start text-sm font-medium text-stone-500 italic">
                <button onClick={() => handleNavigate(paths.explore)} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">Explore Gems</button>
                <button onClick={() => handleNavigate(paths.community)} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">The Hub</button>
                <button onClick={() => handleNavigate('/#pack')} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">The Pack</button>
                <button onClick={() => handleNavigate(paths.blog)} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">Journal</button>
                <button onClick={() => handleNavigate(paths.club)} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">Hey Lola Club</button>
                <button onClick={() => handleNavigate(paths.about)} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">Manifesto</button>
                <button onClick={() => handleNavigate(paths.faq)} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">FAQ</button>
                <button onClick={() => handleNavigate(paths.start)} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">Join Hey Lola</button>
              </nav>
           </div>
           <div className="space-y-3 sm:space-y-4">
              <h4 className="text-[10px] font-black font-sans uppercase tracking-[0.4em] text-stone-400 border-b border-stone-100 pb-2">Partners</h4>
              <nav className="flex flex-col gap-2 sm:gap-3 items-start text-sm font-medium text-stone-500 italic">
                <button onClick={() => handleNavigate(paths.creators)} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">Creator Partners</button>
                <button onClick={() => handleNavigate(paths.partners)} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">Partner Network</button>
                <button onClick={() => handleNavigate(paths.privacy)} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">{t.footer.privacy}</button>
                <button onClick={() => handleNavigate(paths.terms)} className="hover:text-charcoal transition-all hover:translate-x-1 duration-500">{t.footer.terms}</button>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-2 hover:text-charcoal transition-all hover:translate-x-1 duration-500"
                  title={`Click to email or copy ${SUPPORT_EMAIL}`}
                >
                  {SUPPORT_EMAIL}
                  {copied && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-600 not-italic">
                      <Check size={10} /> Copied
                    </span>
                  )}
                </a>
              </nav>
           </div>
        </div>

        <div className="flex flex-col items-center lg:items-end gap-4 sm:gap-5 lg:col-span-4 lg:pt-4 font-sans">
           <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-[1rem] border-2 border-white bg-white flex items-center justify-center text-stone-300 hover:text-charcoal hover:shadow-xl hover:-translate-y-1 transition-all duration-500 shadow-sm"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-[1rem] border-2 border-white bg-white flex items-center justify-center text-stone-300 hover:text-charcoal hover:shadow-xl hover:-translate-y-1 transition-all duration-500 shadow-sm"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 sm:pt-8 md:pt-10 mt-8 sm:mt-8 md:mt-8 border-t border-stone-100 flex flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
          </div>

          <div className="space-y-2 max-w-md text-center">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-charcoal/70">
              © {new Date().getFullYear()} BMBWeb3 Global FZCO — All rights reserved.
            </p>
            <p className="text-[10px] sm:text-xs font-medium text-stone-400 italic font-boutique leading-relaxed">
              IFZA Business Park, Building A1 · Dubai Silicon Oasis<br />
              P.O. Box 342001 · Dubai, UAE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
