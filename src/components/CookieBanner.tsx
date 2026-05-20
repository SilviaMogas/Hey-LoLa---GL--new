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
    const timer = setTimeout(() => setVisible(true), 800);
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
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-[300px] z-[60]"
          role="dialog"
          aria-label={t.cookies.ariaLabel}
        >
          <div className="bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-xl shadow-md px-4 py-3 flex flex-col gap-2.5">
            <p className="text-[11.5px] leading-relaxed text-stone-500">
              {t.cookies.message}{' '}
              {onNavigatePrivacy && (
                <button
                  onClick={onNavigatePrivacy}
                  className="underline text-charcoal/70 hover:text-brand-orange transition-colors"
                >
                  {t.cookies.learnMore}
                </button>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <ChoiceButton onClick={() => choose('denied')} variant="ghost" label={t.cookies.reject} />
              <ChoiceButton onClick={() => choose('granted')} variant="solid" label={t.cookies.accept} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ChoiceButtonProps {
  onClick: () => void;
  variant: 'ghost' | 'solid';
  label: string;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ onClick, variant, label }) => {
  const base = 'px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg transition-colors';
  const styles = variant === 'solid'
    ? 'bg-charcoal text-white hover:bg-brand-orange'
    : 'text-stone-400 hover:text-charcoal hover:bg-stone-50';
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {label}
    </button>
  );
};

export function resetCookieConsent() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
