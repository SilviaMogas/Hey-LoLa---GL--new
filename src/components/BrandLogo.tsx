import React from 'react';
import { cn } from '../lib/utils';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl';
  variant?: 'black' | 'white' | 'orange';
  /** Render only the square HL mark instead of the full wordmark */
  mark?: boolean;
  title?: string;
}

const HEIGHT_CLASSES: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'h-4 md:h-5',
  md: 'h-5 md:h-6',
  lg: 'h-7 md:h-8',
  xl: 'h-9 md:h-10',
  '2xl': 'h-11 md:h-12',
  '3xl': 'h-13 md:h-14',
  '4xl': 'h-15 md:h-16',
  '5xl': 'h-18 md:h-14',
  '6xl': 'h-24 md:h-28',
  '7xl': 'h-32 md:h-36',
  '8xl': 'h-40 md:h-48',
};

const COLORS = {
  // Brand wordmark: "Hey" + "Lola" share the primary color, the trailing
  // period is the only orange element — matches the rest of the system
  // (titles like "Welcome back.", "The Hub.", "Travel Hub." use the same
  // pattern).
  black: { word: '#0A0A0A', dot: '#F28C33', mark: '#0A0A0A', markText: '#FFFFFF' },
  white: { word: '#FFFFFF', dot: '#F28C33', mark: '#FFFFFF', markText: '#0A0A0A' },
  orange: { word: '#F28C33', dot: '#F28C33', mark: '#F28C33', markText: '#0A0A0A' },
} as const;

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className,
  size = 'md',
  variant = 'black',
  mark = false,
  title = 'HeyLola.',
}) => {
  const colors = COLORS[variant];
  const heightClass = HEIGHT_CLASSES[size];

  if (mark) {
    return (
      <svg
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
        className={cn('w-auto aspect-square block transition-transform duration-300 transform-gpu', heightClass, className)}
      >
        <title>{title}</title>
        <rect width="64" height="64" fill={colors.mark} />
        <text
          x="32"
          y="44"
          textAnchor="middle"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          fontSize="32"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="-1.6"
          fill={colors.markText}
        >
          HL
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 -5 126 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn('w-auto transition-all duration-300 transform-gpu block', heightClass, className)}
      style={{ overflow: 'visible' }}
    >
      <title>{title}</title>
      {/* The wordmark text width is pinned with textLength so the trailing
          square dot lands in the same place regardless of which font the
          browser falls back to (SVG <text> doesn't reliably pick up the
          web font on iOS Safari — the old typographic '.' rendered as a
          tofu box there). */}
      <text
        x="0"
        y="30"
        textLength="120"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
        fontSize="34"
        fontWeight="900"
        fontStyle="italic"
        letterSpacing="-0.04em"
        fill={colors.word}
      >
        HeyLola
      </text>
      {/* Brand dot — a real square, not a font glyph, sitting tight to
          the italic 'a' on the baseline. Matches the site-wide
          .brand-dot. */}
      <rect x="112" y="20.5" width="9.5" height="9.5" fill={colors.dot} />
    </svg>
  );
};
