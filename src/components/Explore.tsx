import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart, X, MapPin, Search, Loader2, Phone, Globe, MessageSquare, Info, ShieldCheck, CheckCircle2, Lock, Sparkles, Send, Instagram, ExternalLink, CalendarCheck } from 'lucide-react';
import { StatusBadge, ClaimedBadge, PartnerBadge, PerkBadge, ReservationsBadge } from './StatusBadge';
import { buildOpenTableUrl, logReservationClick } from '../lib/reservations';
import { venueSlug } from '../lib/utils';
import { ClaimPlaceDialog } from './ClaimPlaceDialog';
import { db, auth, handleFirestoreError, OperationType, toggleOwnedDoc } from '../lib/firebase';
import { collection, query, getDocs, doc, where } from 'firebase/firestore';
import { Place, PlaceCategory } from '../types';
import { cn } from '../lib/utils';
import { track } from '../lib/analytics';
import { useTranslation } from '../lib/LanguageContext';
import { curatedPlaces } from '../data/curatedPlaces';
import { ScrollChips } from './ScrollChips';

// Custom orange pin — no asset requests, just an inline SVG
const PIN_ICON = L.divIcon({
  className: 'heylola-pin',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
  popupAnchor: [0, -32],
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36" width="28" height="36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 12.4 21 13 21.6.55.5 1.45.5 2 0C15.6 35 28 23.5 28 14 28 6.27 21.73 0 14 0z" fill="#0A0A0A"/>
    <circle cx="14" cy="14" r="5" fill="#F28C33"/>
  </svg>`,
});

// Re-center the map when the active city changes
function FlyToCity({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 0.6 }); }, [center, zoom, map]);
  return null;
}

interface ExploreProps {
  petName: string;
  isLoggedIn: boolean;
  onRequireAuth: (action?: () => void, title?: string, message?: string) => void;
  /** City detected from auth profile or geo signals. null = visitor is not in
   *  Barcelona/NYC/Miami; we render a generic "Start exploring" headline. */
  initialCity?: 'miami' | 'barcelona' | 'nyc' | 'toronto' | 'dc' | null;
  /** When false the heart on each card opens the upgrade modal instead of
   *  toggling a favorite (free tier can't save). */
  canSave?: boolean;
  onRequireUpgrade?: () => void;
}

type CityId = 'miami' | 'barcelona' | 'nyc' | 'toronto' | 'dc';
type ContinentId = 'europe' | 'americas' | 'asia' | 'middleEast' | 'oceania';

const CITIES: Record<CityId, { name: string; center: { lat: number; lng: number }; continent: ContinentId }> = {
  miami: { name: 'Miami', center: { lat: 25.7617, lng: -80.1918 }, continent: 'americas' },
  barcelona: { name: 'Barcelona', center: { lat: 41.3851, lng: 2.1734 }, continent: 'europe' },
  nyc: { name: 'New York City', center: { lat: 40.7128, lng: -74.0060 }, continent: 'americas' },
  toronto: { name: 'Toronto', center: { lat: 43.6532, lng: -79.3832 }, continent: 'americas' },
  dc: { name: 'Washington DC', center: { lat: 38.9072, lng: -77.0369 }, continent: 'americas' }
};

const COMING_SOON: Record<ContinentId, string[]> = {
  europe: ['Paris', 'London', 'Lisbon', 'Berlin', 'Rome'],
  americas: ['Mexico City', 'Buenos Aires', 'Los Angeles'],
  asia: ['Tokyo', 'Singapore', 'Seoul', 'Bangkok'],
  middleEast: ['Dubai', 'Tel Aviv'],
  oceania: ['Sydney', 'Melbourne']
};

const CONTINENT_ORDER: ContinentId[] = ['europe', 'americas', 'asia', 'middleEast', 'oceania'];

const CITY_PILL_BASE = "text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-all whitespace-nowrap border flex items-center gap-1.5";

const CATEGORIES: (PlaceCategory | 'All')[] = [
  'All',
  'Parks / green areas',
  'Dog-friendly cafes',
  'Dog-friendly restaurants',
  'Pet shops',
  'Veterinary clinics',
  'Grooming services',
  'Pet-friendly hotels',
  'Pet-friendly coworking spaces',
  'Beaches'
];

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-5 py-4 border-b-2 transition-all whitespace-nowrap",
        active ? 'border-charcoal text-charcoal' : 'border-transparent text-stone-300 hover:text-stone-400'
      )}
    >
      <span className={cn("transition-colors", active ? "text-charcoal" : "text-stone-300")}>{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-[0.15em]">{label}</span>
    </button>
  );
}

// Category → fallback image map. Uses well-known, stable Unsplash photos
// that load reliably with the auto=format CDN parameters.
const CATEGORY_FALLBACK: Record<string, string> = {
  'Parks / green areas': 'https://images.unsplash.com/photo-1452015238444-3acff7ade7ee?auto=format&fit=crop&w=600&q=80',
  'Dog-friendly cafes': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
  'Dog-friendly restaurants': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
  'Pet shops': 'https://images.unsplash.com/photo-1601758174039-71b21851fb01?auto=format&fit=crop&w=600&q=80',
  'Veterinary clinics': 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80',
  'Grooming services': 'https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=600&q=80',
  'Pet-friendly hotels': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
  'Pet-friendly coworking spaces': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80',
  'Beaches': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
};

// Final inline-SVG fallback — guaranteed to render even if the network blocks
// every Unsplash request. Uses brand colors and a category-aware emoji glyph.
const CATEGORY_GLYPH: Record<string, string> = {
  'Parks / green areas': '🌳',
  'Dog-friendly cafes': '☕',
  'Dog-friendly restaurants': '🍽',
  'Pet shops': '🛍',
  'Veterinary clinics': '🩺',
  'Grooming services': '✂',
  'Pet-friendly hotels': '🏨',
  'Pet-friendly coworking spaces': '💻',
  'Beaches': '🌊',
};
function inlineSvg(category?: string): string {
  const glyph = (category && CATEGORY_GLYPH[category]) || '🐾';
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
        '<rect width="400" height="300" fill="#F5F2ED"/>' +
        '<text x="200" y="170" text-anchor="middle" font-size="80" font-family="-apple-system, system-ui, sans-serif">' + glyph + '</text>' +
      '</svg>'
    )
  );
}

function PlaceImage({ src, alt, category, className }: { src?: string; alt: string; category?: string; className?: string }) {
  const [errorCount, setErrorCount] = useState(0);
  const categoryFallback = (category && CATEGORY_FALLBACK[category]) || CATEGORY_FALLBACK['Parks / green areas'];
  const sources = [src, categoryFallback, inlineSvg(category)].filter(Boolean) as string[];
  const safeSrc = sources[Math.min(errorCount, sources.length - 1)];
  return (
    <img
      src={safeSrc}
      alt={alt}
      loading="lazy"
      onError={() => setErrorCount((n) => Math.min(n + 1, sources.length - 1))}
      className={className}
    />
  );
}

function googleMapsUrl(spot: Place): string {
  const q = encodeURIComponent(`${spot.name} ${spot.address || spot.city}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function yelpUrl(spot: Place): string {
  return `https://www.yelp.com/search?find_desc=${encodeURIComponent(spot.name)}&find_loc=${encodeURIComponent(spot.city)}`;
}

function tripadvisorUrl(spot: Place): string {
  return `https://www.tripadvisor.com/Search?q=${encodeURIComponent(`${spot.name} ${spot.city}`)}`;
}

// Reservations: when a venue has an explicit OpenTable deeplink set in the
// back office we surface a primary "Reserve with OpenTable" CTA + an inline
// row in the contact list, and log every outbound click to /reservation_clicks
// for future affiliate-commission attribution. Categories outside this set
// just don't render the reservation affordances.
const RESTAURANT_CATEGORIES = new Set<PlaceCategory>(['Dog-friendly restaurants']);
function isRestaurant(spot: Place) {
  return RESTAURANT_CATEGORIES.has(spot.category);
}
function hasActiveOpenTable(spot: Place): boolean {
  if (!spot.openTableUrl) return false;
  if (spot.bookingStatus === 'Not available') return false;
  return spot.reservationProvider !== 'Direct' && spot.reservationProvider !== 'Other';
}

function instagramUrl(handle?: string): string | null {
  if (!handle) return null;
  const trimmed = handle.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const cleaned = trimmed
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/$/, '');
  return `https://instagram.com/${cleaned}`;
}

function instagramHandleLabel(handle?: string): string {
  if (!handle) return '';
  return '@' + handle.trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/$/, '');
}

function prettyHostname(url?: string): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '') + (u.pathname && u.pathname !== '/' ? u.pathname : '');
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }
}

function ReservationBlock({ spot }: { spot: Place }) {
  const handleClick = () => {
    const target = buildOpenTableUrl(spot.openTableUrl!, spot);
    logReservationClick(spot).catch(() => {});
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  if (hasActiveOpenTable(spot)) {
    return (
      <div className="space-y-2">
        <button
          onClick={handleClick}
          className="w-full flex items-center justify-center gap-2 bg-charcoal text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors shadow-md"
        >
          <CalendarCheck size={16} /> Reserve with OpenTable
        </button>
        <p className="text-center text-[9px] uppercase tracking-[0.25em] text-stone-400">
          Powered by OpenTable
        </p>
      </div>
    );
  }

  if (isRestaurant(spot) && !spot.openTableUrl) {
    return (
      <div className="bg-bone border border-stone-line rounded-2xl px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">
          {spot.phone ? 'Book by phone' : 'Walk-ins welcome'}
        </p>
        {spot.phone && (
          <p className="text-[10px] text-stone-400 mt-1">
            <a href={`tel:${spot.phone}`} className="underline">Call venue</a>
          </p>
        )}
      </div>
    );
  }

  return null;
}

function ContactRow({ icon, label, value, href, onClick }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  onClick?: () => void;
}) {
  const valueEl = href ? (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      onClick={onClick}
      className="text-charcoal hover:underline decoration-stone-300 underline-offset-2 break-all"
    >
      {value}
    </a>
  ) : (
    <span className="text-charcoal break-words">{value}</span>
  );
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-bone flex items-center justify-center shrink-0 text-stone-400 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-black uppercase tracking-[0.25em] text-stone-300 mb-0.5">{label}</p>
        <p className="text-sm font-medium leading-snug">{valueEl}</p>
      </div>
    </div>
  );
}

function ReviewLinkCard({ icon, label, rating, href }: {
  icon: React.ReactNode;
  label: string;
  /** Aggregate rating to display next to the platform name. */
  rating?: number;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-stone-line hover:border-charcoal/30 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-bone flex items-center justify-center text-charcoal shrink-0">
          {icon}
        </div>
        <p className="text-sm font-bold tracking-tight text-charcoal truncate">{label}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {typeof rating === 'number' && rating > 0 ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-charcoal">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {rating.toFixed(1)}
          </span>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">View</span>
        )}
        <ExternalLink size={14} className="text-stone-300 group-hover:text-charcoal transition-colors" />
      </div>
    </a>
  );
}

function PlaceDetail({ spot, onClose, isFavorite, onToggleFavorite }: { spot: Place, onClose: () => void, isFavorite: boolean, onToggleFavorite: (id: string) => void }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'info' | 'community' | 'reviews'>('info');
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimSent, setClaimSent] = useState(false);

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed md:absolute top-0 right-0 bottom-0 w-full md:w-[480px] bg-white shadow-2xl z-[60] border-l border-stone-line overflow-y-auto"
    >
      <div className="p-4 md:p-5 space-y-5 pb-10">
        <div className="flex items-center justify-between">
           <button onClick={onClose} className="flex items-center gap-2 text-stone-300 hover:text-charcoal transition-colors group">
             <X size={18} className="group-hover:rotate-90 transition-transform" /> 
             <span className="text-[9px] font-black uppercase tracking-[0.2em]">{t.explore.backToResults}</span>
           </button>
           <button 
            onClick={() => onToggleFavorite(spot.id)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all border",
              isFavorite ? 'bg-charcoal border-charcoal text-white shadow-md' : 'bg-white border-stone-line text-stone-300 hover:text-charcoal hover:border-stone-200'
            )}
           >
             <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
           </button>
        </div>

        <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-bone relative group">
           <PlaceImage src={spot.image} alt={spot.name} category={spot.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
           <div className="absolute top-3 left-3 right-3 flex flex-col items-start gap-1.5">
              <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.15em] text-charcoal shadow-sm border border-stone-line max-w-full truncate">
                {spot.category}
              </span>
              <StatusBadge status={spot.status} size="sm" className="shadow-sm max-w-full" />
              {spot.claimedBy && <ClaimedBadge size="sm" className="shadow-sm max-w-full" />}
              {spot.partnerStatus === 'active_partner' && <PartnerBadge size="sm" className="shadow-sm max-w-full" />}
              {spot.perkStatus === 'perk_active' && <PerkBadge size="sm" className="shadow-sm max-w-full" />}
              {hasActiveOpenTable(spot) && <ReservationsBadge size="sm" className="shadow-sm max-w-full" />}
           </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight leading-[0.95]">{spot.name}</h2>
          <p className="text-stone-400 text-xs font-medium flex items-center gap-1.5 italic">
            <MapPin size={11} className="text-stone-400" /> {[spot.neighborhood, spot.city].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div className="flex border-b border-stone-line">
           <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon={<Info size={14}/>} label="The Vibe" />
           <TabButton active={activeTab === 'community'} onClick={() => setActiveTab('community')} icon={<MessageSquare size={14}/>} label="Community" />
           <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={<Star size={14}/>} label={t.explore.reviews} />
        </div>

        {activeTab === 'info' && (
          <div className="space-y-5 animate-fade-in pt-3">
             {spot.description && (
               <div className="space-y-2">
                  <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-300">Curated Notes</h4>
                  <p className="text-sm text-stone-500 font-serif leading-relaxed italic">"{spot.description}"</p>
               </div>
             )}

             {spot.utility && spot.utility !== spot.description && (
               <div className="bg-bone p-4 rounded-2xl border border-stone-line space-y-2 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-charcoal">
                     <Star size={12} fill="currentColor" />
                     <h4 className="text-[9px] font-black uppercase tracking-[0.2em]">Concierge Insight</h4>
                  </div>
                  <p className="text-xs text-charcoal/70 font-medium leading-relaxed italic">"{spot.utility}"</p>
               </div>
             )}

             {spot.perkStatus === 'perk_active' && spot.memberPerk && (
               <div className="bg-charcoal p-4 rounded-2xl space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Member Perk</p>
                  <p className="text-sm text-white font-medium leading-snug">{spot.memberPerk}</p>
               </div>
             )}

             {spot.recommendedBy && (
               <div className="flex items-center gap-3 p-3 rounded-xl border border-stone-line bg-white">
                  <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-[10px] font-black text-stone-400 shrink-0">
                    ✦
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">Recommended by</p>
                    {spot.recommendedByUrl ? (
                      <a href={spot.recommendedByUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-charcoal hover:underline truncate block">
                        {spot.recommendedBy}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-charcoal truncate">{spot.recommendedBy}</p>
                    )}
                  </div>
               </div>
             )}

             <ReservationBlock spot={spot} />

             <div className="space-y-5">
                {([
                  (spot.address || spot.neighborhood) && {
                    icon: <MapPin size={16} />,
                    label: t.explore.addressLabel,
                    value: spot.address || `${spot.neighborhood}, ${spot.city}`,
                    href: googleMapsUrl(spot),
                  },
                  spot.website && {
                    icon: <Globe size={16} />,
                    label: t.explore.websiteLabel,
                    value: prettyHostname(spot.website),
                    href: spot.website,
                  },
                  hasActiveOpenTable(spot) && {
                    icon: <CalendarCheck size={16} />,
                    label: 'Reservations',
                    value: 'Reserve with OpenTable',
                    href: buildOpenTableUrl(spot.openTableUrl!, spot),
                    onClick: () => { logReservationClick(spot).catch(() => {}); },
                  },
                  spot.phone && {
                    icon: <Phone size={16} />,
                    label: t.explore.phoneLabel,
                    value: spot.phone,
                    href: `tel:${spot.phone}`,
                  },
                  instagramUrl(spot.instagram) && {
                    icon: <Instagram size={16} />,
                    label: t.explore.instagramLabel,
                    value: instagramHandleLabel(spot.instagram),
                    href: instagramUrl(spot.instagram)!,
                  },
                ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href: string; onClick?: () => void }[])
                  .map(row => (
                    <ContactRow key={row.label} {...row} />
                  ))}
             </div>

             <div className="bg-bone/50 p-8 rounded-2xl border border-stone-line space-y-5">
                <div className="flex items-center gap-2 text-stone-300">
                  <ShieldCheck size={18} />
                  <h4 className="text-[8px] font-black uppercase tracking-[0.2em]">Lola for Business</h4>
                </div>
                <p className="text-[11px] text-stone-400 font-medium leading-relaxed italic">Are you the owner? Submit a claim and our team will review it before this listing is marked as verified.</p>
                {claimSent ? (
                  <div className="w-full min-h-12 px-4 py-3 bg-[#EBF1E9] rounded-full flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#7A8C6E] text-center">
                    <CheckCircle2 size={14} /> {t.explore.claimSent}
                  </div>
                ) : (
                  <button
                    onClick={() => setClaimDialogOpen(true)}
                    className="w-full bg-charcoal text-white h-12 rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98]"
                  >
                    {t.explore.claimThisPlace}
                  </button>
                )}
                <a
                  href={`/venue/${venueSlug(spot.name, spot.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-charcoal underline-offset-4 hover:underline"
                >
                  View public page
                </a>
             </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="animate-fade-in pt-4">
            <div className="bg-bone p-8 rounded-[2rem] border border-stone-line text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-white border border-stone-line flex items-center justify-center text-stone-400">
                <MessageSquare size={18} />
              </div>
              <h4 className="text-base font-bold tracking-tight text-charcoal">{t.explore.communityComingSoon}</h4>
              <p className="text-[11px] text-stone-400 italic leading-snug max-w-sm mx-auto">{t.explore.communityComingSoonDesc}</p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-fade-in pt-4 space-y-5">
            <div className="space-y-2">
              <h4 className="text-base font-bold tracking-tight text-charcoal">{t.explore.externalReviewsTitle}</h4>
              <p className="text-[12px] text-stone-400 italic leading-snug">{t.explore.externalReviewsDesc}</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: <MapPin size={16} />, label: t.explore.viewOnGoogle, href: googleMapsUrl(spot) },
                { icon: <Star size={16} />, label: t.explore.viewOnYelp, href: yelpUrl(spot) },
                { icon: <Globe size={16} />, label: t.explore.viewOnTripadvisor, href: tripadvisorUrl(spot) },
              ].map(row => (
                <ReviewLinkCard
                  key={row.label}
                  icon={row.icon}
                  label={row.label}
                  rating={spot.rating}
                  href={row.href}
                />
              ))}
            </div>
          </div>
        )}

        <div className="pt-10 text-center space-y-2">
           <p className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-300">Need help with this listing?</p>
           <a href="mailto:hey@heylola.co" className="text-[10px] font-bold text-charcoal hover:underline">hey@heylola.co</a>
        </div>
      </div>

      <ClaimPlaceDialog
        place={spot}
        open={claimDialogOpen}
        onClose={() => setClaimDialogOpen(false)}
        onSubmitted={() => { setClaimDialogOpen(false); setClaimSent(true); }}
      />
    </motion.div>
  );
}

export const Explore: React.FC<ExploreProps> = ({ petName, isLoggedIn, onRequireAuth, initialCity, canSave = true, onRequireUpgrade }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  // ?city=miami|nyc|barcelona overrides the geo-detected city. Used by the
  // homepage CityCard links so a click lands on the right city.
  const cityParam = (() => {
    const raw = searchParams.get('city')?.toLowerCase();
    if (raw === 'miami' || raw === 'nyc' || raw === 'barcelona' || raw === 'toronto' || raw === 'dc') return raw;
    if (raw === 'newyork' || raw === 'new-york') return 'nyc';
    if (raw === 'washington' || raw === 'washington-dc') return 'dc';
    return null;
  })();
  const startCity: CityId = cityParam ?? (initialCity ?? null) ?? 'barcelona';
  const [activeCity, setActiveCity] = useState<CityId>(startCity);
  const [activeContinent, setActiveContinent] = useState<ContinentId>(CITIES[startCity].continent);
  const [hasSyncedDetected, setHasSyncedDetected] = useState<boolean>(cityParam !== null);
  const personaliseHeadline = initialCity !== null || cityParam !== null;

  // If the URL ?city= changes (e.g. user clicks a different CityCard while
  // already on /explore), reflect it in state and then strip the param so
  // it does not stay sticky after manual city changes.
  useEffect(() => {
    if (!cityParam) return;
    if (cityParam !== activeCity) {
      setActiveCity(cityParam);
      setActiveContinent(CITIES[cityParam].continent);
    }
    setHasSyncedDetected(true);
    const next = new URLSearchParams(searchParams);
    next.delete('city');
    setSearchParams(next, { replace: true });
  }, [cityParam, activeCity, searchParams, setSearchParams]);

  // The detected city arrives asynchronously (IP geolocation lookup), so we
  // promote it once it lands — but only if the user hasn't manually picked a
  // different city in the meantime.
  useEffect(() => {
    if (hasSyncedDetected) return;
    if (!initialCity) return;
    if (initialCity !== activeCity) {
      setActiveCity(initialCity);
      setActiveContinent(CITIES[initialCity].continent);
    }
    setHasSyncedDetected(true);
  }, [initialCity, hasSyncedDetected, activeCity]);
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | 'All'>("All");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbPlaces, setDbPlaces] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [voteBusy, setVoteBusy] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionStatus, setSuggestionStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'places'));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place));
        setDbPlaces(fetched);

        if (isLoggedIn && auth.currentUser) {
          const favRef = collection(db, 'favorites');
          const favQ = query(favRef, where('userId', '==', auth.currentUser.uid));
          const favSnapshot = await getDocs(favQ);
          setFavorites(favSnapshot.docs.map(doc => doc.data().placeId));

          const votesRef = collection(db, 'city_votes');
          const votesSnapshot = await getDocs(votesRef);
          const counts: Record<string, number> = {};
          const mine = new Set<string>();
          votesSnapshot.docs.forEach(d => {
            const data = d.data() as { userId?: string; city?: string };
            if (!data.city) return;
            counts[data.city] = (counts[data.city] || 0) + 1;
            if (data.userId === auth.currentUser?.uid) mine.add(data.city);
          });
          setVoteCounts(counts);
          setUserVotes(mine);
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, 'data');
      }
    };
    fetchData();
  }, [isLoggedIn]);

  const bumpVoteState = useCallback((city: string, delta: 1 | -1) => {
    setVoteCounts(prev => ({ ...prev, [city]: Math.max(0, (prev[city] || 0) + delta) }));
    setUserVotes(prev => {
      const next = new Set(prev);
      if (delta > 0) next.add(city); else next.delete(city);
      return next;
    });
  }, []);

  const castVote = useCallback(async (cityName: string, continent: ContinentId) => {
    if (!isLoggedIn || !auth.currentUser) { onRequireAuth(); return; }
    if (voteBusy) return;
    setVoteBusy(cityName);
    try {
      const { created } = await toggleOwnedDoc('city_votes', 'city', cityName, { continent, isSuggestion: false });
      bumpVoteState(cityName, created ? 1 : -1);
      track(created ? 'city_voted' : 'city_unvoted', { city: cityName, continent });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'city_votes');
    } finally {
      setVoteBusy(null);
    }
  }, [isLoggedIn, onRequireAuth, voteBusy, bumpVoteState]);

  const submitSuggestion = useCallback(async () => {
    const value = suggestion.trim();
    if (!value) return;
    if (!isLoggedIn || !auth.currentUser) { onRequireAuth(); return; }
    setSuggestionStatus('sending');
    try {
      const { created } = await toggleOwnedDoc('city_votes', 'city', value, { continent: 'suggestion', isSuggestion: true });
      if (created) bumpVoteState(value, 1);
      track('city_suggested', { city: value });
      setSuggestion('');
      setSuggestionStatus('sent');
      setTimeout(() => setSuggestionStatus('idle'), 2500);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'city_votes');
      setSuggestionStatus('idle');
    }
  }, [suggestion, isLoggedIn, onRequireAuth, bumpVoteState]);

  const toggleFavorite = async (placeId: string) => {
    if (!isLoggedIn) { onRequireAuth(); return; }
    if (!auth.currentUser) return;
    // Saving spots is a paid-tier perk. Free / signed-out users see the
    // upgrade modal explaining how to unlock it. Existing favourites can
    // still be removed, so the unfavourite path skips the gate.
    const alreadySaved = favorites.includes(placeId);
    if (!alreadySaved && !canSave) {
      onRequireUpgrade?.();
      return;
    }
    try {
      const { created } = await toggleOwnedDoc('favorites', 'placeId', placeId);
      track(created ? 'place_favorited' : 'place_unfavorited', { placeId });
      setFavorites(prev => created ? [...prev, placeId] : prev.filter(id => id !== placeId));
    } catch (e) {
      console.error("Favorite error", e);
    }
  };

  const spots = useMemo(() => {
    const cityName = CITIES[activeCity].name;
    const combined = [...dbPlaces];
    curatedPlaces.forEach(cp => {
      if (!dbPlaces.find(p => p.name === cp.name && p.city === cp.city)) {
        combined.push({ ...cp, id: `curated_${cp.name.replace(/\s/g, '_')}` } as Place);
      }
    });

    return combined.filter(p => 
      p.city === cityName &&
      (activeCategory === "All" || p.category === activeCategory) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [dbPlaces, activeCity, activeCategory, searchQuery]);

  const handlePlaceClick = useCallback((place: Place) => {
    if (!isLoggedIn && clickCount >= 3) {
      onRequireAuth();
      return;
    }
    setClickCount(prev => prev + 1);
    setSelectedPlace(place);
  }, [isLoggedIn, clickCount, onRequireAuth]);

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-120px)] pb-8">
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
           <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter leading-[0.95] max-w-xl text-charcoal">
             {personaliseHeadline ? (
               <>Explore <span className="text-stone-300">{CITIES[activeCity].name}</span><span className="brand-dot" aria-hidden="true" /></>
             ) : (
               <>Start <span className="text-stone-300">exploring</span><span className="brand-dot" aria-hidden="true" /></>
             )}
           </h2>
           <p className="text-sm font-medium text-stone-400 max-w-md italic leading-snug">{t.explore.subtitle}</p>
        </div>

        <div className="space-y-2">
          <p className="text-[8px] font-black uppercase tracking-widest text-stone-300 ml-1">{t.explore.switchDestination}</p>

          <div className="flex gap-1.5 p-1 bg-white rounded-full border border-stone-line shadow-sm overflow-x-auto w-fit max-w-full">
            {CONTINENT_ORDER.map(cont => {
              const label = t.explore[`continent${cont.charAt(0).toUpperCase() + cont.slice(1)}` as keyof typeof t.explore] as string;
              const unlockedCount = (Object.values(CITIES) as { continent: ContinentId }[]).filter(c => c.continent === cont).length;
              return (
                <button
                  key={cont}
                  onClick={() => setActiveContinent(cont)}
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5",
                    activeContinent === cont
                      ? 'bg-charcoal text-white shadow-md'
                      : 'text-stone-400 hover:text-charcoal hover:bg-stone-50'
                  )}
                >
                  {label}
                  {unlockedCount > 0 && (
                    <span className={cn(
                      "text-[8px] rounded-full px-1.5 py-0.5",
                      activeContinent === cont ? 'bg-white/20' : 'bg-stone-100 text-stone-400'
                    )}>{unlockedCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 pt-1 w-full">
            {(Object.entries(CITIES) as [CityId, typeof CITIES[CityId]][])
              .filter(([, city]) => city.continent === activeContinent)
              .map(([id, city]) => (
                <button
                  key={id}
                  onClick={() => setActiveCity(id)}
                  className={cn(
                    CITY_PILL_BASE,
                    activeCity === id
                      ? 'bg-charcoal text-white border-charcoal shadow-md'
                      : 'bg-white text-charcoal border-stone-line hover:border-stone-300'
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", activeCity === id ? "bg-[#B4CDA5]" : "bg-[#7A8C6E]" )} />
                  {city.name}
                </button>
              ))}
            {COMING_SOON[activeContinent].map(cityName => {
              const isVoted = userVotes.has(cityName);
              const count = voteCounts[cityName] || 0;
              const busy = voteBusy === cityName;
              return (
                <button
                  key={cityName}
                  onClick={() => castVote(cityName, activeContinent)}
                  disabled={busy}
                  title={isLoggedIn ? (isVoted ? t.explore.voted : t.explore.voteCity) : t.explore.loginToVote}
                  className={cn(
                    CITY_PILL_BASE,
                    'group',
                    isVoted
                      ? 'bg-stone-100 text-charcoal border-stone-200'
                      : 'bg-white text-stone-400 border-dashed border-stone-200 hover:border-stone-400 hover:text-charcoal'
                  )}
                >
                  <Lock size={9} className="text-stone-300 group-hover:text-stone-400" />
                  {cityName}
                  <span className="text-[8px] font-bold opacity-50 ml-1">{count}</span>
                </button>
              );
            })}
          </div>

          {COMING_SOON[activeContinent].length > 0 && (
            <p className="text-[10px] italic text-stone-300 ml-1">
              {t.explore.comingSoon} — {isLoggedIn ? t.explore.voteCity.toLowerCase() : t.explore.loginToVote.toLowerCase()}.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="relative group max-w-2xl w-full">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-charcoal transition-colors" />
          <input
            type="text"
            placeholder={t.explore.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-line h-11 md:h-12 pl-14 pr-8 rounded-full text-sm font-medium focus:outline-none focus:border-charcoal/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
          />
        </div>

        <ScrollChips ariaLabel="Filter places by category">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'snap-start shrink-0 whitespace-nowrap px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.18em] transition-all border',
                activeCategory === cat
                  ? 'bg-charcoal text-white border-charcoal shadow-sm'
                  : 'bg-stone-50 text-stone-500 border-stone-100 hover:border-stone-300 hover:text-charcoal hover:bg-white',
              )}
            >
              {cat === 'All' ? 'All' : cat}
            </button>
          ))}
        </ScrollChips>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 min-h-[700px] relative">
         <div className="lg:hidden flex p-1 bg-stone-50 rounded-2xl border border-stone-100 mb-4">
            <button 
              onClick={() => setViewMode('list')}
              className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest", viewMode === 'list' ? 'bg-white shadow-sm text-charcoal' : 'text-stone-400')}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest", viewMode === 'map' ? 'bg-white shadow-sm text-charcoal' : 'text-stone-400')}
            >
              Map
            </button>
         </div>

         <div className={cn("flex-1 space-y-4 lg:block lg:w-1/3 overflow-y-auto max-h-[800px] pr-4 scrollbar-hide", viewMode === 'map' && 'hidden')}>
            {spots.map(spot => (
              <motion.div 
                key={spot.id}
                whileHover={{ y: -2 }}
                onClick={() => handlePlaceClick(spot)}
                className="bg-white p-3 rounded-[1.5rem] border border-stone-line shadow-[0_4px_15px_rgba(0,0,0,0.01)] group cursor-pointer flex gap-3 hover:border-stone-200 transition-all"
              >
                 <div className="w-[72px] h-[72px] rounded-[1.25rem] overflow-hidden shrink-0 border border-stone-line">
                    <PlaceImage src={spot.image} alt={spot.name} category={spot.category} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 </div>
                 <div className="flex-1 min-w-0 space-y-1 py-0.5">
                    <div className="flex items-center justify-between">
                       <span className="text-[8px] font-black uppercase tracking-[0.14em] text-charcoal">{spot.category}</span>
                       <div className="flex items-center gap-1 text-[8px] font-bold text-stone-300">
                          <Star size={9} className="fill-amber-400 text-amber-400" /> {spot.rating || 4.5}
                       </div>
                    </div>
                    <h4 className="text-base font-bold tracking-tight text-charcoal truncate">{spot.name}</h4>
                    <p className="text-[11px] text-stone-400 line-clamp-1 italic leading-tight">"{spot.description}"</p>
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                       <StatusBadge status={spot.status} />
                       {spot.claimedBy && <ClaimedBadge />}
                       {spot.partnerStatus === 'active_partner' && <PartnerBadge />}
                       {spot.perkStatus === 'perk_active' && <PerkBadge />}
                       {hasActiveOpenTable(spot) && <ReservationsBadge />}
                    </div>
                 </div>
              </motion.div>
            ))}
            {spots.length === 0 && (
              <div className="py-8 text-center space-y-4">
                 <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200">
                    <Search size={32} />
                 </div>
                 <p className="text-stone-400 font-bold italic">No places found in this category.</p>
              </div>
            )}
         </div>

         <div className={cn("flex-[2] rounded-2xl overflow-hidden border border-stone-100 shadow-soft bg-stone-50 lg:block min-h-[500px] relative z-0", viewMode === 'list' && 'hidden lg:block')}>
            <MapContainer
              center={[CITIES[activeCity].center.lat, CITIES[activeCity].center.lng]}
              zoom={13}
              scrollWheelZoom
              zoomControl
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                maxZoom={19}
                subdomains={['a', 'b', 'c', 'd']}
              />
              <FlyToCity center={[CITIES[activeCity].center.lat, CITIES[activeCity].center.lng]} zoom={13} />
              {spots.map(spot => (
                <Marker
                  key={spot.id}
                  position={[spot.lat, spot.lng]}
                  icon={PIN_ICON}
                  eventHandlers={{ click: () => handlePlaceClick(spot) }}
                >
                  <Popup>
                    <strong style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, color: '#0A0A0A' }}>{spot.name}</strong>
                    <br />
                    <span style={{ fontSize: 11, color: '#78716C' }}>{spot.category}</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
         </div>

         <AnimatePresence>
            {selectedPlace && (
              <PlaceDetail
                spot={selectedPlace}
                onClose={() => setSelectedPlace(null)}
                isFavorite={favorites.includes(selectedPlace.id)}
                onToggleFavorite={toggleFavorite}
              />
            )}
         </AnimatePresence>
      </div>

      <VoteSection
        isLoggedIn={isLoggedIn}
        onRequireAuth={onRequireAuth}
        voteCounts={voteCounts}
        userVotes={userVotes}
        onVote={castVote}
        voteBusy={voteBusy}
        suggestion={suggestion}
        setSuggestion={setSuggestion}
        suggestionStatus={suggestionStatus}
        onSubmitSuggestion={submitSuggestion}
      />
    </div>
  );
};

interface VoteSectionProps {
  isLoggedIn: boolean;
  onRequireAuth: (action?: () => void, title?: string, message?: string) => void;
  voteCounts: Record<string, number>;
  userVotes: Set<string>;
  onVote: (city: string, continent: ContinentId) => void;
  voteBusy: string | null;
  suggestion: string;
  setSuggestion: (v: string) => void;
  suggestionStatus: 'idle' | 'sending' | 'sent';
  onSubmitSuggestion: () => void;
}

function VoteSection({
  isLoggedIn,
  onRequireAuth,
  voteCounts,
  userVotes,
  onVote,
  voteBusy,
  suggestion,
  setSuggestion,
  suggestionStatus,
  onSubmitSuggestion,
}: VoteSectionProps) {
  const { t } = useTranslation();

  const ranked = useMemo(() => {
    const all: { city: string; continent: ContinentId; count: number }[] = [];
    (Object.entries(COMING_SOON) as [ContinentId, string[]][]).forEach(([continent, cities]) => {
      cities.forEach(city => {
        all.push({ city, continent, count: voteCounts[city] || 0 });
      });
    });
    return all.sort((a, b) => b.count - a.count).slice(0, 8);
  }, [voteCounts]);

  return (
    <section className="mt-6 pt-12 border-t border-stone-line space-y-8">
      <div className="flex items-center gap-2 text-stone-400">
        <Sparkles size={14} />
        <span className="text-[8px] font-black uppercase tracking-[0.25em]">{t.explore.expansionTitle}</span>
      </div>
      <div className="space-y-3 max-w-2xl">
        <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-[0.95] text-charcoal">
          {t.explore.voteSectionTitle}<span className="brand-dot" aria-hidden="true" />
        </h3>
        <p className="text-base font-medium text-stone-400 italic leading-tight">{t.explore.voteSectionDesc}</p>
      </div>

      {!isLoggedIn ? (
        <div className="bg-bone p-8 rounded-[2rem] border border-stone-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-3">
            <Lock size={16} className="text-stone-400 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold tracking-tight text-charcoal">{t.explore.loginToVote}</p>
              <p className="text-[11px] text-stone-400 italic leading-tight">{t.explore.expansionDesc}</p>
            </div>
          </div>
          <button
            onClick={() => onRequireAuth()}
            className="bg-charcoal text-white h-11 px-7 rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-md whitespace-nowrap"
          >
            {t.explore.voteCity}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-stone-300 mb-3 ml-1">{t.explore.topRequested}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ranked.map(({ city, continent, count }) => {
                const voted = userVotes.has(city);
                const busy = voteBusy === city;
                return (
                  <button
                    key={city}
                    onClick={() => onVote(city, continent)}
                    disabled={busy}
                    className={cn(
                      "text-left p-5 rounded-[1.5rem] border transition-all group flex items-center justify-between gap-3",
                      voted
                        ? 'bg-brand-orange/10 border-brand-orange/30'
                        : 'bg-white border-stone-line hover:border-stone-300'
                    )}
                  >
                    <div className="space-y-1 min-w-0">
                      <p className={cn(
                        "text-sm font-bold tracking-tight truncate",
                        voted ? 'text-brand-orange' : 'text-charcoal'
                      )}>{city}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">
                        {count} {t.explore.votesLabel}
                      </p>
                    </div>
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      voted ? 'bg-brand-orange text-white' : 'bg-stone-50 text-stone-300 group-hover:bg-charcoal group-hover:text-white'
                    )}>
                      {busy ? <Loader2 size={14} className="animate-spin" /> : voted ? <CheckCircle2 size={14} /> : <Sparkles size={14} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-3 pl-6 rounded-full border border-stone-line shadow-sm flex items-center gap-3">
            <Sparkles size={14} className="text-stone-300 shrink-0" />
            <input
              type="text"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSubmitSuggestion(); }}
              placeholder={t.explore.suggestionPlaceholder}
              maxLength={60}
              className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-stone-300"
            />
            <button
              onClick={onSubmitSuggestion}
              disabled={!suggestion.trim() || suggestionStatus === 'sending'}
              className="bg-charcoal text-white h-11 px-6 rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-40"
            >
              {suggestionStatus === 'sending' ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              {t.explore.submitSuggestion}
            </button>
          </div>
          {suggestionStatus === 'sent' && (
            <p className="text-[11px] text-[#7A8C6E] italic flex items-center gap-1.5">
              <CheckCircle2 size={12} /> {t.explore.suggestionSent}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
