import React from 'react';
import { motion } from 'motion/react';
import { MembershipCard, type MembershipPlan } from './MembershipCard';
import { getTranslatedFreePlan } from '../data/membershipPlans';
import { useTranslation } from '../lib/LanguageContext';

/**
 * Paid tiers (Local / Plus / Black) are pre-reveal and activate city by city
 * once the partner network is verified. Until then everything is Free, so we
 * only surface the live (non-comingSoon) plans publicly. Flip the `comingSoon`
 * flags in data/membershipPlans.ts to bring the paid tiers back.
 */


interface MembershipPlansSectionProps {
  onSelect: (plan: MembershipPlan) => void;
  description?: string;
  busyPlanId?: string | null;
  currentPlanId?: string | null;
  sectionRef?: React.Ref<HTMLDivElement>;
}

export const MembershipPlansSection: React.FC<MembershipPlansSectionProps> = ({
  onSelect,
  description,
  busyPlanId,
  currentPlanId,
  sectionRef,
}) => {
  const { t } = useTranslation();
  const VISIBLE_PLANS = [getTranslatedFreePlan(t.membership)];
  const desc = description ?? t.home.membershipFreeDesc;
  return (
    <section ref={sectionRef} id="pricing" className="py-8 sm:py-10 px-5 sm:px-6 max-w-7xl mx-auto scroll-mt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-4 mb-6"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">{t.home.membershipLabel}</span>
        <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-[0.85]">
          {t.home.membershipFreeTitle}<span className="brand-dot" aria-hidden="true" />
        </h2>
        <p className="text-lg text-stone-400 font-light italic max-w-xl mx-auto">{desc}</p>
      </motion.div>

      <div className={`grid gap-4 ${VISIBLE_PLANS.length === 1 ? 'max-w-md mx-auto grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
        {VISIBLE_PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <MembershipCard
              plan={plan}
              onClick={() => onSelect(plan)}
              busy={busyPlanId === plan.id}
              isCurrent={currentPlanId === plan.id}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};
