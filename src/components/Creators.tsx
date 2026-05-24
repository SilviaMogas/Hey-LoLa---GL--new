import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Loader2, PawPrint } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../lib/LanguageContext';

interface CreatorsProps {
  onBack: () => void;
}

interface ApplicationForm {
  name: string;
  email: string;
  city: string;
  instagram: string;
  tiktok: string;
  website: string;
  audience: string;
  dogName: string;
  dogBreed: string;
  contentType: string;
  best_post_url: string;
  motivation: string;
}

const EMPTY_FORM: ApplicationForm = {
  name: '',
  email: '',
  city: '',
  instagram: '',
  tiktok: '',
  website: '',
  audience: '',
  dogName: '',
  dogBreed: '',
  contentType: '',
  best_post_url: '',
  motivation: '',
};

export const Creators: React.FC<CreatorsProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<ApplicationForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Scroll to the application form when arriving via /creators#apply.
  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== '#apply') return;
    const id = window.setTimeout(() => {
      document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    return () => window.clearTimeout(id);
  }, []);

  const update = (field: keyof ApplicationForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await supabase.from('creator_applications').insert({
        name: form.name,
        email: form.email,
        city: form.city,
        instagram: form.instagram,
        tiktok: form.tiktok,
        website: form.website,
        audience: form.audience,
        dog_name: form.dogName,
        dog_breed: form.dogBreed,
        content_type: form.contentType,
        best_post_url: form.best_post_url,
        motivation: form.motivation,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      setIsSubmitted(true);
    } catch {
      setError(t.creators.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white page-shell">
      {/* Hero — same visual language as Explore: white background, big
          black-italic display heading, lower-case orange period accent. */}
      <section className="relative pt-12 pb-10 px-5 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft size={14} /> {t.creators.back}
          </button>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 max-w-3xl"
          >
            <span className="text-stone-400 font-black uppercase tracking-[0.4em] text-[10px]">{t.creators.kicker}</span>
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-[0.9] text-charcoal">
              {t.creators.heroTitle} <span className="text-stone-300">{t.creators.heroTitleHighlight}</span><span className="brand-dot" aria-hidden="true" />
            </h1>
            <p className="text-lg font-medium text-stone-400 max-w-2xl italic leading-tight">
              {t.creators.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 sm:py-10 px-5 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3 mb-6 border-l-2 border-stone-200 pl-8"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">{t.creators.whatYouGet}</span>
          <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight">{t.creators.whyBecome}<span className="text-brand-orange">?</span></h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: t.creators.benefit1Label, desc: t.creators.benefit1Desc },
            { label: t.creators.benefit2Label, desc: t.creators.benefit2Desc },
            { label: t.creators.benefit3Label, desc: t.creators.benefit3Desc },
            { label: t.creators.benefit4Label, desc: t.creators.benefit4Desc },
          ].map(({ label, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-[1.5rem] border border-stone-100 space-y-3 hover:border-stone-200 hover:shadow-xl transition-all duration-500"
            >
              <div className="flex items-start gap-3">
                <Check size={16} className="text-charcoal/50 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-charcoal">{label}</p>
                  <p className="text-sm text-stone-400 leading-relaxed font-light">{desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-8 sm:py-10 px-5 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3 mb-6 border-l-2 border-stone-200 pl-8"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">{t.creators.theProcess}</span>
          <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight">{t.creators.howItWorks}<span className="brand-dot" aria-hidden="true" /></h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '01', title: t.creators.step1Title, desc: t.creators.step1Desc },
            { step: '02', title: t.creators.step2Title, desc: t.creators.step2Desc },
            { step: '03', title: t.creators.step3Title, desc: t.creators.step3Desc },
          ].map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-8 rounded-[1.5rem] border border-stone-100 space-y-3 hover:border-stone-200 hover:shadow-xl transition-all duration-500"
            >
              <span className="text-2xl font-black italic tracking-tighter text-stone-300">{step}</span>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-charcoal">{title}</p>
              <p className="text-sm text-stone-400 leading-relaxed font-light">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="py-8 sm:py-10 px-5 sm:px-6 bg-stone-50 border-t border-stone-100">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3 mb-8"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">{t.creators.applyToJoin}</span>
            <h2 className="text-3xl sm:text-3xl font-serif italic tracking-tight">
              {t.creators.creatorApplication}<span className="brand-dot" aria-hidden="true" />
            </h2>
            <p className="text-stone-400 font-light italic">
              {t.creators.applicationIntro}
            </p>
          </motion.div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-10 bg-white rounded-[1.5rem] border border-stone-100 px-8"
            >
              <div className="w-20 h-20 bg-charcoal rounded-full flex items-center justify-center mx-auto shadow-xl">
                <PawPrint size={36} className="text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-serif italic text-charcoal">{t.creators.applicationReceived}<span className="brand-dot" aria-hidden="true" /></h3>
                <p className="text-stone-400 font-light italic">{t.creators.applicationReviewMsg}</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-[1.5rem] border border-stone-100 p-6">
              {/* Personal info */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 border-b border-stone-100 pb-4">{t.creators.aboutYou}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.fullName} *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={update('name')}
                      placeholder={t.creators.yourName}
                      className="luxury-input h-10 w-full text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.email} *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      placeholder="hello@yoursite.com"
                      className="luxury-input h-10 w-full text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.yourCity} *</label>
                  <input
                    required
                    type="text"
                    value={form.city}
                    onChange={update('city')}
                    placeholder="Barcelona, Miami, NYC…"
                    className="luxury-input h-10 w-full text-sm"
                  />
                </div>
              </div>

              {/* Social profiles */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 border-b border-stone-100 pb-4">{t.creators.yourChannels}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.instagramHandle}</label>
                    <input
                      type="text"
                      value={form.instagram}
                      onChange={update('instagram')}
                      placeholder="@yourhandle"
                      className="luxury-input h-10 w-full text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.tiktokHandle}</label>
                    <input
                      type="text"
                      value={form.tiktok}
                      onChange={update('tiktok')}
                      placeholder="@yourhandle"
                      className="luxury-input h-10 w-full text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.websiteOrBlog}</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={update('website')}
                    placeholder="https://yourblog.com"
                    className="luxury-input h-10 w-full text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.audienceSize} *</label>
                  <select
                    required
                    value={form.audience}
                    onChange={update('audience')}
                    className="luxury-input h-10 w-full text-sm"
                  >
                    <option value="">{t.creators.selectRange}</option>
                    <option value="under_1k">{t.creators.under1k}</option>
                    <option value="1k_10k">{t.creators.range1k10k}</option>
                    <option value="10k_50k">{t.creators.range10k50k}</option>
                    <option value="50k_plus">{t.creators.range50kPlus}</option>
                  </select>
                </div>
              </div>

              {/* About your dog */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 border-b border-stone-100 pb-4">{t.creators.yourDog}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.dogName} *</label>
                    <input
                      required
                      type="text"
                      value={form.dogName}
                      onChange={update('dogName')}
                      placeholder="Lola, Max, Luna…"
                      className="luxury-input h-10 w-full text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.breed}</label>
                    <input
                      type="text"
                      value={form.dogBreed}
                      onChange={update('dogBreed')}
                      placeholder="Golden Retriever, Mixed…"
                      className="luxury-input h-10 w-full text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Content & motivation */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 border-b border-stone-100 pb-4">{t.creators.yourContent}</h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.contentType} *</label>
                  <input
                    required
                    type="text"
                    value={form.contentType}
                    onChange={update('contentType')}
                    placeholder={t.creators.contentPlaceholder}
                    className="luxury-input h-10 w-full text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.bestPostLink} *</label>
                  <input
                    required
                    type="url"
                    value={form.best_post_url}
                    onChange={update('best_post_url')}
                    placeholder="https://…"
                    className="luxury-input h-10 w-full text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{t.creators.whyPartner} *</label>
                  <textarea
                    required
                    value={form.motivation}
                    onChange={update('motivation')}
                    placeholder={t.creators.whyPartnerPlaceholder}
                    className="luxury-input p-4 h-32 resize-none w-full text-sm"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="luxury-button-primary w-full h-11 text-[10px] tracking-[0.25em] flex items-center justify-center gap-2 disabled:opacity-40 shadow-md"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>{t.creators.submitApplication} <ArrowRight size={14} /></>}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
