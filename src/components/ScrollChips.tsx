import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollChipsProps {
  /** Rendered chip elements — usually <button> entries. */
  children: React.ReactNode;
  /** Accessibility label for the inner scroll region. */
  ariaLabel?: string;
  /** Optional className applied to the scrollable rail. */
  className?: string;
}

/**
 * A horizontally scrollable rail with left/right arrows that appear when
 * there is content out of view. Used for filter chip rows where the
 * options overflow on narrow viewports.
 */
export const ScrollChips: React.FC<ScrollChipsProps> = ({ children, ariaLabel, className }) => {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Scroll filters left"
        onClick={() => scrollBy(-1)}
        className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-charcoal transition-opacity ${canLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft size={14} />
      </button>

      {canLeft && (
        <span aria-hidden className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-[1] bg-gradient-to-r from-white to-transparent" />
      )}
      {canRight && (
        <span aria-hidden className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-[1] bg-gradient-to-l from-white to-transparent" />
      )}

      <div
        ref={railRef}
        role="group"
        aria-label={ariaLabel}
        className={`flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-10 ${className ?? ''}`}
        style={{ scrollPaddingInline: '2.5rem' }}
      >
        {React.Children.map(children, (child, i) => (
          <div key={i} className="snap-start shrink-0">
            {child}
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll filters right"
        onClick={() => scrollBy(1)}
        className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-charcoal transition-opacity ${canRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};
