import React from 'react';
import { motion } from 'motion/react';
import { PawPrint } from 'lucide-react';

interface PawLoaderProps {
  size?: number;
  className?: string;
}

// Where the small companion paws live, expressed as offsets from centre.
// Order matters — the stagger uses each entry's index for its delay.
const COMPANIONS: Array<{ x: number; y: number; rotate: number }> = [
  { x: -1.05, y: -0.85, rotate: -22 },
  { x:  1.10, y: -0.55, rotate:  18 },
  { x: -0.55, y:  0.95, rotate: -10 },
  { x:  0.95, y:  0.85, rotate:  24 },
];

/**
 * Brand-aligned loading indicator. A bigger main paw pulses + rocks in the
 * centre while four small companion paws wink in and out around it on a
 * staggered loop, giving the brand voice a bit of play. The animation is
 * still light enough to use in suspense fallbacks.
 */
export const PawLoader: React.FC<PawLoaderProps> = ({ size = 44, className }) => {
  // Main paw is `size`; companions are roughly 40% of that, offset on a
  // ~size-equivalent radius so they sit comfortably outside the main glyph.
  const small = Math.max(10, Math.round(size * 0.38));
  const radius = size; // total visual reach from centre

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + radius,
        height: size + radius,
        color: 'var(--brand-orange, #E07A30)',
      }}
      aria-label="Loading"
      role="status"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [-6, 6, -6] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PawPrint size={size} />
      </motion.div>

      {COMPANIONS.map((c, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `calc(50% + ${c.x * radius * 0.55}px)`,
            top: `calc(50% + ${c.y * radius * 0.55}px)`,
            translate: '-50% -50%',
            opacity: 0.55,
          }}
          animate={{
            scale: [0.6, 1, 0.6],
            opacity: [0, 0.7, 0],
            rotate: [c.rotate - 8, c.rotate + 8, c.rotate - 8],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.18,
          }}
        >
          <PawPrint size={small} />
        </motion.div>
      ))}
    </div>
  );
};
