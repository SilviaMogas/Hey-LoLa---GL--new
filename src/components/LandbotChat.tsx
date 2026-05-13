import { useEffect } from 'react';

/**
 * Lazy-loads the Landbot Livechat widget on the first user interaction.
 * Mounted once from <AppContent /> so it persists across route changes
 * but is never injected on the Coming Soon gate or during SSR.
 */
const LANDBOT_CONFIG_URL =
  'https://storage.googleapis.com/landbot.site/v3/H-3428881-HUBA77IIFH5S1JE1/index.json';
const LANDBOT_SCRIPT_SRC = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';

declare global {
  interface Window {
    Landbot?: { Livechat: new (opts: { configUrl: string }) => unknown };
    __heylolaLandbot?: unknown;
  }
}

export const LandbotChat: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__heylolaLandbot) return;

    let loaded = false;
    const init = () => {
      if (loaded) return;
      loaded = true;
      window.removeEventListener('mouseover', init);
      window.removeEventListener('touchstart', init);

      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${LANDBOT_SCRIPT_SRC}"]`,
      );
      if (existing) {
        if (window.Landbot && !window.__heylolaLandbot) {
          window.__heylolaLandbot = new window.Landbot.Livechat({ configUrl: LANDBOT_CONFIG_URL });
        }
        return;
      }

      const script = document.createElement('script');
      script.type = 'module';
      script.async = true;
      script.src = LANDBOT_SCRIPT_SRC;
      script.addEventListener('load', () => {
        if (window.Landbot && !window.__heylolaLandbot) {
          window.__heylolaLandbot = new window.Landbot.Livechat({ configUrl: LANDBOT_CONFIG_URL });
        }
      });
      document.head.appendChild(script);
    };

    window.addEventListener('mouseover', init, { once: true });
    window.addEventListener('touchstart', init, { once: true, passive: true });

    return () => {
      window.removeEventListener('mouseover', init);
      window.removeEventListener('touchstart', init);
    };
  }, []);

  return null;
};
