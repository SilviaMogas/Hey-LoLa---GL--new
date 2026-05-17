import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { FAQ_CATEGORIES } from '../data/faq';
import { SEO, faqPageSchema } from '../lib/seo';

const FAQ_BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'FAQ', item: '/faq' },
];

interface FaqProps {
  onBack: () => void;
}

export const Faq: React.FC<FaqProps> = ({ onBack }) => {
  const allQs = useMemo(() => FAQ_CATEGORIES.flatMap((c) => c.questions), []);
  const faqSchema = useMemo(() => faqPageSchema(allQs), [allQs]);
  const [activeCategory, setActiveCategory] = useState<string>(FAQ_CATEGORIES[0].id);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const current = FAQ_CATEGORIES.find(c => c.id === activeCategory) ?? FAQ_CATEGORIES[0];

  const toggle = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="bg-white min-h-screen font-boutique">
      <SEO
        title="Hey Lola FAQ — Everything you need to know"
        description="Frequently asked questions about Hey Lola, a boutique lifestyle concierge for dog parents. Memberships, partners, verification, cities and pet records."
        url="/faq"
        breadcrumbs={FAQ_BREADCRUMBS}
        jsonLd={faqSchema}
      />
      <section className="bg-stone-50 border-b border-stone-100 pt-12 pb-10 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-6"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="space-y-2">
            <span className="text-stone-400 font-black uppercase tracking-[0.4em] text-[10px]">FAQ</span>
            <h1 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-[0.95] text-charcoal">
              Common <span className="text-stone-300">questions</span><span className="brand-dot" aria-hidden="true" />
            </h1>
            <p className="text-base text-stone-500 italic max-w-xl">
              How Hey Lola works for pet parents, founding members, creators, venues, vets and the trust that holds it all together.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {FAQ_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-colors',
                activeCategory === cat.id
                  ? 'bg-charcoal text-white border-charcoal'
                  : 'bg-white text-stone-500 border-stone-100 hover:border-stone-300',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {current.questions.map((qa, i) => {
            const key = `${current.id}-${i}`;
            const isOpen = expanded.has(key);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white border border-stone-100 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggle(key)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-stone-50/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif italic text-base text-charcoal/90 leading-snug">{qa.q}</span>
                  <ChevronDown
                    size={16}
                    className={cn('text-stone-400 shrink-0 transition-transform', isOpen && 'rotate-180')}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-4"
                    >
                      <p className="text-sm text-stone-500 leading-relaxed font-light">
                        {qa.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 bg-stone-50 border border-stone-100 rounded-2xl p-6 text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Still curious?</p>
          <p className="text-sm text-stone-500 italic">
            Drop us a line at <a className="text-charcoal underline underline-offset-4" href="mailto:hey@heylola.co">hey@heylola.co</a>.
          </p>
        </div>
      </section>
    </div>
  );
};
