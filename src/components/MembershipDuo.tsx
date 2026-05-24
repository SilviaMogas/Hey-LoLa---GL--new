import React from 'react';
import { motion } from 'motion/react';
import { MembershipCard } from './MembershipCard';
import { getTranslatedFreePlan } from '../data/membershipPlans';
import { FoundersCircleWaitlist } from './FoundersCircleWaitlist';
import { useTranslation } from '../lib/LanguageContext';

/**
 * Membership at this stage: Free on one side, the Founders' Circle waitlist on
 * the other. Paid tiers are pre-reveal and hidden until they open city by city,
 * so the only live plan is Free. Compact, two-column, premium.
 */


interface MembershipDuoProps {
  onStartFree: () => void;
}

export const MembershipDuo: React.FC<MembershipDuoProps> = ({ onStartFree }) => {
  const { t } = useTranslation();
  return (
    <section id="pricing" className="py-10 sm:py-12 px-5 sm:px-6 max-w-4xl mx-auto scroll-mt-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-2 mb-7"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">{t.home.membershipLabel}</span>
        <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
          {t.home.membershipFreeTitle}<span className="brand-dot" aria-hidden="true" />
        </h2>
        <p className="text-sm sm:text-base text-stone-500 font-light italic max-w-lg mx-auto leading-snug">
          {t.home.membershipFreeDesc}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        {(() => { const freePlan = getTranslatedFreePlan(t.membership); return freePlan ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <MembershipCard plan={freePlan} onClick={onStartFree} />
          </motion.div>
        ) : null; })()}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 }}
        >
          <FoundersCircleWaitlist inline />
        </motion.div>
      </div>
    </section>
  );
};
