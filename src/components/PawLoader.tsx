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

const SCATTERED_COMPANIONS = [
  { top: '15%', left: '10%', rotate: -15, delay: 0 },
  { top: '25%', right: '15%', rotate: 25, delay: 0.4 },
  { bottom: '20%', left: '15%', rotate: 10, delay: 0.8 },
  { bottom: '30%', right: '10%', rotate: -20, delay: 1.2 },
  { top: '50%', left: '5%', rotate: -45, delay: 0.2 },
  { top: '45%', right: '5%', rotate: 45, delay: 0.6 },
  { bottom: '10%', left: '45%', rotate: -10, delay: 1.0 },
  { top: '10%', right: '45%', rotate: 15, delay: 1.4 },
];

export const PawLoader: React.FC<PawLoaderProps> = ({ size = 44, className, variant = 'center' }) => {
  const small = Math.max(10, Math.round(size * 0.38));
  const radius = size;

  if (variant === 'scattered') {
    return (
      <div className={`relative w-full h-full min-h-[400px] flex items-center justify-center ${className || ''}`} style={{ color: 'var(--brand-orange, #E07A30)' }}>
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
