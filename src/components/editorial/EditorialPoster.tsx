import React from 'react';

/**
 * EditorialPoster — the signature Hey Lola "Hey, {Name}." poster block.
 *
 * The core unit of the editorial system: a bold typographic statement on a
 * solid surface, used to bring a real animal / person / place into the brand
 * without breaking the layout grid. Three tones map to the brand palette:
 *
 *   - 'dark'   → charcoal surface, white type      (the "Hey, Lola." poster)
 *   - 'orange' → brand-orange surface, charcoal type (the accent poster)
 *   - 'light'  → bone surface, charcoal type         (the quiet poster)
 *
 * Reusable across Concierges, Home, Foundation, Brand Book — one component,
 * one rhythm, so the editorial language stays consistent everywhere.
 */
export type PosterTone = 'dark' | 'orange' | 'light';

interface EditorialPosterProps {
  /** Small uppercase kicker above the headline (e.g. role / category). */
  kicker?: string;
  /** The big statement. Rendered in editorial serif italic. */
  title: string;
  /** Optional one-line caption under the title. */
  caption?: string;
  tone?: PosterTone;
  /** Optional media (avatar / image) shown above the type block. */
  media?: React.ReactNode;
  /** Optional footer node (CTA row, meta). */
  footer?: React.ReactNode;
  className?: string;
  /** Accent colour for the trailing full-stop. Defaults to brand orange. */
  accent?: string;
}

const TONE_SURFACE: Record<PosterTone, string> = {
  dark: 'bg-charcoal text-white',
  orange: 'bg-brand-orange text-charcoal',
  light: 'bg-bone text-charcoal',
};

const TONE_KICKER: Record<PosterTone, string> = {
  dark: 'text-white/40',
  orange: 'text-charcoal/50',
  light: 'text-stone-400',
};

const TONE_CAPTION: Record<PosterTone, string> = {
  dark: 'text-white/55',
  orange: 'text-charcoal/65',
  light: 'text-stone-500',
};

export const EditorialPoster: React.FC<EditorialPosterProps> = ({
  kicker,
  title,
  caption,
  tone = 'light',
  media,
  footer,
  className = '',
  accent = '#F28C33',
}) => {
  return (
    <article
      className={`flex flex-col ${TONE_SURFACE[tone]} rounded-[1.75rem] overflow-hidden ${className}`}
    >
      {media && (
        <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
          {media}
        </div>
      )}
      <div className="flex-1 flex flex-col p-6 sm:p-7 gap-3">
        {kicker && (
          <span className={`text-[10px] font-black uppercase tracking-[0.35em] ${TONE_KICKER[tone]}`}>
            {kicker}
          </span>
        )}
        <h3 className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-[0.95]">
          {title}
          <span className="brand-dot" aria-hidden="true" style={{ backgroundColor: accent }} />
        </h3>
        {caption && (
          <p className={`text-sm font-light italic leading-snug ${TONE_CAPTION[tone]}`}>
            {caption}
          </p>
        )}
        {footer && <div className="mt-auto pt-4">{footer}</div>}
      </div>
    </article>
  );
};
