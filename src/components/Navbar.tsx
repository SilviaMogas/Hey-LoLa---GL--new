import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, UserCircle, Globe, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useTranslation } from '../lib/LanguageContext';
import { BrandLogo } from './BrandLogo';
import { getTier } from '../lib/membership';
import { paths } from '../lib/routes';
import type { MemberPlan } from '../types';

interface NavbarProps {
  setShowEmergency: (show: boolean) => void;
  user: User | null;
  profile?: { photoURL?: string; displayName?: string; firstName?: string; memberPlan?: MemberPlan } | null;
  isAdmin?: boolean;
  onShowProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, profile, isAdmin = false, onShowProfile }) => {
  const { t, language, toggleLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = () => {
    supabase.auth.signOut();
    navigate(paths.home);
  };

  const navItems: { to: string; label: string; match: string[] }[] = [
    { to: user ? paths.dashboard : paths.home, label: t.common.dashboard, match: [paths.dashboard, paths.home] },
    { to: paths.explore, label: t.common.explore, match: [paths.explore] },
    { to: paths.community, label: t.common.hub, match: [paths.community] },
    { to: paths.club, label: t.common.club, match: [paths.club] },
    { to: paths.creators, label: t.common.creators, match: [paths.creators] },
    // "Join" is for signed-out visitors only — hide it once logged in.
    ...(user ? [] : [{ to: paths.start, label: t.common.join, match: [paths.start] }]),
  ];

  const isActive = (match: string[]) => match.includes(location.pathname);

  return (
    <>
      <nav
        aria-label="Primary"
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-white/85 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_30px_rgba(0,0,0,0.04)]'
            : 'bg-white/60 backdrop-blur-md border-b border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 xl:px-12 flex justify-between items-center h-16 md:h-14">
          {/* Brand */}
          <button
            onClick={() => navigate(user ? paths.dashboard : paths.home)}
            aria-label="HeyLola. — Home"
            className="flex items-center cursor-pointer group shrink-0 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40 rounded-md"
          >
            <div className="relative flex items-center h-full">
              <BrandLogo size="md" className="group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-charcoal transition-all duration-700 group-hover:w-full" />
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex gap-6 items-center font-boutique h-full">
            {navItems.map((item) => {
              const active = isActive(item.match);
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.to)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'nav-link hover:text-charcoal text-xs tracking-[0.2em]',
                    active && 'text-charcoal font-black'
                  )}
                >
                  {item.label}
                  {active && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-charcoal" />}
                </button>
              );
            })}

            <button
              onClick={toggleLanguage}
              aria-label={`Switch language (current: ${language.toUpperCase()})`}
              className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40 rounded-full px-2 py-1"
            >
              <Globe size={11} className="text-stone-400 group-hover:text-charcoal transition-colors" />
              <span className="text-[10px] font-black tracking-[0.25em] text-stone-400 group-hover:text-charcoal transition-all uppercase">
                {language}
              </span>
            </button>
          </div>

          {/* Right side: auth & mobile trigger */}
          <div className="flex items-center gap-4 md:gap-6">
            {user ? (
              <div className="flex items-center gap-4 md:gap-6">
                <button
                  onClick={onShowProfile}
                  className="hidden sm:flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40 rounded-full pr-2"
                  aria-label="Open profile"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md bg-white ring-1 ring-stone-100 transition-all group-hover:ring-stone-200">
                      {(profile?.photoURL || (user.user_metadata?.avatar_url as string)) ? (
                        <img src={profile?.photoURL || (user.user_metadata?.avatar_url as string)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 group-hover:text-charcoal transition-colors">
                          <UserCircle size={18} />
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white',
                        getTier(profile?.memberPlan, isAdmin).dotClass,
                      )}
                      aria-label={`${getTier(profile?.memberPlan, isAdmin).label} member`}
                    />
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-none gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-charcoal transition-colors">
                      {profile?.firstName || profile?.displayName?.split(' ')[0] || (user.user_metadata?.display_name as string)?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <span className={cn(
                      'text-[8px] font-bold uppercase tracking-widest',
                      getTier(profile?.memberPlan, isAdmin).textClass,
                    )}>
                      {getTier(profile?.memberPlan, isAdmin).label}
                    </span>
                  </div>
                </button>
                <div className="h-4 w-px bg-stone-200 hidden sm:block" />
                <button
                  onClick={handleSignOut}
                  className="hidden sm:inline-flex text-stone-400 hover:text-charcoal transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40 rounded-full p-1"
                  title={t.common.signOut}
                  aria-label={t.common.signOut}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4 md:gap-6">
                <button
                  onClick={() => navigate(paths.login)}
                  className="nav-link text-xs tracking-[0.2em]"
                >
                  {t.common.login}
                </button>
                <button
                  onClick={() => navigate(paths.signup)}
                  className="luxury-button-primary h-11 px-7 text-[10px] tracking-[0.2em]"
                >
                  {t.common.signUp}
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-stone-line bg-white text-charcoal hover:border-stone-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileOpen}
        className={cn(
          'lg:hidden fixed inset-0 z-[60] transition-all duration-500',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            'absolute inset-0 bg-charcoal/30 backdrop-blur-sm transition-opacity duration-500',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
        />
        <aside
          className={cn(
            'absolute top-0 right-0 h-full w-[88%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-stone-100">
            <BrandLogo size="md" />
            <button
              onClick={() => setMobileOpen(false)}
              className="w-10 h-10 rounded-full border border-stone-line bg-white text-charcoal hover:border-stone-300 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-8 py-10 flex flex-col gap-2 font-boutique">
            {navItems.map((item) => {
              const active = isActive(item.match);
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.to)}
                  className={cn(
                    'group flex items-center justify-between py-4 border-b border-stone-100 transition-colors',
                    active ? 'text-charcoal font-black' : 'text-stone-400 hover:text-charcoal'
                  )}
                >
                  <span className="text-3xl font-serif italic tracking-tight">{item.label}</span>
                  <span
                    className={cn(
                      'text-[10px] font-black uppercase tracking-[0.3em] transition-opacity',
                      active ? 'opacity-100 text-charcoal' : 'opacity-0 group-hover:opacity-100'
                    )}
                  >
                    ↗
                  </span>
                </button>
              );
            })}

            <button
              onClick={toggleLanguage}
              className="mt-8 inline-flex items-center gap-3 self-start rounded-full border border-stone-line bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-charcoal hover:border-stone-300 transition-colors"
              aria-label={`Switch language (current: ${language.toUpperCase()})`}
            >
              <Globe size={12} className="text-charcoal" />
              <span>{language === 'en' ? 'EN · Español' : 'ES · English'}</span>
            </button>
          </nav>

          <div className="border-t border-stone-100 p-6 bg-white/60">
            {user ? (
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => onShowProfile?.()}
                  className="flex items-center gap-3 group flex-1 min-w-0"
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow ring-1 ring-stone-100 bg-white flex items-center justify-center text-stone-400">
                    {(profile?.photoURL || (user.user_metadata?.avatar_url as string)) ? (
                      <img src={profile?.photoURL || (user.user_metadata?.avatar_url as string)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle size={20} />
                    )}
                  </div>
                  <div className="flex flex-col items-start leading-tight min-w-0">
                    <span className="text-sm font-black truncate max-w-[180px]">
                      {profile?.firstName || profile?.displayName?.split(' ')[0] || (user.user_metadata?.display_name as string)?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
                      {t.common.dashboard}
                    </span>
                  </div>
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-stone-400 hover:text-charcoal transition-colors p-2"
                  aria-label={t.common.signOut}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(paths.signup)}
                  className="luxury-button-primary h-10 w-full text-[10px] tracking-[0.25em]"
                >
                  {t.common.signUp}
                </button>
                <button
                  onClick={() => navigate(paths.login)}
                  className="luxury-button-secondary h-10 w-full text-[10px] tracking-[0.25em]"
                >
                  {t.common.login}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};
