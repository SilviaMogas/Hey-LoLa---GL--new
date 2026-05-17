import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Calendar, ExternalLink, MapPin, Sparkles } from 'lucide-react';
import {
  HEY_LOLA_EVENTS,
  HEY_LOLA_LINKS,
  HEY_LOLA_MILESTONES,
  isUpcoming,
  type EventCategory,
  type HeyLolaEvent,
} from '../data/whatsOn';
import { SEO } from '../lib/seo';

interface WhatsOnProps {
  onBack: () => void;
}

const WHATS_ON_BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: "What's On", item: '/whats-on' },
];

const CATEGORY_LABEL: Record<EventCategory, string> = {
  launch: 'Launch',
  community: 'Community',
  foundation: 'Foundation',
  partner: 'Partner',
  press: 'Press',
};

const CATEGORY_CHIP: Record<EventCategory, string> = {
  launch: 'bg-[#FDE2CB] text-[#9E5826]',
  community: 'bg-[#D2E4F1] text-[#3F6B8C]',
  foundation: 'bg-[#F7D5CC] text-[#A33E29]',
  partner: 'bg-[#E0EDD2] text-[#5F7A4C]',
  press: 'bg-stone-100 text-stone-600',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const WhatsOn: React.FC<WhatsOnProps> = ({ onBack }) => {
  const { upcoming, past } = useMemo(() => {
    const today = new Date();
    const up: HeyLolaEvent[] = [];
    const ps: HeyLolaEvent[] = [];
    [...HEY_LOLA_EVENTS]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((e) => (isUpcoming(e, today) ? up.push(e) : ps.push(e)));
    return { upcoming: up, past: ps.reverse() };
  }, []);

  return (
    <main className="bg-white min-h-screen text-charcoal font-boutique" aria-labelledby="whats-on-heading">
      <SEO
        title="What's On — Hey Lola"
        description="Events, links and milestones from Hey Lola. Members-only gatherings, partner activations, foundation moments and city stories."
        url="/whats-on"
        breadcrumbs={WHATS_ON_BREADCRUMBS}
      />

      {/* Hero */}
      <section className="bg-charcoal text-white pt-14 pb-14 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <span className="inline-flex items-center gap-2 text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">
              <Sparkles size={11} /> What's On
            </span>
            <h1 id="whats-on-heading" className="text-4xl sm:text-5xl md:text-6xl font-serif italic tracking-tight leading-[0.9]">
              Gatherings, stories,<br />
              <span className="text-white/40">and a few firsts<span className="brand-dot" aria-hidden="true" /></span>
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-light italic leading-snug max-w-2xl">
              Where to find us, what we're announcing and the milestones along the way. Updated as the calendar fills in.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="py-12 sm:py-14 px-5 sm:px-6 max-w-5xl mx-auto" aria-labelledby="upcoming-heading">
        <header className="mb-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">01 — Upcoming</span>
          <h2 id="upcoming-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
            Save the date<span className="brand-dot" aria-hidden="true" />
          </h2>
        </header>

        {upcoming.length === 0 ? (
          <p className="text-sm text-stone-400 italic">No public events on the calendar right now. Watch this space.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} variant="upcoming" />
            ))}
          </div>
        )}
      </section>

      {/* Past events */}
      {past.length > 0 && (
        <section className="py-12 sm:py-14 px-5 sm:px-6 bg-stone-50/60 border-y border-stone-100" aria-labelledby="past-heading">
          <div className="max-w-5xl mx-auto">
            <header className="mb-8 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">02 — Past</span>
              <h2 id="past-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
                Where we have been<span className="brand-dot" aria-hidden="true" />
              </h2>
            </header>
            <div className="space-y-4">
              {past.map((e) => (
                <EventCard key={e.id} event={e} variant="past" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Links */}
      {HEY_LOLA_LINKS.length > 0 && (
        <section className="py-12 sm:py-14 px-5 sm:px-6 max-w-5xl mx-auto" aria-labelledby="links-heading">
          <header className="mb-8 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">03 — Links</span>
            <h2 id="links-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              Worth a click<span className="brand-dot" aria-hidden="true" />
            </h2>
          </header>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HEY_LOLA_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start justify-between gap-4 p-5 rounded-2xl border border-stone-100 hover:border-charcoal hover:bg-stone-50 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-serif italic text-lg leading-tight truncate">{l.label}</p>
                    {l.context && <p className="text-xs text-stone-500 font-light">{l.context}</p>}
                  </div>
                  <ExternalLink size={16} className="text-stone-400 group-hover:text-charcoal transition-colors shrink-0 mt-1" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Milestones */}
      <section className="py-12 sm:py-16 px-5 sm:px-6 bg-stone-50/60 border-t border-stone-100" aria-labelledby="milestones-heading">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">
              {HEY_LOLA_LINKS.length > 0 ? '04' : '03'} — Milestones
            </span>
            <h2 id="milestones-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              The Hey Lola timeline<span className="brand-dot" aria-hidden="true" />
            </h2>
          </header>
          <ol className="relative border-l border-stone-200 ml-3 space-y-8">
            {HEY_LOLA_MILESTONES.map((m) => (
              <li key={m.id} className="pl-6 relative">
                <span className="absolute left-[-7px] top-1 w-3 h-3 rounded-full bg-brand-orange ring-4 ring-white" aria-hidden />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{formatShortDate(m.date)}</p>
                <h3 className="text-xl font-serif italic mt-1 leading-tight">{m.title}</h3>
                <p className="text-sm text-stone-500 font-light leading-relaxed mt-2 max-w-2xl">{m.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
};

function EventCard({ event, variant }: { event: HeyLolaEvent; variant: 'upcoming' | 'past' }) {
  const isPast = variant === 'past';
  return (
    <article
      className={`rounded-[1.5rem] border ${
        isPast ? 'border-stone-100 bg-white opacity-90' : 'border-stone-100 bg-white hover:shadow-xl'
      } p-5 sm:p-6 transition-shadow`}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full ${CATEGORY_CHIP[event.category]}`}>
              {CATEGORY_LABEL[event.category]}
            </span>
            {event.tags?.map((t) => (
              <span key={t} className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
          <h3 className="font-serif italic text-2xl sm:text-3xl leading-tight">{event.title}</h3>
          <p className="text-sm text-stone-500 font-light leading-relaxed max-w-2xl">{event.description}</p>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-500 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={12} /> {formatDate(event.date)}
              {event.endDate ? ` — ${formatDate(event.endDate)}` : ''}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} /> {event.venue ? `${event.venue} · ${event.city}` : event.city}
            </span>
          </p>
        </div>

        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 self-start text-[10px] font-black uppercase tracking-[0.3em] px-5 py-3 rounded-full transition-colors ${
            isPast
              ? 'border border-stone-200 text-stone-500 hover:border-charcoal hover:text-charcoal'
              : 'bg-charcoal text-white hover:bg-charcoal/85'
          }`}
        >
          {isPast ? 'View details' : 'RSVP'} <ArrowRight size={12} />
        </a>
      </div>
    </article>
  );
}
