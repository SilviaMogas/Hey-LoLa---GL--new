import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Lock } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const ACCESS_CODE = 'HelloMiami';
const STORAGE_KEY = 'hl_access_granted';

/**
 * SOFT-LAUNCH MASTER SWITCH.
 *
 * - `false` → the Coming Soon gate is active for humans (default state for
 *   pre-launch). Bots, admins-with-localStorage and ?access=... still get
 *   through.
 * - `true`  → the gate is bypassed for EVERYONE. Use this on the day Miami
 *   goes live publicly. Keeping it as a single flipped constant means we
 *   can revert in one PR if anything blows up.
 *
 * Override via env: set `VITE_LAUNCH_MODE=open` to flip without a code
 * change (helpful for the same build serving staging vs prod).
 */
const LAUNCH_MODE_OPEN = true;

function readLaunchMode(): boolean {
  if (LAUNCH_MODE_OPEN) return true;
  try {
    // @ts-ignore — import.meta only exists in module context
    const v = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LAUNCH_MODE) || '';
    return String(v).toLowerCase() === 'open';
  } catch {
    return false;
  }
}

/**
 * Known indexer / generative-AI crawlers. Matched case-insensitively
 * against navigator.userAgent. We let them through the Coming Soon
 * gate so Hey Lola is properly discoverable on Google, ChatGPT,
 * Claude, Perplexity and Bing while we keep the gate up for humans.
 */
const CRAWLER_PATTERNS = [
  'googlebot',
  'google-extended',
  'bingbot',
  'duckduckbot',
  'baiduspider',
  'yandex',
  'applebot',
  'gptbot',
  'oai-searchbot',
  'chatgpt-user',
  'claudebot',
  'claude-web',
  'anthropic-ai',
  'perplexitybot',
  'ccbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'whatsapp',
  'discordbot',
];

function isCrawler(): boolean {
  if (typeof navigator === 'undefined' || !navigator.userAgent) return false;
  const ua = navigator.userAgent.toLowerCase();
  return CRAWLER_PATTERNS.some((p) => ua.includes(p));
}

export function hasAccess(): boolean {
  if (typeof window === 'undefined') return false;
  if (readLaunchMode()) return true;
  if (isCrawler()) return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export const ComingSoon: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    document.title = 'Hey Lola | Coming Soon';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toLowerCase() === ACCESS_CODE.toLowerCase()) {
      try { window.localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-white text-charcoal font-boutique relative overflow-hidden flex flex-col">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-[900px] h-[900px] bg-stone-100/40 rounded-full blur-[180px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-60 -right-40 w-[700px] h-[700px] bg-brand-orange/5 rounded-full blur-[180px]"
        />
      </div>

      <main className="flex-1 flex items-center justify-center px-5 sm:px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full text-center space-y-10"
        >
          <div className="flex flex-col items-center gap-6">
            <BrandLogo size="3xl" className="max-w-full !h-16 sm:!h-20 md:!h-24" />
            <div className="h-6 w-px bg-stone-200" />
          </div>

          <div className="space-y-5">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">
              Private Preview
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9] text-charcoal">
              Coming <span className="text-stone-300">soon</span><span className="brand-dot" aria-hidden="true"></span>
            </h1>
            <p className="text-base sm:text-lg text-stone-500 font-light italic leading-snug max-w-md mx-auto">
              Your dog's lifestyle concierge is almost ready. We're putting the final touches before opening the doors.
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
              Launching first in Miami — New York City &amp; Barcelona next
            </p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-4 max-w-sm mx-auto"
          >
            <div className="space-y-2 text-left">
              <label htmlFor="access-code" className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 ml-1 flex items-center gap-2">
                <Lock size={11} /> Have an access code?
              </label>
              <input
                id="access-code"
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); if (error) setError(false); }}
                placeholder="Enter your code"
                autoComplete="off"
                spellCheck={false}
                className={`luxury-input h-12 w-full text-sm font-medium text-center tracking-[0.15em] ${error ? 'border-red-300 focus:border-red-400' : ''}`}
                aria-invalid={error}
                aria-describedby={error ? 'access-error' : undefined}
              />
              {error && (
                <p id="access-error" className="text-xs text-red-500 text-center font-medium">
                  Incorrect code. Try again.
                </p>
              )}
            </div>
            <button
              type="submit"
              className="luxury-button-primary w-full h-12 text-[11px] flex items-center justify-center gap-2 shadow-lg"
            >
              Unlock the preview <ArrowRight size={14} />
            </button>
          </motion.form>

          <p className="text-[11px] text-stone-400 font-light italic">
            Want early access? Email{' '}
            <a href="mailto:hey@heylola.co" className="text-charcoal underline decoration-stone-300 underline-offset-4 hover:decoration-charcoal transition-colors">
              hey@heylola.co
            </a>
          </p>
        </motion.div>
      </main>

      <footer className="relative z-10 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">
        Hey Lola — Boutique Lifestyle Concierge
      </footer>
    </div>
  );
};
