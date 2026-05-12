import React from 'react';
import { motion } from 'motion/react';
import { PawPrint } from 'lucide-react';

interface PawLoaderProps {
  size?: number;
  className?: string;
  variant?: 'center' | 'scattered';
}

const CENTER_COMPANIONS = [
  { x: -1.05, y: -0.85, rotate: -22 },
  { x:  1.10, y: -0.55, rotate:  18 },
  { x: -0.55, y:  0.95, rotate: -10 },
  { x:  0.95, y:  0.85, rotate:  24 },
];

// Spread points across the full viewport so the paws never overlap
// the central mark. Each point sits in its own quadrant zone with at
// least 15% margin between siblings.
const SCATTERED_COMPANIONS = [
  { top: '8%',  left: '8%',   rotate: -18, delay: 0 },
  { top: '14%', right: '12%', rotate: 22,  delay: 0.4 },
  { top: '32%', left: '4%',   rotate: -40, delay: 0.2 },
  { top: '36%', right: '6%',  rotate: 38,  delay: 0.6 },
  { bottom: '34%', left: '10%', rotate: 12,  delay: 0.8 },
  { bottom: '30%', right: '12%', rotate: -22, delay: 1.0 },
  { bottom: '12%', left: '22%', rotate: -10, delay: 1.2 },
  { bottom: '8%',  right: '24%', rotate: 18,  delay: 1.4 },
  { top: '20%', left: '38%',  rotate: 30,  delay: 0.3 },
  { bottom: '22%', left: '46%', rotate: -28, delay: 0.9 },
  { top: '60%', left: '14%',  rotate: 8,   delay: 1.6 },
  { top: '64%', right: '16%', rotate: -8,  delay: 0.7 },
];

export const PawLoader: React.FC<PawLoaderProps> = ({ size = 44, className, variant = 'center' }) => {
  const small = Math.max(10, Math.round(size * 0.38));
  const radius = size;

  if (variant === 'scattered') {
    return (
      <div
        className={`relative w-full min-h-screen h-full flex items-center justify-center overflow-hidden ${className || ''}`}
        style={{ color: 'var(--brand-orange, #E07A30)' }}
        aria-label="Loading"
        role="status"
      >
        {/* Main central paw */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [-4, 4, -4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="z-10"
        >
          <PawPrint size={size * 1.5} />
        </motion.div>

        {/* Scattered background paws */}
        {SCATTERED_COMPANIONS.map((c, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: c.top,
              left: c.left,
              right: (c as any).right,
              bottom: (c as any).bottom,
              opacity: 0.15,
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.1, 0.3, 0.1],
              rotate: [c.rotate - 10, c.rotate + 10, c.rotate - 10],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: c.delay,
            }}
          >
            <PawPrint size={size * 0.8} />
          </motion.div>
        ))}
      </div>
    );
  }

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

      {CENTER_COMPANIONS.map((c, i) => (
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
