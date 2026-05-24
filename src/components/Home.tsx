import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PawPrint, MapPin, MessageSquare, ArrowRight, Send, Star, Heart, Bone } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';
import { BrandLogo } from './BrandLogo';
import { MembershipDuo } from './MembershipDuo';
import { CONCIERGES, type ConciergeId } from '../data/concierges';
import { ConciergeAvatar } from './ConciergeAvatar';
import { SEO, organizationSchema, websiteSchema, serviceSchema } from '../lib/seo';

interface HomeProps {
  onExplore: () => void;
  onSignUp: () => void;
  onBlog: () => void;
  onClub?: () => void;
  onCreators?: () => void;
  onCommunity?: () => void;
  onConcierge?: (name: string) => void;
  /** City-specific shortcut used by the three CityCards. */
  onExploreCity?: (city: 'miami' | 'nyc' | 'barcelona' | 'toronto' | 'dc') => void;
}

export const Home: React.FC<HomeProps> = ({ onExplore, onSignUp, onBlog, onClub, onCreators, onCommunity, onConcierge, onExploreCity }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goToCreatorApply = () => navigate('/creators#apply');
  const [comingSoonHint, setComingSoonHint] = useState<string | null>(null);

  return (
    <div className="bg-white min-h-screen text-charcoal font-boutique selection:bg-stone-200 overflow-x-hidden">
      <SEO
        title="Hey Lola | Your Dog's Lifestyle Concierge"
        description="Hey Lola is a boutique lifestyle concierge for dog parents. Organise your dog's essentials, discover trusted dog-friendly places, and access curated local perks. Launching first in Miami."
        url="/"
        jsonLd={[organizationSchema, websiteSchema, serviceSchema]}
      />
      {/* Hero Section — content sits a touch above center so there's no dead air below the navbar */}
      <section className="relative min-h-[44vh] sm:min-h-[52vh] flex flex-col items-center justify-start px-5 sm:px-6 overflow-hidden pt-28 sm:pt-32 md:pt-36 pb-10">
        <div className="max-w-5xl mx-auto text-center space-y-5 sm:space-y-7 md:space-y-9 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 sm:space-y-5 md:space-y-7"
          >
            <div className="inline-flex flex-col items-center gap-2 sm:gap-3 w-full">
              <BrandLogo size="3xl" className="hover:scale-105 transition-transform duration-700 max-w-full sm:!h-16 md:!h-20 lg:!h-24" />
              <div className="h-4 sm:h-6 md:h-8 w-px bg-stone-200" />
            </div>

            <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-stone-500 font-light max-w-2xl mx-auto leading-relaxed italic px-4 sm:px-6 md:px-8">
              {t.home.heroSubtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 md:gap-6 pt-1 sm:pt-2 md:pt-4"
          >
            <button
              onClick={onSignUp}
              className="luxury-button-primary w-full sm:w-auto h-11 sm:h-12 px-9 sm:px-11 text-[11px] sm:text-xs shadow-lg"
            >
              {t.home.ctaPrimary}
            </button>
            <button
              onClick={onExplore}
              className="luxury-button-secondary w-full sm:w-auto h-11 sm:h-12 px-9 sm:px-11 text-[11px] sm:text-xs bg-white/60 backdrop-blur-md"
            >
              {t.home.ctaSecondary}
            </button>
          </motion.div>
        </div>

        {/* Decorative Blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-[1000px] h-[1000px] bg-stone-100/40 rounded-full blur-[180px]"
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-60 -right-40 w-[800px] h-[800px] bg-white rounded-full blur-[180px]" 
          />
        </div>
      </section>

      {/* Active Cities */}
      <section className="py-8 sm:py-10 px-5 sm:px-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl space-y-6 md:space-y-8 flex items-start gap-6 sm:gap-8 md:gap-8"
        >
          <div className="h-20 sm:h-28 md:h-32 w-px bg-stone-300 mt-3 md:mt-4 shrink-0" />
          <div className="space-y-4 sm:space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-stone-400">{t.home.curatedCityGuide}</span>
            <h2 className="text-3xl md:text-4xl font-serif tracking-tight leading-[0.85] text-charcoal italic">
              {t.home.trustedLabel} <br /><span className="text-stone-300">{t.home.citiesLabel}<span className="brand-dot" aria-hidden="true" /></span>
            </h2>
            <p className="text-base sm:text-lg md:text-2xl text-stone-400 font-light leading-snug italic max-w-xl">
              {t.home.networkDesc}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <CityCard name="Miami" status={t.home.cityStatusLive} isLive image="https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=800" onClick={() => onExploreCity?.('miami')} />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <CityCard name="New York" status={t.home.cityStatusLaunchingSoon} image="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800" onClick={() => onExploreCity?.('nyc')} />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <CityCard name="Barcelona" status={t.home.cityStatusLaunchingSoon} image="https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800" onClick={() => onExploreCity?.('barcelona')} />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
            <CityCard name="Toronto" status={t.home.cityStatusLaunchingSoon} image="https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=800" onClick={() => onExploreCity?.('toronto')} />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
            <CityCard name="Washington DC" status={t.home.cityStatusLaunchingSoon} image="https://images.unsplash.com/photo-1501466044931-62695aada8e9?auto=format&fit=crop&w=800" onClick={() => onExploreCity?.('dc')} />
          </motion.div>
        </div>

        <div className="pt-12 sm:pt-12 md:pt-12 space-y-6 sm:space-y-8 border-t border-stone-100">
          <div className="space-y-3 md:space-y-4 flex flex-col items-center text-center">
            <span className="text-stone-400 font-black uppercase tracking-[0.4em] text-[10px]">{t.home.comingSoonDesc}</span>
            <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight">{t.home.comingSoonTitle}</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 md:gap-8 max-w-5xl mx-auto">
            {['London', 'Dubai', 'Paris', 'Singapore'].map((city, i) => (
              <motion.button
                key={city}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  setComingSoonHint(city);
                  setTimeout(() => setComingSoonHint(prev => (prev === city ? null : prev)), 1400);
                }}
                className="relative aspect-square bg-white rounded-[1.5rem] sm:rounded-[2rem] md:rounded-2xl flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 border border-stone-100 group hover:border-stone-300 transition-all cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-2 duration-500"
              >
                  {comingSoonHint === city && (
                    <span className="absolute top-3 right-3 rounded-full bg-charcoal/90 text-white text-[9px] px-2.5 py-1 font-semibold tracking-[0.05em]">
                      {t.home.comingSoonBadge}
                    </span>
                  )}
                  <span className="text-base sm:text-lg md:text-xl font-serif italic tracking-tight text-charcoal/40 group-hover:text-charcoal transition-colors">
                    {city}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase font-sans tracking-[0.25em] sm:tracking-[0.3em] text-stone-300 mt-2 md:mt-3">{t.home.comingSoonLabel}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Hub */}
      <section className="py-8 sm:py-10 px-5 sm:px-6 bg-bone relative overflow-hidden">
        <div className="absolute top-0 left-0 p-6 md:p-20 opacity-[0.02] pointer-events-none grayscale hidden md:block">
          <BrandLogo size="8xl" />
        </div>

        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 md:gap-8"
          >
            <div className="space-y-5 sm:space-y-6 md:space-y-8 max-w-2xl border-l border-stone-200 pl-5 sm:pl-8 md:pl-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-stone-400">{t.home.editorialHub}</span>
              <h2 className="text-3xl sm:text-3xl lg:text-3xl tracking-tight leading-[0.9] font-serif italic text-charcoal">{t.home.travelLabel} <span className="text-stone-300">{t.home.hubLabel}</span><span className="brand-dot" aria-hidden="true" /></h2>
              <p className="text-base sm:text-lg md:text-2xl text-stone-400 font-light italic leading-snug">{t.blog.description}</p>
            </div>
            <button onClick={onBlog} className="luxury-button-secondary h-11 md:h-12 px-8 md:px-12 group self-start lg:self-auto">
              {t.blog.exploreAll} <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { location: "London", tag: t.home.activityEditorial, title: t.home.activityCityStories, author: "Hey Lola", comingSoon: true },
              { location: "Miami", tag: t.home.activityGuides, title: t.home.activityTravelTips, author: "Hey Lola", comingSoon: true },
              { location: "NYC", tag: t.home.activityCommunity, title: t.home.activityCommunityUpdates, author: "Hey Lola", comingSoon: true }
            ].map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                <ActivityCard {...activity} onClick={onBlog} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="luxury-card p-8 sm:p-6 md:p-8 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-8 group hover:scale-[1.01] cursor-pointer bg-white"
            onClick={goToCreatorApply}
          >
            <div className="space-y-6 md:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 text-stone-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <Send size={14} /> {t.blog.cta}
              </div>
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-3xl sm:text-3xl md:text-4xl font-serif italic font-light tracking-tight leading-none text-charcoal/80">{t.blog.participateTitle}</h3>
                <p className="text-base sm:text-lg md:text-xl text-stone-400 font-light italic tracking-tight">{t.blog.participateDesc}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); goToCreatorApply(); }}
              className="luxury-button-primary w-full lg:w-auto px-10 md:px-16 h-11 md:h-12 lg:h-11 text-[11px] shrink-0 shadow-xl md:shadow-2xl"
            >
              {t.blog.ctaButton}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="py-8 sm:py-10 px-5 sm:px-6 max-w-7xl mx-auto border-t border-stone-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 lg:gap-6">
          <FeatureCard
            icon={<MapPin size={24} />}
            title={t.home.featureMapTitle}
            description={t.home.featureMapDesc}
            onClick={onExplore}
          />
          <FeatureCard 
            icon={<MessageSquare size={24} />}
            title={t.home.featureCommunityTitle}
            description={t.home.featureCommunityDesc}
            onClick={onCommunity}
          />
        </div>
      </section>

      {/* ── Hey Lola Club Section ── */}
      <section className="py-8 sm:py-10 px-5 sm:px-6 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="absolute top-0 right-0 p-6 md:p-20 opacity-[0.03] pointer-events-none hidden md:block">
          <BrandLogo size="8xl" variant="white" className="-rotate-12" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <span className="text-white/40 font-black uppercase tracking-[0.5em] text-[10px]">{t.home.membershipLabel}</span>
                <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-[0.85] text-white">
                  Hey Lola<br /><span className="text-white/30">Club</span><span className="brand-dot" aria-hidden="true" />
                </h2>
              </div>
              <p className="text-2xl sm:text-3xl text-white/70 font-light italic leading-snug">
                {t.home.clubSubtitle}
              </p>
              <p className="text-base sm:text-lg text-stone-400 font-light leading-relaxed max-w-lg">
                {t.home.clubDesc1}
              </p>
              <p className="text-sm text-stone-500 leading-relaxed max-w-lg">
                {t.home.clubDesc2}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={onSignUp}
                  className="luxury-button bg-white text-charcoal h-12 px-8 text-[10px] font-black tracking-[0.25em] uppercase hover:bg-stone-100 hover:scale-[1.02] transition-all shadow-xl"
                >
                  {t.home.joinHeyLola}
                </button>
                <button
                  onClick={onExplore}
                  className="luxury-button border border-white/20 text-white/70 hover:text-white hover:border-white/40 h-12 px-8 text-[10px] font-black tracking-[0.25em] uppercase transition-all"
                >
                  {t.home.exploreCity}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: <MapPin size={18} />, label: t.home.featureTrustedPlaces, desc: t.home.featureTrustedPlacesDesc },
                { icon: <Star size={18} />, label: t.home.featureCuratedPerks, desc: t.home.featureCuratedPerksDesc },
                { icon: <PawPrint size={18} />, label: t.home.featurePetRecords, desc: t.home.featurePetRecordsDesc },
                { icon: <MessageSquare size={18} />, label: t.home.featureConciergeSupport, desc: t.home.featureConciergeSupportDesc },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/8 transition-colors">
                  <div className="text-white/50">{icon}</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">{label}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Membership: Free on one side, Founders' Circle on the other ── */}
      <MembershipDuo onStartFree={onSignUp} />

      {/* ── Built with local dog voices — Creator Banner ── */}
      <section className="py-8 sm:py-10 px-5 sm:px-6 bg-stone-50 border-t border-b border-stone-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8"
          >
            <div className="space-y-6 max-w-2xl border-l-2 border-stone-300 pl-8">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">{t.home.creatorPartnersLabel}</span>
              <h2 className="text-3xl sm:text-3xl font-serif italic tracking-tight leading-none">
                {t.home.builtWithLocal}<br /><span className="text-stone-300">{t.home.dogVoices}</span><span className="brand-dot" aria-hidden="true" />
              </h2>
              <p className="text-xl text-stone-500 font-light italic leading-snug">
                {t.home.creatorDesc1}
              </p>
              <p className="text-base text-stone-400 leading-relaxed">
                {t.home.creatorDesc2}
              </p>
            </div>
            <div className="shrink-0">
              <button
                onClick={onCreators}
                className="luxury-button-primary h-11 px-12 text-[11px] group shadow-xl"
              >
                {t.home.becomeCreatorPartner} <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How Hey Lola works — three audiences */}
      <section id="how-it-works" aria-labelledby="how-heading" className="py-12 sm:py-16 px-5 sm:px-6 max-w-7xl mx-auto border-t border-stone-100">
        <header className="text-center space-y-3 mb-10 max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">{t.home.howItWorks}</span>
          <h2 id="how-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-[0.95]">
            {t.home.howItWorksTitle}<span className="brand-dot" aria-hidden="true" />
          </h2>
          <p className="text-base text-stone-500 font-light italic leading-snug">
            {t.home.howItWorksDesc}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <article className="rounded-[1.5rem] border border-stone-100 bg-white p-6 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C4622D]">{t.home.forPetParents}</p>
            <h3 className="text-xl font-serif italic leading-tight">{t.home.forPetParentsTitle}</h3>
            <p className="text-sm text-stone-500 font-light leading-relaxed">
              {t.home.forPetParentsDesc}
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-stone-100 bg-white p-6 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6E8C5D]">{t.home.forFoundations}</p>
            <h3 className="text-xl font-serif italic leading-tight">{t.home.forFoundationsTitle}</h3>
            <p className="text-sm text-stone-500 font-light leading-relaxed">
              {t.home.forFoundationsDesc}
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-stone-100 bg-white p-6 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5D848C]">{t.home.forPartners}</p>
            <h3 className="text-xl font-serif italic leading-tight">{t.home.forPartnersTitle}</h3>
            <p className="text-sm text-stone-500 font-light leading-relaxed">
              {t.home.forPartnersDesc}
            </p>
          </article>
        </div>
      </section>

      {/* Meet Lola — compact concierge intro */}
      <section id="concierges" className="py-10 sm:py-12 px-5 sm:px-6 bg-stone-50/50 border-y border-stone-100">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
          <img
            src="/HeyLola.Lola.1.png"
            alt="Lola, your Hey Lola concierge"
            loading="lazy"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain shrink-0"
          />
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">{t.home.yourConcierge}</span>
            <h2 className="text-2xl sm:text-3xl font-serif italic tracking-tight leading-none">
              {t.home.meetLola}<span className="brand-dot" aria-hidden="true" />
            </h2>
            <p className="text-sm sm:text-base text-stone-500 font-light italic leading-snug max-w-md">
              {t.home.meetLolaDesc}
            </p>
            <button
              type="button"
              onClick={onConcierge ? () => onConcierge('lola') : undefined}
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-charcoal hover:text-brand-orange transition-colors pt-1"
            >
              {t.home.meetLola} <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="pb-8 sm:pb-10 px-5 sm:px-6">
        <div className="max-w-7xl mx-auto rounded-[2rem] sm:rounded-2xl md:rounded-3xl lg:rounded-3xl bg-charcoal p-8 sm:p-6 md:p-8 lg:p-8 text-center space-y-8 relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.25)] md:shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
          <div className="relative z-10 space-y-8 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              <span className="text-white/40 font-black uppercase tracking-[0.35em] sm:tracking-[0.5em] text-[10px]">{t.home.boutiqueClub}</span>
              <h2 className="text-3xl md:text-3xl lg:text-3xl text-white tracking-tight leading-[0.85] sm:leading-[0.8] font-serif italic max-w-3xl mx-auto">{t.home.readyForLiftoff}</h2>
            </div>
            <p className="text-stone-400 text-base sm:text-lg md:text-xl font-light max-w-lg mx-auto italic leading-snug px-5 sm:px-8">{t.home.joinThousands}</p>
            <button
              onClick={onSignUp}
              className="luxury-button bg-white text-charcoal w-full sm:w-auto px-12 h-11 sm:h-11 hover:bg-stone-100 hover:scale-[1.02] active:scale-95 transition-all text-[11px] sm:text-xs font-black tracking-[0.25em] uppercase shadow-lg"
            >
              {t.common.getStarted}
            </button>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_70%)] opacity-50" />
          <div className="absolute top-0 right-0 p-6 md:p-20 opacity-[0.03] pointer-events-none hidden md:block">
            <BrandLogo size="8xl" variant="white" className="-rotate-12" />
          </div>
        </div>
      </section>

    </div>
  );
};

function DogConciergeCard({ name, role, personality, style, vibe, color, badgeColor, onClick }: { name: string, role: string, personality: string, style: string, vibe: string, color: string, badgeColor: string, onClick?: () => void }) {
  // Lucide icon used as the badge accent in the corner chip.
  let Icon = PawPrint;
  if (name === 'Lola') Icon = Heart;
  if (name === 'Taco') Icon = PawPrint;
  if (name === 'Nuc') Icon = Star;
  if (name === 'Toby') Icon = Bone;

  const conciergeId = name.toLowerCase() as ConciergeId;
  const interactive = !!onClick;
  const handleKey = (e: React.KeyboardEvent) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKey}
      aria-label={interactive ? `Open ${name}'s brand book page` : undefined}
      className={`relative flex flex-col h-full rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-stone-100 overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-700 group ${interactive ? 'cursor-pointer hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50' : 'cursor-default'}`}
    >
      <div className={`aspect-square ${color} flex items-center justify-center relative overflow-hidden transition-all duration-700`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1),transparent_70%)]" />
        
        <ConciergeAvatar
          id={conciergeId}
          poseIndex={1}
          rounded="none"
          alt={name}
          className="relative z-10 w-full h-full !object-contain group-hover:scale-110 transition-all duration-700"
        />
        <span className="sr-only">
          <Icon size={16} aria-hidden />
        </span>
      </div>
      
      <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3 text-center">
          <h3 className="text-2xl sm:text-3xl font-serif italic tracking-tight text-charcoal leading-none">{name}</h3>
          <p className="text-[12px] font-light text-stone-400 italic">
            {role}
          </p>
        </div>
        
        <div className="space-y-4 pt-6 border-t border-stone-100">
          <div className="space-y-1">
            <p className="text-[13px] leading-relaxed text-charcoal">
              <span className="font-black">Personality:</span> <span className="text-stone-500 font-light">{personality}</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[13px] leading-relaxed text-charcoal">
              <span className="font-black">Style:</span> <span className="text-stone-500 font-light">{style}</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[13px] leading-relaxed text-charcoal">
              <span className="font-black">Vibe:</span> <span className="text-stone-500 font-light">{vibe}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CityCard({ name, status, image, onClick, isLive }: { name: string, status: string, image: string, onClick?: () => void, isLive?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${name} on the map`}
      className="group relative aspect-square sm:aspect-[5/6] rounded-[1.75rem] sm:rounded-2xl md:rounded-3xl overflow-hidden bg-stone-100 border border-stone-100 shadow-[0_15px_40px_rgba(0,0,0,0.08)] md:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-2xl transition-all duration-1000 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
    >
      <img src={image} alt={name} loading="lazy" className={`w-full h-full object-cover ${isLive ? 'grayscale-[0.2] group-hover:grayscale-0' : 'grayscale-[0.7]'} group-hover:scale-110 transition-all duration-1000`} />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-8 flex flex-col items-center text-center space-y-2 sm:space-y-3">
        <h3 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight text-white">{name}</h3>
        <div className="h-0.5 w-10 sm:w-12 bg-charcoal transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
        <div className="text-[9px] sm:text-[10px] font-sans font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/70 flex items-center gap-2 sm:gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'}`} /> {status}
        </div>
      </div>
    </button>
  );
}

function FeatureCard({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white border border-stone-100 hover:border-stone-200 transition-all space-y-3 md:space-y-4 group shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-2xl duration-700 relative overflow-hidden font-boutique cursor-pointer">
      <div className="absolute top-0 right-0 p-4 md:p-6 opacity-[0.02] text-charcoal hidden md:block">
        {icon}
      </div>
      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:text-charcoal group-hover:rotate-12 transition-all duration-700 border border-stone-100">
        {icon}
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <h3 className="text-xl sm:text-2xl md:text-2xl font-serif italic font-light tracking-tight text-charcoal/80">{title}</h3>
        <p className="text-sm sm:text-base text-stone-400 font-light leading-snug italic tracking-tight">{description}</p>
      </div>
    </button>
  );
}

function ActivityCard({ location, tag, title, author, image, comingSoon, onClick }: { location: string, tag: string, title: string, author: string, image?: string, comingSoon?: boolean, onClick?: () => void }) {
  const { t } = useTranslation();

  if (comingSoon) {
    return (
      <div className="h-full flex flex-col justify-between bg-white rounded-[1.5rem] sm:rounded-[2rem] md:rounded-2xl lg:rounded-3xl border border-stone-100 p-6 sm:p-7 md:p-8 font-boutique">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 text-charcoal text-[9px] font-black uppercase tracking-[0.2em] bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">{location}</span>
            <span className="inline-flex text-stone-500 text-[9px] font-black uppercase tracking-[0.3em] bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">{t.home.comingSoonBadge}</span>
          </div>
          <h4 className="text-2xl sm:text-3xl font-serif italic font-light tracking-tight leading-[1.15] text-charcoal">{title}</h4>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-400 mt-6 sm:mt-8">{t.blog.by} {author}</p>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="h-full bg-white rounded-[1.5rem] sm:rounded-[2rem] md:rounded-2xl lg:rounded-3xl overflow-hidden border border-stone-100 flex flex-col group hover:border-stone-200 transition-all cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-2xl duration-700 font-boutique"
    >
      <div className="aspect-[16/10] relative overflow-hidden bg-stone-100 border-b border-stone-100">
        {image ? (
          <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.85),rgba(245,242,237,0.9))] flex items-center justify-center">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-stone-400">Coming soon</span>
          </div>
        )}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-5 py-1.5 px-3 bg-white/80 backdrop-blur-md rounded-full">
          <span className="text-charcoal text-[9px] font-black uppercase tracking-[0.2em]">{location}</span>
        </div>
      </div>
      <div className="p-6 sm:p-8 md:p-6 lg:p-8 space-y-5 sm:space-y-6 md:space-y-8 flex-1 flex flex-col">
        <div className="flex gap-4">
          <span className="text-stone-500 text-[9px] font-black uppercase tracking-[0.3em] bg-stone-50 px-3 py-1 rounded-full border border-stone-100">{comingSoon ? "Coming soon" : tag}</span>
        </div>
        <h4 className="text-xl sm:text-2xl font-serif italic font-light tracking-tight leading-[1.15] text-charcoal group-hover:text-charcoal/60 transition-colors">{title}</h4>
      </div>
    </div>
  );
}

