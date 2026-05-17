import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Loader2, PawPrint } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  motivation: '',
};

const BENEFITS = [
  { label: 'Your credit on every recommendation', desc: 'Every place you recommend shows your name and links to your profile — forever.' },
  { label: 'Referral earnings', desc: 'Earn commission on every member who signs up using your personal referral code.' },
  { label: 'Exclusive access', desc: 'Early access to new cities, features, and partner perks before anyone else.' },
  { label: 'Community reach', desc: 'Your guides reach thousands of dog parents actively searching for trusted places.' },
];

export const Creators: React.FC<CreatorsProps> = ({ onBack }) => {
  const [form, setForm] = useState<ApplicationForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof ApplicationForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'creator_applications'), {
        ...form,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setIsSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email hey@heylola.co');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white page-shell">
      {/* Hero — same visual language as Explore: white background, big
          black-italic display heading, lower-case orange period accent. */}
      <section className="relative pt-12 pb-10 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 max-w-3xl"
          >
            <span className="text-stone-400 font-black uppercase tracking-[0.4em] text-[10px]">Creator Partners</span>
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-[0.9] text-charcoal">
              Built with local <span className="text-stone-300">dog voices</span><span className="brand-dot" aria-hidden="true"></span>
            </h1>
            <p className="text-lg font-medium text-stone-400 max-w-md italic leading-tight">
              If you know the best dog-friendly spots before anyone else, we want to work with you.
            </p>
            <p className="text-base text-stone-400 font-light leading-relaxed max-w-2xl">
              Hey Lola partners with dog parents, bloggers, content creators and local guides who have built genuine audiences and know their city. Your recommendations are credited, linked, and earn you a commission when they bring new members.
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
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">What you get</span>
          <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight">Why become a Creator Partner<span className="text-brand-orange">?</span></h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {BENEFITS.map(({ label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-8 rounded-[1.5rem] border border-stone-100 space-y-3 hover:border-stone-200 hover:shadow-xl transition-all duration-500"
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

      {/* Application form */}
      <section className="py-8 sm:py-10 px-5 sm:px-6 bg-stone-50 border-t border-stone-100">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3 mb-8"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Apply to join</span>
            <h2 className="text-3xl sm:text-3xl font-serif italic tracking-tight">
              Creator application<span className="brand-dot" aria-hidden="true"></span>
            </h2>
            <p className="text-stone-400 font-light italic">
              Tell us about yourself and your dog. We review every application personally.
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
                <h3 className="text-3xl font-serif italic text-charcoal">Application received<span className="brand-dot" aria-hidden="true"></span></h3>
                <p className="text-stone-400 font-light italic">We'll review your application and get back to you within a few days.</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-[1.5rem] border border-stone-100 p-8 sm:p-6">
              {/* Personal info */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 border-b border-stone-100 pb-4">About you</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Full name *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={update('name')}
                      placeholder="Your name"
                      className="luxury-input h-12 w-full text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      placeholder="hello@yoursite.com"
                      className="luxury-input h-12 w-full text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Your city *</label>
                  <input
                    required
                    type="text"
                    value={form.city}
                    onChange={update('city')}
                    placeholder="Barcelona, Miami, NYC…"
                    className="luxury-input h-12 w-full text-sm"
                  />
                </div>
              </div>

              {/* Social profiles */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 border-b border-stone-100 pb-4">Your channels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Instagram handle</label>
                    <input
                      type="text"
                      value={form.instagram}
                      onChange={update('instagram')}
                      placeholder="@yourhandle"
                      className="luxury-input h-12 w-full text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">TikTok handle</label>
                    <input
                      type="text"
                      value={form.tiktok}
                      onChange={update('tiktok')}
                      placeholder="@yourhandle"
                      className="luxury-input h-12 w-full text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Website or blog</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={update('website')}
                    placeholder="https://yourblog.com"
                    className="luxury-input h-12 w-full text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Approximate audience size *</label>
                  <select
                    required
                    value={form.audience}
                    onChange={update('audience')}
                    className="luxury-input h-12 w-full text-sm"
                  >
                    <option value="">Select range…</option>
                    <option value="under_1k">Under 1,000</option>
                    <option value="1k_10k">1,000 – 10,000</option>
                    <option value="10k_50k">10,000 – 50,000</option>
                    <option value="50k_plus">50,000+</option>
                  </select>
                </div>
              </div>

              {/* About your dog */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 border-b border-stone-100 pb-4">Your dog</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Dog's name *</label>
                    <input
                      required
                      type="text"
                      value={form.dogName}
                      onChange={update('dogName')}
                      placeholder="Lola, Max, Luna…"
                      className="luxury-input h-12 w-full text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Breed</label>
                    <input
                      type="text"
                      value={form.dogBreed}
                      onChange={update('dogBreed')}
                      placeholder="Golden Retriever, Mixed…"
                      className="luxury-input h-12 w-full text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Content & motivation */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 border-b border-stone-100 pb-4">Your content</h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Type of content you create *</label>
                  <input
                    required
                    type="text"
                    value={form.contentType}
                    onChange={update('contentType')}
                    placeholder="City guides, pet lifestyle, travel, vet tips…"
                    className="luxury-input h-12 w-full text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Why do you want to partner with Hey Lola? *</label>
                  <textarea
                    required
                    value={form.motivation}
                    onChange={update('motivation')}
                    placeholder="Tell us what excites you about this partnership and what you'd bring…"
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
                className="luxury-button-primary w-full h-14 text-xs flex items-center justify-center gap-3 disabled:opacity-40 shadow-xl"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Submit application <ArrowRight size={16} /></>}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
