import React from 'react';
import { motion } from 'motion/react';
import { MembershipCard, type MembershipPlan } from './MembershipCard';
import { MEMBERSHIP_PLANS } from '../data/membershipPlans';

interface MembershipPlansSectionProps {
  onSelect: (plan: MembershipPlan) => void;
  description?: string;
  busyPlanId?: string | null;
  currentPlanId?: string | null;
  sectionRef?: React.Ref<HTMLDivElement>;
}

export const MembershipPlansSection: React.FC<MembershipPlansSectionProps> = ({
  onSelect,
  description = 'The Hey Lola Club is a boutique membership for dog parents who want curated experiences, trusted partners and practical tools. Start free — paid tiers coming soon.',
  busyPlanId,
  currentPlanId,
  sectionRef,
}) => {
  return (
    <section ref={sectionRef} id="pricing" className="py-8 sm:py-10 px-5 sm:px-6 max-w-7xl mx-auto scroll-mt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-4 mb-6"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Membership</span>
        <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-[0.85]">
          Boutique <span className="text-stone-300">membership tiers</span><span className="text-brand-orange">.</span>
        </h2>
        <p className="text-lg text-stone-400 font-light italic max-w-xl mx-auto">{description}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {MEMBERSHIP_PLANS.map((plan, i) => (
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
