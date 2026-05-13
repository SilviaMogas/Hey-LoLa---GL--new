import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Sprout,
  ShieldCheck,
  HandHeart,
  PawPrint,
  Mail,
  Globe,
  Users,
  Lightbulb,
} from 'lucide-react';
import { SEO } from '../lib/seo';

interface FoundationProps {
  onBack: () => void;
  onPartners: () => void;
  onJoin: () => void;
}

const BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'Foundation', item: '/foundation' },
];

const PILLARS = [
  {
    icon: Sprout,
    label: 'Rescue & Foster',
    body: 'Partner with shelters and foster networks in every Hey Lola city. Spotlight dogs looking for a home and the people fostering them.',
    color: 'bg-[#F7F9F5] text-[#6E8C5D]',
  },
  {
    icon: ShieldCheck,
    label: 'Welfare & Care',
    body: 'Support access to verified vets, wellness checks and emergency care for dogs whose families are between homes, jobs or borders.',
    color: 'bg-[#F5F8FA] text-[#5D848C]',
  },
  {
    icon: Users,
    label: 'Community Activations',
    body: 'Adoption days, pop-up parks, wellness clinics, and on-the-ground events that bring dog parents, partners and rescues together.',
    color: 'bg-[#FDF8F6] text-[#C4622D]',
  },
  {
    icon: Lightbulb,
    label: 'Education',
    body: 'Free city guides, training resources and travel know-how — so every dog parent makes confident, kind decisions.',
    color: 'bg-[#FAF9F5] text-[#8C845D]',
  },
];

const IMPACT_NUMBERS = [
  { value: '4', label: 'Pillars', sub: 'Rescue · Welfare · Community · Education' },
  { value: '3', label: 'Launch cities', sub: 'Miami · NYC · Barcelona' },
  { value: '100%', label: 'Transparent', sub: 'Every initiative reported publicly' },
];

const MEMBER_SUPPORT = [
  'A share of every Hey Lola membership supports the Foundation.',
  'Verified partners can dedicate a portion of member perks to rescue partners.',
  'Members can opt-in to round-up contributions on purchases.',
  'Annual impact report — what we funded, with whom, and what happened next.',
];

const PROGRAMS = [
  {
    title: 'City Adoption Days',
    body: 'A quarterly weekend where shelters and adopters meet inside Hey Lola partner venues — calm spaces, free water bowls, friendly humans.',
    badge: 'Quarterly',
  },
  {
    title: 'Foster Spotlight',
    body: 'Featured fosters in each city — their story, the dog they\'re caring for, and how the community can step in.',
    badge: 'Monthly',
  },
  {
    title: 'Wellness Clinics',
    body: 'Pop-up wellness checks with partner vets at parks and community hubs. Free basic care for dogs in foster or temporary housing.',
    badge: 'Seasonal',
  },
  {
    title: 'Partner Conferences',
    body: 'Bringing partner businesses, dog parents and rescues together for activations during city-wide events.',
    badge: 'On request',
  },
];

export const Foundation: React.FC<FoundationProps> = ({ onBack, onPartners, onJoin }) => {
  return (
    <main className="bg-white min-h-screen text-charcoal font-boutique" aria-labelledby="foundation-heading">
      <SEO
        title="Hey Lola Foundation — Better Lives for Dogs and Their People"
        description="The Hey Lola Foundation supports rescue partners, fosters and dog parents across our cities. Funded by members, run transparently, built around four pillars: Rescue, Welfare, Community and Education."
        url="/foundation"
        breadcrumbs={BREADCRUMBS}
      />

      {/* Hero */}
      <section className="relative bg-charcoal overflow-hidden pt-14 pb-14 px-5 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative z-10 space-y-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
            aria-label="Go back"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5 max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">
              <Heart size={11} /> Hey Lola Foundation
            </span>
            <h1
              id="foundation-heading"
              className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9] text-white"
            >
              Better lives for dogs<br />
              <span className="text-white/30">and their people</span><span className="text-brand-orange">.</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug">
              The Hey Lola Foundation is the social impact arm of the boutique concierge — funded by members and partners, run with full transparency, dedicated to rescue, welfare, community and education in every Hey Lola city.
            </p>
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
              <span className="bg-brand-orange/30 text-brand-orange px-2 py-0.5 rounded-full">Draft</span>
              First public draft — taking shape with launch partners.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto" aria-labelledby="mission-heading">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">01 — Mission</span>
          <h2 id="mission-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
            A boutique concierge with a conscience<span className="text-brand-orange">.</span>
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 space-y-4">
            <p className="text-base sm:text-lg text-stone-600 font-light italic leading-relaxed">
              Every dog parent we meet shares the same instinct — to give their dog the most thoughtful life possible. The Foundation extends that instinct outward: to dogs without a family yet, to rescue networks doing the hard work, to fosters opening their homes.
            </p>
            <p className="text-sm sm:text-base text-stone-500 font-light leading-relaxed">
              We don't see Hey Lola as a transaction. We see it as a circle: members support the platform, the platform supports the community, the community supports the dogs who need it most.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 gap-3">
            {IMPACT_NUMBERS.map((n) => (
              <div key={n.label} className="rounded-2xl border border-stone-100 bg-stone-50 p-5">
                <p className="text-4xl font-serif italic tracking-tight leading-none">{n.value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 mt-2">{n.label}</p>
                <p className="text-[11px] text-stone-500 italic font-light leading-relaxed mt-1">{n.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-14 sm:py-16 px-5 sm:px-6 bg-stone-50 border-y border-stone-100" aria-labelledby="pillars-heading">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">02 — Pillars</span>
            <h2 id="pillars-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              Four pillars, one circle<span className="text-brand-orange">.</span>
            </h2>
            <p className="text-sm text-stone-500 font-light italic leading-relaxed max-w-2xl">
              Every Foundation initiative belongs to one of these four pillars. We say no to anything that doesn't fit — to stay focused, to stay credible, to stay useful.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <article
                  key={p.label}
                  className="rounded-[1.5rem] bg-white border border-stone-100 p-6 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                >
                  <div className={`w-11 h-11 rounded-2xl ${p.color} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-xl font-serif italic leading-tight">{p.label}</h3>
                  <p className="text-sm text-stone-500 font-light leading-relaxed">{p.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Member support */}
      <section className="py-14 sm:py-16 px-5 sm:px-6 max-w-5xl mx-auto" aria-labelledby="support-heading">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">03 — Member support</span>
          <h2 id="support-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
            Funded by the community we serve<span className="text-brand-orange">.</span>
          </h2>
          <p className="text-sm text-stone-500 font-light italic leading-relaxed max-w-2xl">
            We're designing the Foundation to be sustainable by default. No external begging rounds; the platform funds the mission.
          </p>
        </header>

        <ul className="space-y-3">
          {MEMBER_SUPPORT.map((line, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-4">
              <span className="w-7 h-7 rounded-full bg-white border border-stone-100 flex items-center justify-center text-[10px] font-black text-stone-500 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-sm text-stone-600 font-light leading-relaxed">{line}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Programs */}
      <section className="py-14 sm:py-16 px-5 sm:px-6 bg-stone-50 border-y border-stone-100" aria-labelledby="programs-heading">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">04 — Programs</span>
            <h2 id="programs-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              What we're putting on the calendar<span className="text-brand-orange">.</span>
            </h2>
            <p className="text-sm text-stone-500 font-light italic leading-relaxed max-w-2xl">
              The first programs we want to ship as the Foundation takes shape. Cities lead, partners host, members show up.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROGRAMS.map((p) => (
              <article key={p.title} className="rounded-2xl bg-white border border-stone-100 p-6 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-serif italic leading-tight">{p.title}</h3>
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-full">{p.badge}</span>
                </div>
                <p className="text-sm text-stone-500 font-light leading-relaxed">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Get involved */}
      <section className="py-14 sm:py-16 px-5 sm:px-6" aria-labelledby="involve-heading">
        <div className="max-w-5xl mx-auto rounded-[2rem] bg-charcoal text-white p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 inline-flex items-center gap-2">
              <HandHeart size={11} /> Get involved
            </span>
            <h2 id="involve-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              For shelters, partners and humans who love dogs<span className="text-brand-orange">.</span>
            </h2>
            <p className="text-sm sm:text-base text-stone-400 font-light italic leading-relaxed max-w-md">
              Are you a shelter, a foster network, a wellness brand or a business that wants to host a Foundation activation? Let's talk.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:foundation@heylola.co?subject=Hey%20Lola%20Foundation"
              className="luxury-button bg-white text-charcoal h-12 px-6 text-[11px] font-black tracking-[0.25em] uppercase hover:bg-stone-100 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Mail size={14} /> foundation@heylola.co
            </a>
            <button
              type="button"
              onClick={onPartners}
              className="luxury-button border border-white/20 text-white/80 hover:text-white hover:border-white/40 h-12 px-6 text-[11px] font-black tracking-[0.25em] uppercase transition-colors inline-flex items-center justify-center gap-2"
            >
              <Globe size={14} /> Become a Partner <ArrowRight size={12} />
            </button>
            <button
              type="button"
              onClick={onJoin}
              className="luxury-button border border-white/20 text-white/80 hover:text-white hover:border-white/40 h-12 px-6 text-[11px] font-black tracking-[0.25em] uppercase transition-colors inline-flex items-center justify-center gap-2"
            >
              <PawPrint size={14} /> Join Hey Lola
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
