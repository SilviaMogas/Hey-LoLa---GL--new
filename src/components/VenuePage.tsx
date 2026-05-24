import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin, Phone, Globe, Instagram, Loader2, CalendarCheck, ShieldCheck } from 'lucide-react';
import { Place } from '../types';
import { curatedPlaces } from '../data/curatedPlaces';
import { venueSlug } from '../lib/utils';
import { BrandLogo } from './BrandLogo';
import { StatusBadge, ClaimedBadge, PartnerBadge, PerkBadge, ReservationsBadge } from './StatusBadge';
import { buildOpenTableUrl, logReservationClick } from '../lib/reservations';

interface VenuePageProps {
  slug: string;
  onClaim: (slug: string) => void;
  onBackToApp: () => void;
}

const placeMatches = (p: Pick<Place, 'name' | 'city'>, slug: string) => venueSlug(p.name, p.city) === slug;

export const VenuePage: React.FC<VenuePageProps> = ({ slug, onClaim, onBackToApp }) => {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    const fromSeed = curatedPlaces.find(p => placeMatches(p, slug));
    (async () => {
      try {
        const { data: rows } = await supabase.from('places').select('*').limit(500);
        if (!active) return;
        const fromDb = (rows || [])
          .map(d => ({ ...d } as Place))
          .find(p => placeMatches(p, slug) && !p.isHidden);
        const found = fromDb ?? (fromSeed ? ({ ...fromSeed, id: `seed-${slug}` } as Place) : null);
        setPlace(found);
        setNotFound(!found);
      } catch (err) {
        console.warn('VenuePage load error', err);
        if (!active) return;
        setPlace(fromSeed ? ({ ...fromSeed, id: `seed-${slug}` } as Place) : null);
        setNotFound(!fromSeed);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    if (place) {
      document.title = `${place.name} · ${place.city} — Hey Lola`;
    }
  }, [place]);

  const hasOpenTable = useMemo(() =>
    !!place?.openTableUrl
    && place.bookingStatus !== 'Not available'
    && place.reservationProvider !== 'Direct'
    && place.reservationProvider !== 'Other',
    [place],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (notFound || !place) {
    return (
      <div className="min-h-screen bg-bone flex flex-col items-center justify-center p-6 text-center gap-4">
        <h1 className="text-3xl font-serif italic text-charcoal">Venue not found</h1>
        <p className="text-stone-500">We couldn't find a listing for <code className="bg-stone-100 px-2 py-1 rounded">{slug}</code>.</p>
        <button onClick={onBackToApp} className="bg-charcoal text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.25em]">
          Back to Hey Lola
        </button>
      </div>
    );
  }

  const handleReserve = () => {
    if (!place.openTableUrl) return;
    const url = buildOpenTableUrl(place.openTableUrl, place);
    logReservationClick(place).catch(() => {});
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const cityCountry = place.city;
  const headerImg = place.image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80`;

  return (
    <div className="min-h-screen bg-bone font-boutique flex flex-col">
      {/* Top bar */}
      <header className="border-b border-stone-100 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={onBackToApp} className="flex items-center gap-2 text-stone-500 hover:text-charcoal text-[10px] font-black uppercase tracking-[0.2em]">
            <ArrowLeft size={14} /> Hey Lola
          </button>
          <BrandLogo size="sm" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative w-full h-[42vh] min-h-[280px] max-h-[480px] overflow-hidden">
        <img src={headerImg} alt={place.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 sm:px-6 py-6 max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={place.status} size="sm" className="shadow-sm" />
            {place.claimedBy && <ClaimedBadge size="sm" className="shadow-sm" />}
            {place.partnerStatus === 'active_partner' && <PartnerBadge size="sm" className="shadow-sm" />}
            {place.perkStatus === 'perk_active' && <PerkBadge size="sm" className="shadow-sm" />}
            {hasOpenTable && <ReservationsBadge size="sm" className="shadow-sm" />}
          </div>
          <h1 className="text-3xl md:text-3xl font-serif italic text-white tracking-tight leading-tight max-w-3xl">
            {place.name}
          </h1>
          <p className="text-sm md:text-base text-white/70 mt-1 uppercase tracking-[0.2em] font-black">
            {place.category} · {cityCountry}
          </p>
        </div>
      </section>

      {/* Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {place.description && (
            <section className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Curated note</span>
              <p className="text-base text-charcoal/80 font-serif leading-relaxed italic">"{place.description}"</p>
            </section>
          )}

          {place.utility && place.utility !== place.description && (
            <section className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Why we love it</span>
              <p className="text-sm text-charcoal/80 leading-relaxed italic">"{place.utility}"</p>
            </section>
          )}

          {place.perkStatus === 'perk_active' && place.memberPerk && (
            <section className="bg-charcoal text-white rounded-2xl p-5 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Member perk</span>
              <p className="text-sm leading-snug">{place.memberPerk}</p>
            </section>
          )}

          {hasOpenTable && (
            <section className="space-y-2">
              <button
                onClick={handleReserve}
                className="w-full flex items-center justify-center gap-2 bg-charcoal text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors shadow-md"
              >
                <CalendarCheck size={16} /> Reserve with OpenTable
              </button>
              <p className="text-center text-[9px] uppercase tracking-[0.25em] text-stone-400">
                Powered by OpenTable
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-3">
          <div className="bg-white border border-stone-100 rounded-2xl p-4 space-y-3 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Contact</span>
            {(place.address || place.neighborhood) && (
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-stone-400 mt-1 shrink-0" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.city}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-charcoal/80 hover:underline"
                >
                  {place.address || `${place.neighborhood}, ${place.city}`}
                </a>
              </div>
            )}
            {place.website && (
              <div className="flex items-start gap-3">
                <Globe size={14} className="text-stone-400 mt-1 shrink-0" />
                <a href={place.website} target="_blank" rel="noreferrer" className="text-sm text-charcoal/80 hover:underline break-all">
                  {place.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {place.phone && (
              <div className="flex items-start gap-3">
                <Phone size={14} className="text-stone-400 mt-1 shrink-0" />
                <a href={`tel:${place.phone}`} className="text-sm text-charcoal/80 hover:underline">{place.phone}</a>
              </div>
            )}
            {place.instagram && (
              <div className="flex items-start gap-3">
                <Instagram size={14} className="text-stone-400 mt-1 shrink-0" />
                <a
                  href={place.instagram.startsWith('http') ? place.instagram : `https://instagram.com/${place.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-charcoal/80 hover:underline"
                >
                  @{place.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-100 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Are you the owner?</span>
            </div>
            <p className="text-xs text-stone-500 leading-snug italic">
              Claim this listing to manage details, respond to reviews and unlock the Hey Lola Partner Network.
            </p>
            <button
              onClick={() => onClaim(slug)}
              className="w-full bg-charcoal text-white py-3 rounded-full text-[10px] font-black uppercase tracking-[0.25em] hover:bg-stone-800 transition-colors"
            >
              Claim this listing
            </button>
          </div>
        </aside>
      </main>

      <footer className="border-t border-stone-100 mt-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">
        © {new Date().getFullYear()} Hey Lola
      </footer>
    </div>
  );
};
