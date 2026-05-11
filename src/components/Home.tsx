import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PawPrint, MapPin, MessageSquare, ArrowRight, X, Send, Loader2, Check, Star } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';
import { BrandLogo } from './BrandLogo';

interface HomeProps {
  onExplore: () => void;
  onSignUp: () => void;
  onBlog: () => void;
  onClub?: () => void;
  onCreators?: () => void;
  onCommunity?: () => void;
}

export const Home: React.FC<HomeProps> = ({ onExplore, onSignUp, onBlog, onClub, onCreators, onCommunity }) => {
  const { t } = useTranslation();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', handle: '', topics: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [comingSoonHint, setComingSoonHint] = useState<string | null>(null);

  useEffect(() => {
    if (!showApplyModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowApplyModal(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showApplyModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => { 
        setShowApplyModal(false); 
        setIsSubmitted(false); 
        setApplyForm({ name: '', email: '', handle: '', topics: '' });
      }, 2000);
    }, 1500);
  };

  return (
    <div className="bg-white min-h-screen text-charcoal font-boutique selection:bg-stone-200 overflow-x-hidden">
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
              <span className="opacity-50 text-[10px] sm:text-[11px] md:text-xs block mt-3 sm:mt-4 font-sans uppercase font-black tracking-[0.25em] not-italic text-stone-400">
                {t.home.heroDescription}
              </span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 md:gap-6 pt-1 sm:pt-2 md:pt-4"
          >
            <button
              onClick={onExplore}
              className="luxury-button-primary w-full sm:w-auto h-11 sm:h-12 px-9 sm:px-11 text-[11px] sm:text-xs shadow-lg"
            >
              {t.common.explore}
            </button>
            <button
              onClick={onSignUp}
              className="luxury-button-secondary w-full sm:w-auto h-11 sm:h-12 px-9 sm:px-11 text-[11px] sm:text-xs bg-white/60 backdrop-blur-md"
            >
              {t.home.ctaPrimary}
            </button>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-24 left-6 hidden xl:block">
          <span className="vertical-text text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/20">
            BOUTIQUE PET LIFESTYLE
          </span>
        </div>

        <div className="absolute top-24 right-6 hidden xl:block">
          <span className="vertical-text text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/20">
            EST. 2024 — BCN Hub
          </span>
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
            <span className="text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-stone-400">Curated Ecosystem</span>
            <h2 className="text-3xl md:text-4xl font-serif tracking-tight leading-[0.85] text-charcoal italic">
              World <br /><span className="text-stone-300">Destinations<span className="text-brand-orange">.</span></span>
            </h2>
            <p className="text-base sm:text-lg md:text-2xl text-stone-400 font-light leading-snug italic max-w-xl">
              {t.home.networkDesc}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <CityCard name="Barcelona" status="Live" image="https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800" />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <CityCard name="Miami" status="Live" image="https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=800" />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <CityCard name="NYC" status="Live" image="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800" />
          </motion.div>
        </div>

        <div className="pt-12 sm:pt-12 md:pt-12 space-y-6 sm:space-y-8 border-t border-stone-100">
          <div className="space-y-3 md:space-y-4 flex flex-col items-center text-center">
            <span className="text-stone-400 font-black uppercase tracking-[0.4em] text-[10px]">{t.home.comingSoonDesc}</span>
            <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight">{t.home.comingSoonTitle}</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 md:gap-8 max-w-5xl mx-auto">
            {['Toronto', 'Dubai', 'Paris', 'Singapore'].map((city, i) => (
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
                      Coming soon
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
              <span className="text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-stone-400">Editorial Hub</span>
              <h2 className="text-3xl sm:text-3xl lg:text-3xl tracking-tight leading-[0.9] font-serif italic text-charcoal">Travel <span className="text-stone-300">Hub</span><span className="text-brand-orange">.</span></h2>
              <p className="text-base sm:text-lg md:text-2xl text-stone-400 font-light italic leading-snug">{t.blog.description}</p>
            </div>
            <button onClick={onBlog} className="luxury-button-secondary h-14 md:h-16 px-8 md:px-12 group self-start lg:self-auto">
              {t.blog.exploreAll} <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { location: "Barcelona", tag: "Editorial", title: "City stories are on the way", author: "Hey Lola", comingSoon: true },
              { location: "Miami", tag: "Guides", title: "Local travel tips arriving soon", author: "Hey Lola", comingSoon: true },
              { location: "NYC", tag: "Community", title: "Real member updates coming soon", author: "Hey Lola", comingSoon: true }
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
            onClick={() => setShowApplyModal(true)}
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
            <button className="luxury-button-primary w-full lg:w-auto px-10 md:px-16 h-14 md:h-16 lg:h-14 text-[11px] shrink-0 shadow-xl md:shadow-2xl">
              {t.blog.cta}
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
                <span className="text-white/40 font-black uppercase tracking-[0.5em] text-[10px]">Membership</span>
                <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-[0.85] text-white">
                  Hey Lola<br /><span className="text-white/30">Club</span><span className="text-brand-orange">.</span>
                </h2>
              </div>
              <p className="text-2xl sm:text-3xl text-white/70 font-light italic leading-snug">
                A better city life for you and your dog.
              </p>
              <p className="text-base sm:text-lg text-stone-400 font-light leading-relaxed max-w-lg">
                Discover trusted dog-friendly places, unlock local perks, save your favourite spots, keep your pet essentials organised, and explore city guides created by real dog parents.
              </p>
              <p className="text-sm text-stone-500 leading-relaxed max-w-lg">
                Hey Lola Club brings together dog parents, local creators and pet-friendly venues in one trusted ecosystem. We are starting city by city — with local guides, verified places, member perks and useful pet records.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={onSignUp}
                  className="luxury-button bg-white text-charcoal h-12 px-8 text-[10px] font-black tracking-[0.25em] uppercase hover:bg-stone-100 hover:scale-[1.02] transition-all shadow-xl"
                >
                  Join as a founding member
                </button>
                <button
                  onClick={onExplore}
                  className="luxury-button border border-white/20 text-white/70 hover:text-white hover:border-white/40 h-12 px-8 text-[10px] font-black tracking-[0.25em] uppercase transition-all"
                >
                  Explore local picks
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
                { icon: <MapPin size={18} />, label: 'Dog-friendly places', desc: 'Verified & community-recommended venues in your city.' },
                { icon: <Star size={18} />, label: 'Member perks', desc: 'Exclusive discounts and priority access from partner venues.' },
                { icon: <PawPrint size={18} />, label: 'Pet profiles', desc: 'Passport, records, vaccines and essential info in one place.' },
                { icon: <MessageSquare size={18} />, label: 'Community', desc: 'Local creators, city guides and a trusted dog parent network.' },
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

      {/* ── Membership Plans ── */}
      <section className="py-8 sm:py-10 px-5 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-6"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Membership</span>
          <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-[0.85]">
            Simple, honest <span className="text-stone-300">pricing</span><span className="text-brand-orange">.</span>
          </h2>
          <p className="text-lg text-stone-400 font-light italic max-w-xl mx-auto">
            Start free and upgrade when you're ready. Founding members keep their early access price — forever.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <PricingCard plan={plan} onSignUp={onSignUp} onClub={onClub} />
            </motion.div>
          ))}
        </div>
        <p className="text-center text-[11px] text-stone-400 font-bold uppercase tracking-widest mt-6">
          Founding members will keep their early access price.
        </p>
      </section>

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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Creator Partners</span>
              <h2 className="text-3xl sm:text-3xl font-serif italic tracking-tight leading-[0.9]">
                Built with local<br /><span className="text-stone-300">dog voices</span><span className="text-brand-orange">.</span>
              </h2>
              <p className="text-xl text-stone-500 font-light italic leading-snug">
                Our city guides are created with dog parents, bloggers and creators who know the best places before everyone else.
              </p>
              <p className="text-base text-stone-400 leading-relaxed">
                Hey Lola features trusted recommendations from local creators, always with credit, links to their profiles and referral codes when available.
              </p>
            </div>
            <div className="shrink-0">
              <button
                onClick={onCreators}
                className="luxury-button-primary h-14 px-12 text-[11px] group shadow-xl"
              >
                Become a Creator Partner <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="pb-8 sm:pb-10 px-5 sm:px-6">
        <div className="max-w-7xl mx-auto rounded-[2rem] sm:rounded-2xl md:rounded-3xl lg:rounded-3xl bg-charcoal p-8 sm:p-6 md:p-8 lg:p-8 text-center space-y-8 relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.25)] md:shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
          <div className="relative z-10 space-y-8 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              <span className="text-white/40 font-black uppercase tracking-[0.35em] sm:tracking-[0.5em] text-[10px]">The Future of Pet Parenting</span>
              <h2 className="text-3xl md:text-3xl lg:text-3xl text-white tracking-tight leading-[0.85] sm:leading-[0.8] font-serif italic max-w-3xl mx-auto">{t.home.readyForLiftoff}</h2>
            </div>
            <p className="text-stone-400 text-base sm:text-lg md:text-xl font-light max-w-lg mx-auto italic leading-snug px-5 sm:px-8">{t.home.joinThousands}</p>
            <button
              onClick={onSignUp}
              className="luxury-button bg-white text-charcoal w-full sm:w-auto px-12 h-12 sm:h-14 hover:bg-stone-100 hover:scale-[1.02] active:scale-95 transition-all text-[11px] sm:text-xs font-black tracking-[0.25em] uppercase shadow-lg"
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

      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setShowApplyModal(false)}
              className="absolute inset-0 bg-charcoal/40 backdrop-blur-xl cursor-default focus-visible:outline-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white w-full max-w-2xl rounded-[1.5rem] sm:rounded-[2rem] md:rounded-2xl p-6 sm:p-6 md:p-8 lg:p-8 relative shadow-2xl border border-stone-100 overflow-hidden my-4 sm:my-8 z-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="hub-insight-title"
            >
              <div className="absolute top-0 right-0 p-6 md:p-6 opacity-5 pointer-events-none">
                <BrandLogo size="3xl" />
              </div>

              <button
                onClick={() => setShowApplyModal(false)}
                aria-label="Cerrar"
                className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 text-stone-400 hover:text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40 rounded-full w-9 h-9 flex items-center justify-center bg-white/60 hover:bg-white z-10"
              >
                <X size={18} />
              </button>

              {isSubmitted ? (
                <div className="text-center space-y-6 sm:space-y-8 py-8 sm:py-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-charcoal text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <PawPrint size={32} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif italic text-charcoal leading-none">Insight Received<span className="text-brand-orange">.</span></h2>
                    <p className="text-base sm:text-lg text-stone-400 font-light italic tracking-tight">{t.blog.insightDesc}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 md:space-y-8 relative z-10 font-boutique">
                  <div className="space-y-3 sm:space-y-4 pr-10">
                    <span className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">Apply to contribute</span>
                    <h2 id="hub-insight-title" className="text-3xl sm:text-3xl md:text-4xl tracking-tight leading-[0.95] font-serif italic text-charcoal/90">
                      Hub <span className="text-stone-400">Insight</span>.
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg font-light text-stone-400 italic leading-snug">{t.blog.formSubtitle}</p>
                  </div>

                  <div className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase font-sans tracking-[0.2em] text-stone-400 ml-1">{t.blog.nameLabel}</label>
                        <input
                          required
                          type="text"
                          value={applyForm.name}
                          onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                          placeholder={t.blog.namePlaceholder}
                          className="luxury-input h-12 w-full text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase font-sans tracking-[0.2em] text-stone-400 ml-1">{t.blog.emailLabel}</label>
                        <input
                          required
                          type="email"
                          value={applyForm.email}
                          onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                          placeholder={t.blog.emailPlaceholder}
                          className="luxury-input h-12 w-full text-sm font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase font-sans tracking-[0.2em] text-stone-400 ml-1">{t.blog.handleLabel}</label>
                      <input
                        required
                        type="text"
                        value={applyForm.handle}
                        onChange={(e) => setApplyForm({ ...applyForm, handle: e.target.value })}
                        placeholder={t.blog.handlePlaceholder}
                        className="luxury-input h-12 w-full text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase font-sans tracking-[0.2em] text-stone-400 ml-1">{t.blog.topicsLabel}</label>
                      <textarea
                        required
                        value={applyForm.topics}
                        onChange={(e) => setApplyForm({ ...applyForm, topics: e.target.value })}
                        placeholder={t.blog.topicsPlaceholder}
                        className="luxury-input p-4 h-28 sm:h-32 resize-none w-full text-sm font-medium"
                      />
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="luxury-button-primary w-full h-12 sm:h-14 text-xs flex items-center justify-center gap-3 disabled:opacity-40 shadow-xl transition-all duration-500"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>{t.blog.submit} <ArrowRight size={16} /></>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


function CityCard({ name, status, image }: { name: string, status: string, image: string }) {
  return (
    <div className="group relative aspect-square sm:aspect-[5/6] rounded-[1.75rem] sm:rounded-2xl md:rounded-3xl overflow-hidden bg-stone-100 border border-stone-100 shadow-[0_15px_40px_rgba(0,0,0,0.08)] md:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-2xl transition-all duration-1000">
      <img src={image} alt={name} loading="lazy" className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-8 flex flex-col items-center text-center space-y-2 sm:space-y-3">
        <h3 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight text-white">{name}</h3>
        <div className="h-0.5 w-10 sm:w-12 bg-charcoal transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
        <div className="text-[9px] sm:text-[10px] font-sans font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/70 flex items-center gap-2 sm:gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-charcoal animate-pulse" /> {status}
        </div>
      </div>
    </div>
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

interface PlanData {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  cta: string;
  highlight: boolean;
  badge?: string;
}

const PLANS: PlanData[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    tagline: 'Start exploring dog-friendly places and build your pet profile.',
    features: [
      'Pet profile & passport',
      'Explore dog-friendly places',
      'Community feed access',
      'Basic city guides',
    ],
    cta: 'Get started',
    highlight: false,
  },
  {
    id: 'local',
    name: 'Local',
    price: '$6.99',
    period: 'per month',
    tagline: 'For the dog parent who loves their city and wants more from it.',
    features: [
      'Everything in Free',
      'Save favourite places',
      'Member perks & discounts',
      'One city guide — full access',
    ],
    cta: 'Join early access',
    highlight: false,
    badge: 'Popular',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$12.99',
    period: 'per month',
    tagline: 'For the dog parent who travels and wants the full experience.',
    features: [
      'Everything in Local',
      'All city guides — full access',
      'Priority venue perks',
      'Travel documents & records',
    ],
    cta: 'Join early access',
    highlight: true,
    badge: 'Recommended',
  },
  {
    id: 'black',
    name: 'Black',
    price: '$24.99',
    period: 'per month',
    tagline: 'For the most committed dog traveller. Unlimited and always first.',
    features: [
      'Everything in Plus',
      'Early access to new cities',
      'Exclusive Black member perks',
      'Founding member badge',
    ],
    cta: 'Join early access',
    highlight: false,
    badge: 'Black',
  },
];

function PricingCard({ plan, onSignUp, onClub }: { plan: PlanData; onSignUp: () => void; onClub?: () => void }) {
  const handleClick = () => {
    if (plan.id === 'free') {
      onSignUp();
    } else {
      onClub ? onClub() : onSignUp();
    }
  };

  return (
    <div className={`relative flex flex-col h-full rounded-[1.5rem] border p-6 space-y-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 font-boutique ${
      plan.highlight
        ? 'bg-charcoal text-white border-charcoal shadow-[0_20px_60px_rgba(0,0,0,0.25)]'
        : 'bg-white text-charcoal border-stone-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)]'
    }`}>
      {plan.badge && (
        <div className={`absolute -top-2 left-5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] ${
          plan.highlight ? 'bg-brand-orange text-white' : 'bg-stone-100 text-stone-600'
        }`}>
          {plan.badge}
        </div>
      )}

      <div className="space-y-2">
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${plan.highlight ? 'text-white/50' : 'text-stone-400'}`}>
          {plan.name}
        </p>
        <div className="flex items-end gap-1">
          <span className={`text-3xl font-serif italic tracking-tight ${plan.highlight ? 'text-white' : 'text-charcoal'}`}>
            {plan.price}
          </span>
          <span className={`text-sm pb-1 font-light ${plan.highlight ? 'text-white/50' : 'text-stone-400'}`}>
            /{plan.period}
          </span>
        </div>
        <p className={`text-[13px] font-light leading-snug ${plan.highlight ? 'text-white/70' : 'text-stone-500'}`}>
          {plan.tagline}
        </p>
      </div>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <Check size={14} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-brand-orange' : 'text-charcoal/40'}`} />
            <span className={`text-[13px] leading-snug ${plan.highlight ? 'text-white/80' : 'text-stone-500'}`}>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        className={`w-full h-10 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
          plan.highlight
            ? 'bg-white text-charcoal hover:bg-stone-100'
            : 'bg-charcoal text-white hover:bg-charcoal/80'
        }`}
      >
        {plan.cta}
      </button>
    </div>
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
            <span className="inline-flex text-stone-500 text-[9px] font-black uppercase tracking-[0.3em] bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">Coming soon</span>
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

