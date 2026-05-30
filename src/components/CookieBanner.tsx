import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../lib/LanguageContext';
import { EEA_TIMEZONES } from '../data/eeaTimezones';

const STORAGE_KEY = 'heylola_cookie_consent_v1';
type Choice = 'granted' | 'denied';

function inEEA(): boolean {
  try {
    return EEA_TIMEZONES.has(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return true; // fail safe: show banner if we can't detect
  }
}

interface CookieBannerProps {
  onNavigatePrivacy?: () => void;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function applyConsent(choice: Choice) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });
}

/**
 * Editorial cookie banner — designed as a "small note from Lola" rather
 * than a regulatory pop-up. Bone surface, brand serif headline, square
 * brand dot, charcoal accept pill, ghost decline. Slides in from the
 * bottom-right with a soft scale, sits on a faint orange glow.
 *
 * Visually intentional contrast against the dark GTM-injected banner —
 * if both fire at once, this one is the brand asset; the GTM tag
 * should be retired in the Tag Manager dashboard.
 */
export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigatePrivacy }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'granted' || stored === 'denied') {
      applyConsent(stored);
      return;
    }
    if (!inEEA()) return;
    const timer = setTimeout(() => setVisible(true), 1100);
    return () => clearTimeout(timer);
  }, []);

  const choose = (choice: Choice) => {
    localStorage.setItem(STORAGE_KEY, choice);
    applyConsent(choice);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ y: 32, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 32, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-[400px] font-boutique"
          style={{ zIndex: 2147483647 }}
          role="dialog"
          aria-label={t.cookies.ariaLabel}
          data-heylola="cookie-banner"
        >
          {/* Floating orange glow behind the card */}
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-[2.5rem] bg-brand-orange/15 blur-3xl pointer-events-none"
          />

          {/* The card */}
          <div className="relative bg-bone rounded-[1.75rem] border border-stone-200/70 shadow-[0_30px_80px_-30px_rgba(17,17,17,0.35)] overflow-hidden">
            {/* Decorative top accent — a thin warm gradient line */}
            <div
              aria-hidden="true"
              className="h-[3px] w-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, var(--color-brand-orange) 35%, var(--color-brand-orange) 65%, transparent 100%)',
              }}
            />

            <div className="px-6 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6 flex flex-col gap-4">
              {/* Brand line */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="brand-dot" aria-hidden="true" />
                  <span className="text-[9px] font-black uppercase tracking-[0.42em] text-stone-400">
                    A note from Lola
                  </span>
                </div>
                {onNavigatePrivacy && (
                  <button
                    type="button"
                    onClick={onNavigatePrivacy}
                    className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300 hover:text-charcoal transition-colors"
                  >
                    {t.cookies.learnMore}
                  </button>
                )}
              </div>

              {/* Editorial headline + body */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-[26px] font-serif italic tracking-tight leading-[0.95] text-charcoal">
                  Hey there<span className="brand-dot" aria-hidden="true" />
                </h2>
                <p className="text-[13.5px] leading-relaxed text-stone-500 font-light italic">
                  {t.cookies.message}
                </p>
              </div>

              {/* Choices */}
              <div className="flex items-center justify-end gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => choose('denied')}
                  className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-charcoal transition-colors"
                >
                  {t.cookies.reject}
                </button>
                <button
                  type="button"
                  onClick={() => choose('granted')}
                  className="group relative px-6 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-white bg-charcoal hover:bg-brand-orange rounded-full transition-colors shadow-[0_8px_22px_-6px_rgba(17,17,17,0.45)] inline-flex items-center gap-1.5"
                >
                  {t.cookies.accept}
                  <span
                    aria-hidden="true"
                    className="inline-block w-1 h-1 rounded-full bg-brand-orange group-hover:bg-white transition-colors"
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export function resetCookieConsent() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
