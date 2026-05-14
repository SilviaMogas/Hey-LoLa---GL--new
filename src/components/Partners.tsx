import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Store, CheckCircle, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { paths } from '../lib/routes';
import { cn } from '../lib/utils';
import { SEO } from '../lib/seo';

const PARTNERS_BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'Partner Network', item: '/partners' },
];

export const Partners: React.FC<{ onBack: () => void; onJoinWaitlist: () => void; onClaimBusiness: () => void; onSearchListing?: () => void }> = ({ onBack, onJoinWaitlist, onClaimBusiness, onSearchListing }) => {
  return (
    <div className="bg-bone min-h-screen font-boutique">
      <SEO
        title="Join the Boutique Dog-Friendly Network — Hey Lola Partners"
        description="Hey Lola connects curated businesses with modern dog parents looking for trusted places and better experiences. Be discovered, build trust with a Verified badge, reach a qualified lifestyle audience."
        url="/partners"
        breadcrumbs={PARTNERS_BREADCRUMBS}
      />
      <section className="relative pt-12 pb-16 px-5 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(215,92,41,0.03),transparent_50%)]" />
        <div className="max-w-5xl mx-auto space-y-6 relative z-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft size={14} /> Back
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 max-w-3xl pt-8"
          >
            <span className="inline-flex items-center gap-2 text-brand-orange bg-brand-orange/5 px-3 py-1.5 rounded-full font-black uppercase tracking-[0.3em] text-[9px]">
              <Store size={10} /> Partner Network
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter leading-[0.9] text-charcoal">
              Join the boutique <br className="hidden md:block"/>
              <span className="text-stone-300">dog-friendly network</span><span className="text-brand-orange">.</span>
            </h1>
            <p className="text-lg md:text-xl font-medium text-stone-500 max-w-xl italic leading-tight">
              Hey Lola connects curated businesses with modern dog parents looking for trusted places and better experiences.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 max-w-2xl">
              {/* New business — create from scratch */}
              <button
                onClick={onClaimBusiness}
                className="group text-left p-5 rounded-2xl bg-charcoal text-white hover:bg-stone-800 transition-all flex flex-col gap-2"
              >
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">New to Hey Lola</span>
                <span className="text-base font-bold italic">Create a new partner profile</span>
                <span className="text-xs text-white/60 font-light leading-snug">
                  Your business is not yet on the map. Onboard from scratch with our 4-step wizard.
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] pt-1">
                  Start onboarding <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>

              {/* Existing listing — verify / claim */}
              <button
                onClick={onSearchListing ?? onJoinWaitlist}
                className="group text-left p-5 rounded-2xl bg-white text-charcoal border border-stone-200 hover:border-charcoal hover:bg-stone-50 transition-all flex flex-col gap-2"
              >
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400">Already on the map</span>
                <span className="text-base font-bold italic">Verify your existing listing</span>
                <span className="text-xs text-stone-500 font-light leading-snug">
                  Your business is already on Hey Lola. Find it, claim ownership and unlock the partner dashboard.
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] pt-1">
                  Search the map <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-5 sm:px-6 py-16 bg-white border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-14 max-w-2xl mx-auto">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Partner Benefits</span>
            <h2 className="text-3xl font-serif italic tracking-tight text-charcoal">Verified partners. Better experiences<span className="text-brand-orange">.</span></h2>
            <p className="text-sm text-stone-500 font-light italic leading-relaxed pt-1">
              Hey Lola works with dog-friendly businesses that want to welcome dog parents with trust, quality and simple member perks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-stone-50 inline-flex items-center justify-center rounded-full text-charcoal mb-2">
                <MapPin size={20} />
              </div>
              <h3 className="text-lg font-bold italic text-charcoal">Be discovered by dog parents</h3>
              <p className="text-sm text-stone-500 leading-relaxed">Appear in the curated city guide when dog parents are looking for trusted places to eat, stay or play.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#EBF1E9] inline-flex items-center justify-center rounded-full text-[#7A8C6E] mb-2">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold italic text-charcoal">Build trust with a Verified badge</h3>
              <p className="text-sm text-stone-500 leading-relaxed">Claim your profile and pass our manual review to earn the Verified badge that tells dog parents your business genuinely welcomes them — in person or online.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-stone-50 inline-flex items-center justify-center rounded-full text-charcoal mb-2">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-lg font-bold italic text-charcoal">Reach a qualified lifestyle audience</h3>
              <p className="text-sm text-stone-500 leading-relaxed">Offer simple member perks and get priority visibility during the Miami launch — join early to set the tone.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-6 py-20 bg-stone-50">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-serif italic tracking-tight text-charcoal">How it works<span className="text-brand-orange">.</span></h2>
            <p className="text-stone-500 font-light">A simple, self-service journey to become a Verified partner.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Find or create', desc: 'Search for your business or add a new profile.' },
              { step: '02', title: 'Submit details', desc: 'Add photos, dog-friendly policies, and your exclusive member perk.' },
              { step: '03', title: 'Review', desc: 'Our team reviews your submission. Your profile shows as Pending Verification.' },
              { step: '04', title: 'Verified', desc: 'Once approved, you get the Verified badge and your perk goes live.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white p-6 rounded-[2rem] border border-stone-100 space-y-4 relative overflow-hidden group hover:border-stone-200 transition-colors">
                <div className="text-4xl font-black italic text-stone-100 group-hover:text-stone-200 transition-colors select-none">{step}</div>
                <div className="space-y-2 relative z-10">
                  <h4 className="font-bold text-charcoal italic">{title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-6 py-20 bg-white border-y border-stone-100">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-serif italic tracking-tight text-charcoal">Partner Tiers<span className="text-brand-orange">.</span></h2>
            <p className="text-stone-500 font-light">Explore how our partner network is structured.</p>
          </div>
          
          <div className="space-y-12">
            {[
              {
                tier: 'Free',
                desc: 'Basic directory listing.',
                partners: [
                  { name: 'Pups & Cups', city: 'Miami', status: 'Listed', perk: null },
                  { name: 'Miami Dog Run', city: 'Miami', status: 'Verified', perk: null },
                ]
              },
              {
                tier: 'Local',
                desc: 'Verified partner offering standard member perks.',
                partners: [
                  { name: 'The Watering Bowl', city: 'Miami', status: 'Verified', perk: '10% off entry' },
                  { name: 'Sunny Paws Daycare', city: 'Miami', status: 'Verified', perk: 'Free evaluation day' },
                ]
              },
              {
                tier: 'Plus',
                desc: 'Premium travel partners with global reach.',
                partners: [
                  { name: 'Staycation Pets', city: 'Miami', status: 'Verified', perk: 'Late checkout & welcome treat' },
                ]
              },
              {
                tier: 'Black',
                desc: 'Exclusive access and ultra-premium experiences.',
                partners: [
                  { name: 'The Hound Club', city: 'Miami', status: 'Verified', perk: 'Priority booking & VIP access' },
                ]
              }
            ].map(tier => (
              <div key={tier.tier} className="space-y-6">
                 <div className="border border-stone-100 rounded-[2rem] p-6 bg-stone-50">
                    <h3 className="font-bold text-lg italic text-charcoal mb-2">{tier.tier} Partner</h3>
                    <p className="text-xs text-stone-500">{tier.desc}</p>
                 </div>
                 <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {tier.partners.map((partner, i) => (
                     <div key={i} className="border border-stone-100 p-4 rounded-2xl bg-white space-y-3 relative group">
                       <div className="flex justify-between items-start">
                         <div>
                           <h4 className="font-bold text-charcoal italic">{partner.name}</h4>
                           <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">{partner.city}</p>
                         </div>
                       </div>
                       <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex w-fit items-center gap-1",
                          partner.status === 'Verified' ? "bg-[#EBF1E9] text-[#7A8C6E]" : "bg-stone-50 text-stone-400"
                        )}>
                          {partner.status === 'Verified' ? <ShieldCheck size={10} /> : <Store size={10} />}
                          {partner.status}
                        </span>
                        {partner.perk && (
                          <div className="pt-2 border-t border-stone-50 text-[10px] text-brand-orange font-bold space-y-1">
                            <span className="uppercase tracking-widest text-[#7A8C6E]">Member Perk</span>
                            <p className="text-stone-500 font-normal">{partner.perk}</p>
                          </div>
                        )}
                     </div>
                   ))}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-6 py-20 bg-charcoal text-white text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight">Launching first in Miami<span className="text-brand-orange">.</span></h2>
          <p className="text-stone-400 font-light italic text-lg">
            We are onboarding founding partners in Miami right now. Join early and get priority visibility during the launch. New York City and Barcelona coming next.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={onClaimBusiness} className="luxury-button bg-white text-charcoal h-12 px-8 uppercase tracking-[0.25em] text-[10px] font-black hover:bg-stone-100 transition-all flex items-center justify-center gap-2">
              Become a Partner <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
