import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { SEO } from '../lib/seo';

const ABOUT_BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'About', item: '/about' },
];

interface AboutProps {
  onBack?: () => void;
  onExplore?: () => void;
}

/**
 * The Hey Lola manifesto / founder story. When someone asks "who is behind
 * this", this is the page. Photo: /silvia-lola.jpg (Silvia + Lola). Until
 * that file exists it falls back to the previous hero image so the page
 * never shows a broken image.
 */
export const About: React.FC<AboutProps> = ({ onBack, onExplore }) => {
  return (
    <>
      <SEO
        title="About Hey Lola — The story behind it, by Silvia Mogas"
        description="Hey Lola was born from a very personal story. Founder Silvia Mogas on horses, rescue shelters, more than 20 years in tech and marketing, and the small dog — Lola — who connected it all."
        url="/about"
        ogType="article"
        breadcrumbs={ABOUT_BREADCRUMBS}
      />
      <div className="page-shell bg-stone-50/60 text-charcoal font-boutique">
        {/* Hero */}
        <section className="relative px-5 sm:px-6 overflow-hidden pt-24 sm:pt-28 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center relative z-10"
          >
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[2rem] sm:rounded-[3rem] shadow-[0_30px_70px_rgba(0,0,0,0.12)] border-[6px] sm:border-[10px] border-white ring-1 ring-stone-100">
              <img
                src="/silvia-lola.jpg"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = '1';
                    img.src = '/Untitled design (44).png';
                  }
                }}
                alt="Silvia Mogas and Lola"
                className="w-full h-full object-cover bg-white"
              />
            </div>

            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex flex-col items-center md:items-start gap-4">
                <BrandLogo size="lg" />
                <div className="h-10 w-px bg-stone-200" />
                <div className="px-5 py-2 bg-charcoal text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                  About Hey Lola
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic tracking-tight leading-[0.95] text-charcoal/90">
                Built around the ones who give us unconditional love<span className="text-brand-orange">.</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-500 font-light italic leading-relaxed max-w-xl md:border-l md:border-stone-200 md:pl-6">
                Hey Lola was born from a very personal story.
              </p>
            </div>
          </motion.div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-stone-50/40 rounded-full blur-[140px] pointer-events-none -z-0" />
        </section>

        {/* The story */}
        <section className="py-10 sm:py-14 px-5 sm:px-6 border-t border-stone-100">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto space-y-5"
          >
            <div className="flex items-center gap-4 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">The story</span>
              <div className="h-px w-12 bg-stone-200" />
            </div>

            {[
              'Animals have always been part of my life. I grew up surrounded by them, especially horses, and from a very young age I learned what responsibility, trust, care, and connection truly mean. Later, I studied veterinary assistance because I genuinely believed my path would always stay close to animal wellbeing in one way or another.',
              'Over the years, different animals shaped my life and my perspective. Kai, my horse. Nuc. And later, Lola. Each of them taught me something different about loyalty, emotions, companionship, and the silent bond we build with animals throughout our lives.',
              'During my twenties, I also spent time helping dog shelters in Spain and later in the UK. I helped walk dogs, support adoption visibility, and contribute however I could. Those experiences stayed with me and reinforced something I had always felt deeply: animals deserve better systems, more empathy, and more human-centered experiences around them.',
              'At the same time, my professional journey took me across different countries, industries, and technologies. I spent more than 20 years working in marketing, partnerships, innovation, startups, and emerging technologies, building communities and helping brands grow globally. But no matter where life took me, animals were always there.',
            ].map((para) => (
              <p key={para.slice(0, 24)} className="text-base sm:text-lg text-stone-600 font-light leading-relaxed">
                {para}
              </p>
            ))}

            <blockquote className="py-6 my-2 border-y border-stone-200">
              <p className="text-2xl sm:text-3xl font-serif italic text-charcoal leading-snug">
                When Lola came into my life, everything connected<span className="text-brand-orange">.</span>
              </p>
            </blockquote>

            {[
              'I adopted Lola because I wanted a small dog who could truly travel and experience life with me. And suddenly I started seeing the world differently through her eyes.',
              'Traveling with pets was harder than it should be. Finding trusted places was fragmented. Information lived everywhere. Communities were disconnected. And most platforms still treated animals like profiles instead of family members.',
              'That was the moment Hey Lola started to take shape. Not as "another pet app". And not as a technology company looking for a problem to solve. Hey Lola was created to build a more connected, trusted, and human ecosystem around animals and the people who love them.',
              'But most importantly, we believe pets should be at the center of the experience. Not as an accessory to our lifestyle, but as living beings that deserve better care, safer experiences, more inclusion, and more thoughtful systems designed around their wellbeing.',
            ].map((para) => (
              <p key={para.slice(0, 24)} className="text-base sm:text-lg text-stone-600 font-light leading-relaxed">
                {para}
              </p>
            ))}

            <p className="text-xs font-black uppercase tracking-[0.3em] text-stone-400 pt-2">
              — Silvia Mogas, Founder
            </p>
          </motion.div>
        </section>

        {/* Vision */}
        <section className="py-12 sm:py-16 px-5 sm:px-6 bg-charcoal text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 md:p-20 opacity-5 pointer-events-none hidden md:block">
            <BrandLogo size="8xl" variant="white" className="-rotate-12" />
          </div>
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Our vision</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-tight">
              A future that is more pet friendly, more connected, more community driven<span className="text-brand-orange">.</span>
            </h2>
            <div className="space-y-2 text-white/60 font-light italic text-base sm:text-lg leading-relaxed">
              <p>A future where traveling with animals feels natural.</p>
              <p>Where trusted services are easier to access.</p>
              <p>Where pet identities, health, experiences, and communities connect seamlessly.</p>
              <p>And where technology helps simplify life instead of making it more complicated.</p>
            </div>
            <p className="text-sm text-white/50 font-light pt-2">
              Hey Lola is building toward that future step by step — starting with trust, identity, community, and belonging.
            </p>
          </div>
        </section>

        {/* More than a platform */}
        <section className="py-12 sm:py-16 px-5 sm:px-6 border-t border-stone-100">
          <div className="max-w-2xl mx-auto space-y-5">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">More than a platform</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-tight text-charcoal">
              A cultural movement around modern pet lifestyles<span className="text-brand-orange">.</span>
            </h2>
            <p className="text-base sm:text-lg text-stone-600 font-light leading-relaxed">
              Hey Lola is not only about technology. A space where animals are welcomed. Where communities connect. Where brands, cities, hospitality, travel, wellness, and experiences become more inclusive for pets and their humans.
            </p>
            <p className="text-base sm:text-lg text-stone-600 font-light leading-relaxed">
              We want to help create a world where pets are not limited by systems that were never designed for them.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-14 sm:py-20 px-5 sm:px-6 text-center bg-stone-50/60 relative">
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Our mission</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-charcoal leading-tight tracking-tight">
              To improve the lives of pets and the humans who love them — through trusted experiences, connected communities and more pet-inclusive ecosystems around the world.
            </h2>
            <p className="text-xl sm:text-2xl font-serif italic text-stone-500 pt-2">
              Because they are not "just pets". They are family<span className="text-brand-orange">.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={onExplore}
                className="w-full sm:w-auto px-10 py-4 bg-charcoal text-white rounded-full font-black text-[11px] uppercase tracking-[0.25em] shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:bg-neutral-800 hover:scale-105 transition-all duration-500 group flex items-center justify-center gap-3"
              >
                Explore Hey Lola <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onBack}
                className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-stone-100 text-charcoal rounded-full font-black text-[11px] uppercase tracking-[0.25em] hover:border-stone-200 hover:bg-stone-50 transition-all duration-300"
              >
                Back home
              </button>
            </div>

            <div className="pt-12 opacity-20">
              <BrandLogo size="md" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
