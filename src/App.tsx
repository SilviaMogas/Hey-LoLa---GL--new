/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './lib/useAuth';
import { isAdminEmail } from './lib/admin';
import { detectCity, type SupportedCity } from './lib/geo';
import { canSavePlaces } from './lib/membership';
import { paths, buildPath } from './lib/routes';
import { ProtectedRoute, AdminRoute, GuestOnlyRoute } from './lib/guards';
import { DraftRoute } from './components/DraftRoute';
import { UpgradeModal } from './components/UpgradeModal';
import { PetData, UserProfile } from './types';
import { supabase } from './lib/supabase';
import { Home } from './components/Home';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SoftPaywall } from './components/SoftPaywall';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PawLoader } from './components/PawLoader';
import { Analytics } from '@vercel/analytics/react';
import { motion } from 'motion/react';
import { LanguageProvider } from './lib/LanguageContext';
import { CookieBanner } from './components/CookieBanner';
import { ComingSoon, hasAccess } from './components/ComingSoon';
import { VerifyEmailBanner } from './components/VerifyEmailBanner';

import { WaitlistModal, WaitlistType } from './components/WaitlistModal';

/**
 * Wraps React.lazy so a failed dynamic import does not crash into the error
 * boundary. This happens when a new deploy changes the asset hashes while a
 * visitor still has the previous index.html cached: the old chunk path 404s
 * ("Failed to fetch dynamically imported module"). We reload once to pull the
 * fresh asset map; a sessionStorage flag prevents reload loops.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyWithReload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch((err: unknown) => {
      const KEY = 'heylola_chunk_reloaded';
      if (typeof window !== 'undefined' && !sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, '1');
        window.location.reload();
        return new Promise<{ default: T }>(() => {}); // never resolves; the page is reloading
      }
      throw err;
    }),
  );
}

// Code-split heavy / less-critical views — they only ship when needed
const Auth = lazyWithReload(() => import('./components/Auth').then(m => ({ default: m.Auth })));
const Explore = lazyWithReload(() => import('./components/Explore').then(m => ({ default: m.Explore })));
const Community = lazyWithReload(() => import('./components/Community').then(m => ({ default: m.Community })));
const CommunityGroup = lazyWithReload(() => import('./components/CommunityGroup').then(m => ({ default: m.CommunityGroup })));
const PetProfile = lazyWithReload(() => import('./components/PetProfile').then(m => ({ default: m.PetProfile })));
const ShelterPortal = lazyWithReload(() => import('./components/ShelterPortal').then(m => ({ default: m.ShelterPortal })));
const Dashboard = lazyWithReload(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const Passport = lazyWithReload(() => import('./components/Passport').then(m => ({ default: m.Passport })));
const Onboarding = lazyWithReload(() => import('./components/Onboarding').then(m => ({ default: m.Onboarding })));
const Admin = lazyWithReload(() => import('./components/Admin').then(m => ({ default: m.Admin })));
const Blog = lazyWithReload(() => import('./components/Blog').then(m => ({ default: m.Blog })));
const BlogArticle = lazyWithReload(() => import('./components/BlogArticle').then(m => ({ default: m.BlogArticle })));
const VerifyEmail = lazyWithReload(() => import('./components/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const VerifyVenue = lazyWithReload(() => import('./components/VerifyVenue').then(m => ({ default: m.VerifyVenue })));
const ClaimListing = lazyWithReload(() => import('./components/ClaimListing').then(m => ({ default: m.ClaimListing })));
const EmergencyModal = lazyWithReload(() => import('./components/EmergencyModal').then(m => ({ default: m.EmergencyModal })));
const About = lazyWithReload(() => import('./components/About').then(m => ({ default: m.About })));
const DmChat = lazyWithReload(() => import('./components/DmChat').then(m => ({ default: m.DmChat })));
const VenuePage = lazyWithReload(() => import('./components/VenuePage').then(m => ({ default: m.VenuePage })));
const ClaimByPartner = lazyWithReload(() => import('./components/ClaimByPartner').then(m => ({ default: m.ClaimByPartner })));
const SavedPlaces = lazyWithReload(() => import('./components/SavedPlaces').then(m => ({ default: m.SavedPlaces })));
const ClubWelcome = lazyWithReload(() => import('./components/ClubWelcome').then(m => ({ default: m.ClubWelcome })));
const Faq = lazyWithReload(() => import('./components/Faq').then(m => ({ default: m.Faq })));
const Privacy = lazyWithReload(() => import('./components/Privacy').then(m => ({ default: m.Privacy })));
const Terms = lazyWithReload(() => import('./components/Terms').then(m => ({ default: m.Terms })));
const FounderDeals = lazyWithReload(() => import('./components/FounderDeals').then(m => ({ default: m.FounderDeals })));
const WhatsOn = lazyWithReload(() => import('./components/WhatsOn').then(m => ({ default: m.WhatsOn })));
const Club = lazyWithReload(() => import('./components/Club').then(m => ({ default: m.Club })));
const Creators = lazyWithReload(() => import('./components/Creators').then(m => ({ default: m.Creators })));
const Partners = lazyWithReload(() => import('./components/Partners').then(m => ({ default: m.Partners })));
const Start = lazyWithReload(() => import('./components/Start').then(m => ({ default: m.Start })));
const BrandBook = lazyWithReload(() => import('./components/BrandBook').then(m => ({ default: m.BrandBook })));
const BrandBookCharacter = lazyWithReload(() => import('./components/BrandBook').then(m => ({ default: m.BrandBookCharacter })));
const Media = lazyWithReload(() => import('./components/Media').then(m => ({ default: m.Media })));
const PartnerOnboarding = lazyWithReload(() => import('./components/PartnerOnboarding').then(m => ({ default: m.PartnerOnboarding })));
const Concierges = lazyWithReload(() => import('./components/Concierges').then(m => ({ default: m.Concierges })));
const Perks = lazyWithReload(() => import('./components/Perks').then(m => ({ default: m.Perks })));
const Foundation = lazyWithReload(() => import('./components/Foundation').then(m => ({ default: m.Foundation })));
const HeyKaiFoundation = lazyWithReload(() => import('./components/HeyKaiFoundation').then(m => ({ default: m.HeyKaiFoundation })));
const HeyKaiHorses = lazyWithReload(() => import('./components/HeyKaiHorses').then(m => ({ default: m.HeyKaiHorses })));
const HeyKaiHorsePassport = lazyWithReload(() => import('./components/HeyKaiHorsePassport').then(m => ({ default: m.HeyKaiHorsePassport })));
const FoundationDogs = lazyWithReload(() => import('./components/FoundationDogs').then(m => ({ default: m.FoundationDogs })));
const FoundationDogPassport = lazyWithReload(() => import('./components/FoundationDogPassport').then(m => ({ default: m.FoundationDogPassport })));

const ViewFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <PawLoader size={36} className="text-brand-orange" variant="scattered" />
  </div>
);

export default function App() {
  const [unlocked, setUnlocked] = useState<boolean>(() => hasAccess());

  useEffect(() => {
    // The app shell loaded fine, so any prior chunk-reload attempt is resolved.
    // Clearing the flag lets a future deploy trigger one fresh reload again.
    try { sessionStorage.removeItem('heylola_chunk_reloaded'); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    // Allow bypass via ?access=HelloMiami in the URL so we can share a direct link.
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('access');
    if (code && code.toLowerCase() === 'hellomiami') {
      try { window.localStorage.setItem('hl_access_granted', '1'); } catch { /* ignore */ }
      setUnlocked(true);
      params.delete('access');
      const rest = params.toString();
      const url = window.location.pathname + (rest ? `?${rest}` : '') + window.location.hash;
      window.history.replaceState({}, '', url);
    }
  }, []);

  // Routes that bypass the ComingSoon gate — shareable shelter passports
  // need to render for anyone who follows a direct link (rescue partners
  // distribute these via their own channels).
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAlwaysPublic = /^\/foundation(\/|$)/.test(path);

  if (!unlocked && !isAlwaysPublic) {
    return (
      <ErrorBoundary>
        <ComingSoon onUnlock={() => setUnlocked(true)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ErrorBoundary>
  );
}

/* ── App-wide state that has to live above the Routes ─────────────────
 *
 * Modals (paywall, emergency, DM chat, upgrade) are rendered alongside
 * Routes so they don't unmount on navigation. Pet data is fetched here
 * because Dashboard, Passport and Explore all consume it.
 */
function AppContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSoftPaywall, setShowSoftPaywall] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [pets, setPets] = useState<PetData[]>([]);
  const [activePetIndex, setActivePetIndex] = useState(0);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [activeDm, setActiveDm] = useState<{ otherUid: string; otherName: string; otherPhoto?: string; petName?: string } | null>(null);
  const [detectedCity, setDetectedCity] = useState<SupportedCity | null | undefined>(undefined);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [communityMode, setCommunityMode] = useState<'community' | 'support'>('community');
  const [pendingAuthAction, setPendingAuthAction] = useState<{ action: () => void; message: string; title: string } | null>(null);
  const [verificationChecked, setVerificationChecked] = useState(false);
  
  // Waitlist state
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistType, setWaitlistType] = useState<WaitlistType>('member');
  const [waitlistPlan, setWaitlistPlan] = useState<string | undefined>();

  const openWaitlist = (type: WaitlistType, plan?: string) => {
    setWaitlistType(type);
    setWaitlistPlan(plan);
    setWaitlistOpen(true);
  };

  const isAdmin = isAdminEmail(user?.email);

  // Scroll to top on every navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, left: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  }, [location.pathname]);

  // City detection — re-runs when the auth profile loads so we promote
  // homeCity over IP-based detection when the user is signed in.
  useEffect(() => {
    let active = true;
    detectCity(profile?.homeCity ?? null)
      .then((city) => { if (active) setDetectedCity(city); })
      .catch(() => { if (active) setDetectedCity(null); });
    return () => { active = false; };
  }, [profile?.homeCity]);

  // Poll for email verification while the user is unverified
  useEffect(() => {
    if (user && !user.email_confirmed_at) {
      const interval = setInterval(async () => {
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        if (freshUser?.email_confirmed_at) {
          clearInterval(interval);
          setVerificationChecked(true);
          void fetch('/api/notify-email-verified', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              userId: freshUser.id,
              email: freshUser.email,
              firstName: profile?.firstName || freshUser.user_metadata?.first_name || '',
            }),
          }).catch(() => { /* email is best-effort */ });
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Soft verify-email nudge: after signup the onSuccess handler already
  // navigates to /onboarding, so the user is not dumped on a blank
  // verify-email wall. The banner component (VerifyEmailBanner) handles
  // the reminder UX inline, and the verify-email page is still reachable
  // if the user navigates there manually.

  // Bounce signed-out users off authenticated routes
  const authenticatedPaths = useRef<Set<string>>(new Set([
    paths.dashboard, paths.passport, paths.admin, paths.saved, paths.onboarding,
  ]));
  useEffect(() => {
    if (!user && authenticatedPaths.current.has(location.pathname)) {
      navigate(paths.home, { replace: true });
      setVerificationChecked(false);
      setPets([]);
      setActivePetIndex(0);
      setShowProfileEditor(false);
    }
  }, [user, location.pathname, navigate]);

  // Run any deferred action once auth succeeds
  useEffect(() => {
    if (user && pendingAuthAction) {
      pendingAuthAction.action();
      setPendingAuthAction(null);
    }
  }, [user, pendingAuthAction]);

  // Live pet collection — drives Dashboard / Passport / Explore behavior
  useEffect(() => {
    if (!user) return;
    // Allow pet fetching for unverified users so onboarding works immediately

    // Initial fetch
    supabase
      .from('pets')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const fetchedPets = (data || []).map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          name: row.name,
          type: row.type,
          sex: row.sex,
          breed: row.breed,
          birthDate: row.birth_date,
          currentWeight: row.current_weight || { value: '', date: '' },
          weightHistory: row.weight_history || [],
          vaccinations: row.vaccinations || [],
          vaxStatus: row.vax_status || '',
          specialNeeds: row.special_needs || '',
          photoURL: row.photo_url,
          countryOfBirth: row.country_of_birth || '',
          residenceCountry: row.residence_country || '',
          travelHistory: row.travel_history || [],
          plannedDestinations: row.planned_destinations,
          activities: row.activities,
          microchipID: row.microchip_id || '',
          hobbies: row.hobbies || '',
          passportNumber: row.passport_number,
          isPublic: row.is_public,
          isHidden: row.is_hidden,
          city: row.city,
          emergencyContacts: row.emergency_contacts,
          healthTimeline: row.health_timeline,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })) as PetData[];
        setPets(fetchedPets);

        const profileLoaded = profile !== null;
        const needsOnboarding = profileLoaded && !profile.onboarded && fetchedPets.length === 0;

        if (needsOnboarding && location.pathname !== paths.onboarding) {
          navigate(paths.onboarding, { replace: true });
        } else if (fetchedPets.length > 0 && profileLoaded && !profile.onboarded) {
          supabase.from('users').update({ onboarded: true, onboarding_step: 3 }).eq('id', user.id);
        }
      });

    // Realtime subscription
    const channel = supabase
      .channel(`user-pets-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pets',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Re-fetch on any change
        supabase.from('pets').select('*').eq('user_id', user.id).then(({ data }) => {
          if (data) {
            setPets(data.map((row: any) => ({
              id: row.id,
              userId: row.user_id,
              name: row.name,
              type: row.type,
              sex: row.sex,
              breed: row.breed,
              birthDate: row.birth_date,
              currentWeight: row.current_weight || { value: '', date: '' },
              weightHistory: row.weight_history || [],
              vaccinations: row.vaccinations || [],
              vaxStatus: row.vax_status || '',
              specialNeeds: row.special_needs || '',
              photoURL: row.photo_url,
              countryOfBirth: row.country_of_birth || '',
              residenceCountry: row.residence_country || '',
              travelHistory: row.travel_history || [],
              plannedDestinations: row.planned_destinations,
              activities: row.activities,
              microchipID: row.microchip_id || '',
              hobbies: row.hobbies || '',
              passportNumber: row.passport_number,
              isPublic: row.is_public,
              isHidden: row.is_hidden,
              city: row.city,
              emergencyContacts: row.emergency_contacts,
              healthTimeline: row.health_timeline,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            })) as PetData[]);
          }
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, profile?.onboarded, location.pathname, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PawLoader size={48} className="text-brand-orange" variant="scattered" />
      </div>
    );
  }

  const handleRequireAuth = (action?: () => void, title?: string, message?: string) => {
    if (action) {
      setPendingAuthAction({
        action,
        title: title || 'Authentication Required',
        message: message || 'Please join or sign in to access this feature.',
      });
    }
    setShowSoftPaywall(true);
  };

  const handleConnectSupport = () => {
    setCommunityMode('support');
    navigate(paths.community);
  };

  // Hide chrome (Navbar/Footer) on focused, single-purpose flows.
  const hideChrome =
    location.pathname === paths.login ||
    location.pathname === paths.signup ||
    location.pathname === paths.onboarding ||
    location.pathname.startsWith('/verify/') ||
    location.pathname.startsWith('/claim-listing/') ||
    location.pathname.startsWith('/venue/') ||
    location.pathname === paths.claim;

  const showFooter = !hideChrome;
  const isHome = location.pathname === paths.home;
  const noPaddingPaths = new Set<string>([paths.home, paths.about, paths.login, paths.signup, paths.onboarding]);
  const mainPadding = isHome || noPaddingPaths.has(location.pathname) ? '' : 'pt-24 pb-24';

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stone-200 flex flex-col relative overflow-hidden">
      {/* Decorative Brand Labels - Only on Home, at the top */}
      {isHome && (
        <>
          <div className="absolute top-32 left-6 2xl:left-12 hidden xl:block pointer-events-none z-0 select-none">
            <span className="vertical-text text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/15">
              BOUTIQUE PET LIFESTYLE
            </span>
          </div>
          <div className="absolute top-32 right-6 2xl:right-12 hidden xl:block pointer-events-none z-0 select-none">
            <span className="vertical-text text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/15">
              EST. 2026
            </span>
          </div>
        </>
      )}

      {!hideChrome && (
        <Navbar
          setShowEmergency={setShowEmergency}
          user={user}
          profile={profile}
          isAdmin={isAdmin}
          onShowProfile={() => {
            setShowProfileEditor(true);
            navigate(paths.dashboard);
          }}
        />
      )}

      {user && !user.email_confirmed_at && !hideChrome && (
        <VerifyEmailBanner email={user.email ?? null} />
      )}

      <main className={`flex-grow ${mainPadding}`}>
        <Suspense fallback={<ViewFallback />}>
          <Routes>
            {/* ── Public marketing & content ────────────────────────── */}
            <Route path={paths.home} element={
              <FadeIn>
                <Home
                  onExplore={() => navigate(paths.explore)}
                  onSignUp={() => navigate(paths.signup)}
                  onBlog={() => navigate(paths.blog)}
                  onClub={() => navigate(paths.club)}
                  onCreators={() => navigate(paths.creators)}
                  onCommunity={() => navigate(paths.community)}
                  onConcierge={(name) => navigate(buildPath.brandBookCharacter(name))}
                  onExploreCity={(city) => navigate(`${paths.explore}?city=${city}`)}
                />
              </FadeIn>
            } />
            <Route path={paths.about} element={
              <FadeIn><About onBack={() => navigate(paths.home)} onExplore={() => navigate(paths.explore)} /></FadeIn>
            } />
            <Route path={paths.start} element={
              <GuestOnlyRoute>
                <FadeIn><Start onBack={() => navigate(paths.home)} onExplore={() => navigate(paths.explore)} /></FadeIn>
              </GuestOnlyRoute>
            } />
            <Route path={paths.blog} element={
              <FadeIn><Blog onBack={() => navigate(paths.home)} /></FadeIn>
            } />
            <Route path={paths.blogArticle} element={
              <FadeIn><BlogArticle /></FadeIn>
            } />
            <Route path={paths.faq} element={
              <FadeIn><Faq onBack={() => navigate(paths.home)} /></FadeIn>
            } />
            <Route path={paths.privacy} element={
              <FadeIn><Privacy onBack={() => navigate(paths.home)} /></FadeIn>
            } />
            <Route path={paths.terms} element={
              <FadeIn><Terms onBack={() => navigate(paths.home)} /></FadeIn>
            } />
            <Route path={paths.club} element={
              <FadeIn>
                <Club
                  onBack={() => navigate(paths.home)}
                  onSignUp={() => navigate(paths.signup)}
                  isLoggedIn={!!user}
                  currentPlan={profile?.memberPlan}
                  onRequireLogin={() => navigate(paths.signup)}
                  onJoinWaitlist={(plan) => openWaitlist('member', plan)}
                />
              </FadeIn>
            } />
            <Route path={paths.clubWelcome} element={<ClubWelcomeRoute profile={profile} />} />
            <Route path={paths.creators} element={
              <FadeIn><Creators onBack={() => navigate(paths.home)} /></FadeIn>
            } />
            <Route path={paths.partners} element={
              <FadeIn>
                <Partners
                  onBack={() => navigate(paths.home)}
                  onJoinWaitlist={() => navigate(paths.partnerOnboarding)}
                  onClaimBusiness={() => navigate(paths.partnerOnboarding)}
                  onSearchListing={() => navigate(paths.explore)}
                />
              </FadeIn>
            } />
            <Route path={paths.partnerOnboarding} element={
              <FadeIn>
                <PartnerOnboarding
                  onBack={() => navigate(paths.partners)}
                />
              </FadeIn>
            } />
            <Route path={paths.brandBook} element={
              <FadeIn>
                <BrandBook
                  onBack={() => navigate(paths.home)}
                />
              </FadeIn>
            } />
            <Route path={paths.brandBookCharacter} element={<BrandBookCharacterRoute />} />
            <Route path={paths.concierges} element={
              <FadeIn>
                <Concierges
                  onBack={() => navigate(paths.home)}
                  onOpenCharacter={(name) => navigate(buildPath.brandBookCharacter(name))}
                />
              </FadeIn>
            } />
            <Route path={paths.perks} element={
              <FadeIn>
                <Perks
                  onBack={() => navigate(paths.home)}
                  onJoinClub={() => navigate(paths.club)}
                  onOpenVenue={(slug) => navigate(buildPath.venue(slug))}
                  onExploreMap={() => navigate(paths.explore)}
                  memberTier={(profile?.memberPlan as 'free' | 'local' | 'plus' | 'black' | undefined) ?? 'free'}
                />
              </FadeIn>
            } />
            <Route path={paths.founderDeals} element={
              <DraftRoute flag="founderDeals" fallbackTo={paths.perks}>
                <FadeIn>
                  <FounderDeals onBack={() => navigate(paths.perks)} />
                </FadeIn>
              </DraftRoute>
            } />
            <Route path={paths.foundation} element={
              <FadeIn>
                <Foundation
                  onBack={() => navigate(paths.home)}
                  onPartners={() => navigate(paths.partners)}
                  onJoin={() => navigate(paths.signup)}
                  onSeeDogs={() => navigate(paths.foundationDogs)}
                />
              </FadeIn>
            } />
            <Route path={paths.foundationShelter} element={
              <FadeIn>
                <Foundation
                  onBack={() => navigate(paths.home)}
                  onPartners={() => navigate(paths.partners)}
                  onJoin={() => navigate(paths.signup)}
                  onSeeDogs={() => navigate(paths.foundationDogs)}
                />
              </FadeIn>
            } />
            <Route path={paths.foundationDogs} element={
              <FadeIn>
                <FoundationDogs
                  onBack={() => navigate(paths.foundation)}
                  onOpenPassport={(slug) => navigate(buildPath.foundationDogPassport(slug))}
                />
              </FadeIn>
            } />
            <Route path={paths.foundationDogPassport} element={<FoundationDogPassportRoute />} />
            <Route path={paths.heyKaiFoundation} element={
              <FadeIn><HeyKaiFoundation onBack={() => navigate(paths.home)} onSeeHorses={() => navigate(paths.heyKaiHorses)} /></FadeIn>
            } />
            <Route path={paths.heyKaiHorses} element={
              <FadeIn>
                <HeyKaiHorses
                  onBack={() => navigate(paths.heyKaiFoundation)}
                  onOpenPassport={(slug) => navigate(buildPath.heyKaiHorsePassport(slug))}
                />
              </FadeIn>
            } />
            <Route path={paths.heyKaiHorsePassport} element={<HeyKaiHorsePassportRoute />} />
            <Route path={paths.media} element={
              <FadeIn><Media onBack={() => navigate(paths.home)} /></FadeIn>
            } />
            <Route path={paths.whatsOn} element={
              <FadeIn><WhatsOn onBack={() => navigate(paths.home)} /></FadeIn>
            } />

            {/* ── Public app surfaces ───────────────────────────────── */}
            <Route path={paths.explore} element={
              <FadeIn className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
                {user && (
                  <div className="flex justify-between items-start">
                    <WelcomeHeader profile={profile} email={user.email} />
                    {isAdmin && (
                      <button
                        onClick={() => navigate(paths.admin)}
                        className="bg-muted px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-charcoal transition-colors border border-stone-100"
                      >
                        Back Office
                      </button>
                    )}
                  </div>
                )}
                <Explore
                  petName={pets[activePetIndex]?.name || ''}
                  isLoggedIn={!!user}
                  onRequireAuth={handleRequireAuth}
                  initialCity={detectedCity === undefined ? undefined : detectedCity}
                  canSave={canSavePlaces(profile?.memberPlan, isAdmin)}
                  onRequireUpgrade={() => setUpgradeModalOpen(true)}
                />
              </FadeIn>
            } />
            <Route path={paths.community} element={
              <FadeIn className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
                <Community petName={pets[activePetIndex]?.name || ''} initialMode={communityMode} />
              </FadeIn>
            } />
            <Route path={paths.communityGroup} element={
              <FadeIn className="px-4 sm:px-6 py-6">
                <CommunityGroup />
              </FadeIn>
            } />
            <Route path={paths.petProfile} element={
              <FadeIn className="px-4 sm:px-6 py-6">
                <PetProfile />
              </FadeIn>
            } />
            <Route path={paths.shelterPortal} element={
              <FadeIn>
                <ShelterPortal />
              </FadeIn>
            } />
            <Route path={paths.venue} element={<VenueRoute />} />
            <Route path={paths.verifyVenue} element={<VerifyVenueRoute />} />
            <Route path={paths.claimListing} element={<ClaimListingRoute />} />

            {/* ── Auth flow ────────────────────────────────────────── */}
            <Route path={paths.login} element={
              <GuestOnlyRoute>
                <AuthRoute initialMode="login" onAfterAuth={() => setShowSoftPaywall(false)} />
              </GuestOnlyRoute>
            } />
            <Route path={paths.signup} element={
              <GuestOnlyRoute>
                <AuthRoute initialMode="signup" onAfterAuth={() => setShowSoftPaywall(false)} />
              </GuestOnlyRoute>
            } />
            <Route path={paths.verifyEmail} element={
              <ProtectedRoute>
                <FadeIn><VerifyEmail email={user?.email || ''} onResend={async () => {
                  if (!user?.email) return;
                  try { await supabase.auth.resend({ type: 'signup', email: user.email }); } catch (e) { console.error('resend verification failed', e); }
                  await fetch('/api/notify-signup', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                      userId: user.id,
                      email: user.email,
                      firstName: profile?.firstName || user.user_metadata?.first_name || '',
                      lastName: profile?.lastName,
                      username: profile?.username,
                      signupMethod: 'email',
                    }),
                  }).catch(() => { /* swallow */ });
                }} /></FadeIn>
              </ProtectedRoute>
            } />
            <Route path={paths.onboarding} element={
              <ProtectedRoute>
                <FadeIn>
                  <Onboarding
                    userId={user?.id || ''}
                    userName={(user?.user_metadata?.display_name as string) || (user?.user_metadata?.full_name as string) || ''}
                    profile={profile}
                    onComplete={() => navigate(paths.dashboard)}
                    onBack={() => navigate(paths.home)}
                  />
                </FadeIn>
              </ProtectedRoute>
            } />

            {/* ── Authenticated app ────────────────────────────────── */}
            <Route path={paths.dashboard} element={
              <ProtectedRoute>
                <FadeIn className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
                  <Dashboard
                    user={user}
                    profile={profile}
                    pets={pets}
                    onAddPet={() => navigate(paths.onboarding)}
                    onExplore={() => navigate(paths.explore)}
                    onConnectSupport={handleConnectSupport}
                    initialShowProfile={showProfileEditor}
                    onProfileFormClose={() => setShowProfileEditor(false)}
                    onOpenPet={(idx) => { setActivePetIndex(idx); navigate(paths.passport); }}
                    activePetIndex={activePetIndex}
                    onOpenDm={(otherUid, otherName, petName) => setActiveDm({ otherUid, otherName, petName })}
                    onViewAllSaved={() => navigate(paths.saved)}
                    isAdmin={isAdmin}
                  />
                </FadeIn>
              </ProtectedRoute>
            } />
            <Route path={paths.passport} element={
              <ProtectedRoute>
                <FadeIn className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
                  <Passport
                    key={pets[activePetIndex]?.id || 'no-pet'}
                    petData={pets[activePetIndex]}
                    setPetData={(newData) => {
                      const updated = [...pets];
                      updated[activePetIndex] = newData;
                      setPets(updated);
                    }}
                    ownerMemberPlan={profile?.memberPlan}
                    ownerIsAdmin={isAdmin}
                  />
                </FadeIn>
              </ProtectedRoute>
            } />
            <Route path={paths.saved} element={
              <ProtectedRoute>
                <FadeIn className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
                  <SavedPlaces
                    user={user ? { uid: user.id } : null}
                    onBack={() => navigate(paths.dashboard)}
                    onExplore={() => navigate(paths.explore)}
                  />
                </FadeIn>
              </ProtectedRoute>
            } />
            <Route path={paths.claim} element={<ClaimByPartnerRoute user={user} />} />
            <Route path={paths.admin} element={
              <AdminRoute>
                <FadeIn><Admin onBack={() => navigate(paths.dashboard)} /></FadeIn>
              </AdminRoute>
            } />

            {/* ── 404 catch-all ────────────────────────────────────── */}
            <Route path="*" element={<Navigate to={paths.home} replace />} />
          </Routes>
        </Suspense>
      </main>

      {showFooter && <Footer />}

      <SoftPaywall
        isOpen={showSoftPaywall}
        onClose={() => {
          setShowSoftPaywall(false);
          setPendingAuthAction(null);
        }}
        onAuth={(mode) => {
          setShowSoftPaywall(false);
          navigate(mode === 'login' ? paths.login : paths.signup);
        }}
        title={pendingAuthAction?.title}
        message={pendingAuthAction?.message}
      />

      <Suspense fallback={null}>
        {showEmergency && (
          <EmergencyModal
            isOpen={showEmergency}
            onClose={() => setShowEmergency(false)}
            petData={pets[activePetIndex] || {} as PetData}
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
        {activeDm && user && (
          <DmChat
            meProfile={profile}
            otherUid={activeDm.otherUid}
            otherName={activeDm.otherName}
            otherPhoto={activeDm.otherPhoto}
            petName={activeDm.petName}
            onClose={() => setActiveDm(null)}
          />
        )}
      </Suspense>
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgrade={() => {
          setUpgradeModalOpen(false);
          navigate(paths.club);
        }}
      />
      <Analytics />
      <CookieBanner onNavigatePrivacy={() => navigate(paths.privacy)} />
      {/* LandbotChat removed — onboarding/organization chat widget disabled. */}
      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        type={waitlistType}
        initialPlan={waitlistPlan}
      />
    </div>
  );
}

/* ── Helper components ─────────────────────────────────────────────── */

function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WelcomeHeader({ profile, email }: { profile?: Pick<UserProfile, 'firstName' | 'displayName'> | null, email?: string | null }) {
  const firstName = profile?.firstName || profile?.displayName?.split(' ')[0] || email?.split('@')[0] || 'there';
  return (
    <div className="mb-4 sm:mb-6 animate-fade-in">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-charcoal">
        <span className="italic font-light text-stone-400">Hey</span> {firstName}<span className="brand-dot" aria-hidden="true" />
      </h1>
    </div>
  );
}

/* ── Per-route wrappers for params + lazy loading ──────────────────── */

function AuthRoute({ initialMode, onAfterAuth }: { initialMode: 'login' | 'signup'; onAfterAuth: () => void }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // After successful auth, return the user to ?from= if present, else
  // dashboard (existing user) or onboarding (newly created account).
  const handleSuccess = (isNew: boolean) => {
    onAfterAuth();
    const from = searchParams.get('from');
    if (from) {
      navigate(decodeURIComponent(from), { replace: true });
      return;
    }
    navigate(isNew ? paths.onboarding : paths.dashboard, { replace: true });
  };

  return (
    <FadeIn>
      <Auth
        initialMode={mode}
        onSuccess={handleSuccess}
        onSwitch={() => setMode(mode === 'login' ? 'signup' : 'login')}
        onBack={() => navigate(paths.home)}
      />
    </FadeIn>
  );
}

function ClubWelcomeRoute({ profile }: { profile: any }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  return (
    <FadeIn>
      <ClubWelcome
        plan={plan}
        membership={profile?.membership}
        memberPlan={profile?.memberPlan}
        onGoToDashboard={() => navigate(paths.dashboard)}
        onExplore={() => navigate(paths.explore)}
      />
    </FadeIn>
  );
}

function VenueRoute() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to={paths.home} replace />;
  return (
    <FadeIn>
      <VenuePage
        slug={slug}
        onClaim={(s) => navigate(buildPath.claim(s))}
        onBackToApp={() => navigate(paths.home)}
      />
    </FadeIn>
  );
}

function VerifyVenueRoute() {
  const navigate = useNavigate();
  const { placeId, token } = useParams<{ placeId: string; token: string }>();
  if (!placeId || !token) return <Navigate to={paths.home} replace />;
  return (
    <FadeIn>
      <VerifyVenue placeId={placeId} token={token} onBack={() => navigate(paths.home)} />
    </FadeIn>
  );
}

function ClaimListingRoute() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  if (!token) return <Navigate to={paths.home} replace />;
  return (
    <FadeIn>
      <ClaimListing token={token} onBack={() => navigate(paths.home)} />
    </FadeIn>
  );
}

function BrandBookCharacterRoute() {
  const navigate = useNavigate();
  const { name } = useParams<{ name: string }>();
  const allowed = new Set(['lola']);
  const id = (name || '').toLowerCase();
  if (!allowed.has(id)) return <Navigate to={paths.brandBook} replace />;
  return (
    <FadeIn>
      <BrandBookCharacter
        id={id as 'lola' | 'bruno' | 'milo' | 'taco'}
        onBack={() => navigate(paths.brandBook)}
        onOther={(other) => navigate(buildPath.brandBookCharacter(other))}
      />
    </FadeIn>
  );
}

function FoundationDogPassportRoute() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to={paths.foundationDogs} replace />;
  return (
    <FadeIn>
      <FoundationDogPassport
        slug={slug}
        onBack={() => navigate(paths.foundationDogs)}
        onNotFound={() => navigate(paths.foundationDogs)}
      />
    </FadeIn>
  );
}

function HeyKaiHorsePassportRoute() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to={paths.heyKaiHorses} replace />;
  return (
    <FadeIn>
      <HeyKaiHorsePassport
        slug={slug}
        onBack={() => navigate(paths.heyKaiHorses)}
        onNotFound={() => navigate(paths.heyKaiHorses)}
      />
    </FadeIn>
  );
}

function ClaimByPartnerRoute({ user }: { user: any }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slug = (searchParams.get('partner') || '').toLowerCase();
  if (!slug) return <Navigate to={paths.home} replace />;
  return (
    <FadeIn>
      <ClaimByPartner
        slug={slug}
        user={user ? { uid: user.id, email: user.email } : null}
        onBack={() => navigate(buildPath.venue(slug))}
        onLogin={() => navigate(`${paths.login}?from=${encodeURIComponent(`${paths.claim}?partner=${slug}`)}`)}
        onSubmitted={() => { /* success state lives inside the page */ }}
      />
    </FadeIn>
  );
}
