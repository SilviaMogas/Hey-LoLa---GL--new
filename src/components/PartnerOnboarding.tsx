import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  ChevronLeft,
  Loader2,
  Building2,
  User,
  Gift,
  FileCheck,
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SEO } from '../lib/seo';

interface PartnerOnboardingProps {
  onBack: () => void;
  onComplete?: () => void;
}

type Category =
  | 'restaurant'
  | 'cafe'
  | 'hotel'
  | 'vet'
  | 'groomer'
  | 'daycare'
  | 'trainer'
  | 'pet_shop'
  | 'experience'
  | 'other';

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'cafe', label: 'Café', emoji: '☕' },
  { id: 'hotel', label: 'Hotel', emoji: '🛎️' },
  { id: 'vet', label: 'Veterinary', emoji: '🩺' },
  { id: 'groomer', label: 'Groomer', emoji: '✂️' },
  { id: 'daycare', label: 'Daycare', emoji: '🏡' },
  { id: 'trainer', label: 'Trainer', emoji: '🎓' },
  { id: 'pet_shop', label: 'Pet Shop', emoji: '🛍️' },
  { id: 'experience', label: 'Experience', emoji: '✨' },
  { id: 'other', label: 'Other', emoji: '🐾' },
];

type City = 'miami' | 'nyc' | 'barcelona' | 'other';
const CITIES: { id: City; label: string; status: 'live' | 'soon' }[] = [
  { id: 'miami', label: 'Miami', status: 'live' },
  { id: 'nyc', label: 'New York City', status: 'soon' },
  { id: 'barcelona', label: 'Barcelona', status: 'soon' },
  { id: 'other', label: 'Other / Waitlist', status: 'soon' },
];

type PerkType =
  | 'discount'
  | 'free_item'
  | 'priority_booking'
  | 'pet_friendly_experience'
  | 'loyalty_reward'
  | 'other';

const PERK_TYPES: { id: PerkType; label: string; description: string; emoji: string }[] = [
  { id: 'discount', label: 'Discount', description: '10% off the bill, percentage on services, etc.', emoji: '🏷️' },
  { id: 'free_item', label: 'Welcome treat', description: 'Free dog biscuit, water bowl, welcome drink.', emoji: '🎁' },
  { id: 'priority_booking', label: 'Priority booking', description: 'Reserved table, fast-lane check-in, member-only slot.', emoji: '⭐' },
  { id: 'pet_friendly_experience', label: 'Dog-friendly experience', description: 'A signature moment — dog brunch, paw spa, evening run club.', emoji: '🐶' },
  { id: 'loyalty_reward', label: 'Loyalty reward', description: 'Stamp card, 10th visit free, points on the house.', emoji: '💛' },
  { id: 'other', label: 'Other', description: 'Tell us what you would like to offer.', emoji: '✨' },
];

const DOG_FRIENDLY_FEATURES = [
  'Dogs allowed indoors',
  'Outdoor terrace welcomes dogs',
  'Water bowl on request',
  'Dog menu / treats available',
  'No weight limit',
  'Dog beds / mats available',
  'Off-leash area',
];

interface FormState {
  businessName: string;
  categories: Category[];
  city: City;
  cityOther: string;
  address: string;
  website: string;
  instagram: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  features: string[];
  notes: string;
  offersPerk: boolean | null;
  perkType: PerkType | null;
  perkDescription: string;
  perkConditions: string;
  perkAvailability: string;
  agree: boolean;
}

const STEPS = ['Business', 'Contact', 'Perk', 'Review'] as const;
type Step = typeof STEPS[number];

const BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'Partner Network', item: '/partners' },
  { name: 'Become a Partner', item: '/partners/onboard' },
];

export const PartnerOnboarding: React.FC<PartnerOnboardingProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState<Step>('Business');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    businessName: '',
    categories: [],
    city: 'miami',
    cityOther: '',
    address: '',
    website: '',
    instagram: '',
    contactName: '',
    contactRole: '',
    email: '',
    phone: '',
    features: [],
    notes: '',
    offersPerk: null,
    perkType: null,
    perkDescription: '',
    perkConditions: '',
    perkAvailability: '',
    agree: false,
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArray = <K extends 'categories' | 'features'>(key: K, value: FormState[K][number]) =>
    setForm((prev) => {
      const current = prev[key] as string[];
      const next = current.includes(value as string)
        ? current.filter((x) => x !== value)
        : [...current, value as string];
      return { ...prev, [key]: next as FormState[K] };
    });

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const isStepValid = useMemo(() => {
    if (step === 'Business')
      return form.businessName.trim().length > 1 && form.categories.length > 0 && (form.city !== 'other' || form.cityOther.trim().length > 1);
    if (step === 'Contact') return form.contactName.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (step === 'Perk') return form.offersPerk === false || (form.offersPerk === true && !!form.perkType && form.perkDescription.trim().length > 3);
    if (step === 'Review') return form.agree;
    return false;
  }, [step, form]);

  const goNext = () => {
    setError(null);
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  };
  const goBack = () => {
    setError(null);
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
    else onBack();
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleSubmit = async () => {
    if (!isStepValid) return;
    setSubmitting(true);
    setError(null);
    try {
      await addDoc(collection(db, 'partner_applications'), {
        businessName: form.businessName,
        categories: form.categories,
        city: form.city === 'other' ? form.cityOther : form.city,
        address: form.address,
        website: form.website,
        instagram: form.instagram,
        contactName: form.contactName,
        contactRole: form.contactRole,
        email: form.email,
        phone: form.phone,
        dogFriendlyFeatures: form.features,
        notes: form.notes,
        offersPerk: form.offersPerk,
        perk: form.offersPerk
          ? {
              type: form.perkType,
              description: form.perkDescription,
              conditions: form.perkConditions,
              availability: form.perkAvailability,
            }
          : null,
        source: 'self_onboarding',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      onComplete?.();
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="bg-white min-h-screen text-charcoal font-boutique" aria-labelledby="partner-success-heading">
        <SEO title="Application received — Hey Lola Partner Network" url="/partners/onboard" index={false} breadcrumbs={BREADCRUMBS} />
        <div className="max-w-2xl mx-auto px-5 sm:px-6 py-20 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#EBF1E9] text-[#7A8C6E] flex items-center justify-center">
            <CheckCircle size={28} />
          </div>
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Partner Network</span>
          <h1 id="partner-success-heading" className="text-4xl sm:text-5xl font-serif italic tracking-tight leading-[0.95]">
            We've got it<span className="text-brand-orange">.</span>
          </h1>
          <p className="text-base sm:text-lg text-stone-500 font-light italic leading-snug max-w-md mx-auto">
            Thank you for joining the Hey Lola Partner Network. Our team will review your application within 5 business days and email you next steps.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 text-left">
            {[
              { title: 'We review', body: 'Our team checks your details and dog-friendly status.' },
              { title: 'You verify', body: 'We confirm your contact email and may visit your venue.' },
              { title: 'You go Verified', body: 'Your profile and perk go live on Hey Lola.' },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl border border-stone-100 bg-stone-50 p-5 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{step.title}</p>
                <p className="text-sm text-stone-600 font-light leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 luxury-button bg-charcoal text-white h-12 px-8 text-[11px] font-black tracking-[0.25em] uppercase hover:bg-charcoal/80 mt-6"
          >
            Back to Hey Lola
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen text-charcoal font-boutique" aria-labelledby="partner-onboarding-heading">
      <SEO
        title="Become a Hey Lola Partner — Self-Onboarding"
        description="Self-onboard your dog-friendly business onto Hey Lola. Tell us about your venue, choose the perk you offer to members, and our team will verify within 5 business days."
        url="/partners/onboard"
        breadcrumbs={BREADCRUMBS}
      />

      <header className="border-b border-stone-100 bg-stone-50/60">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-6 space-y-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <ChevronLeft size={12} /> {stepIndex === 0 ? 'Back to Partners' : 'Previous'}
          </button>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Partner Network</span>
            <h1 id="partner-onboarding-heading" className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-none">
              Become a Hey Lola Partner<span className="text-brand-orange">.</span>
            </h1>
            <p className="text-sm sm:text-base text-stone-500 font-light italic leading-snug max-w-xl">
              Four short steps. Free to join. Verification takes up to 5 business days.
            </p>
          </div>

          <div aria-label="Onboarding progress" className="space-y-2 pt-2">
            <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-charcoal"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <ol className="grid grid-cols-4 gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-stone-400">
              {STEPS.map((s, i) => (
                <li key={s} className={`flex items-center gap-1.5 ${i <= stepIndex ? 'text-charcoal' : ''}`}>
                  <span className={`w-4 h-4 rounded-full border ${i < stepIndex ? 'bg-charcoal border-charcoal text-white' : i === stepIndex ? 'border-charcoal' : 'border-stone-200'} flex items-center justify-center text-[8px]`}>
                    {i < stepIndex ? <Check size={9} /> : i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.section
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {step === 'Business' && (
              <BusinessStep form={form} update={update} toggleCategory={(v) => toggleArray('categories', v)} />
            )}
            {step === 'Contact' && (
              <ContactStep form={form} update={update} toggleFeature={(v) => toggleArray('features', v)} />
            )}
            {step === 'Perk' && <PerkStep form={form} update={update} />}
            {step === 'Review' && <ReviewStep form={form} update={update} />}
          </motion.section>
        </AnimatePresence>

        {error && <p className="text-sm text-red-500 mt-6 text-center">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-10 border-t border-stone-100 mt-10">
          <button
            type="button"
            onClick={goBack}
            disabled={submitting}
            className="luxury-button border border-stone-200 text-stone-600 hover:text-charcoal hover:border-charcoal h-12 px-8 text-[10px] font-black tracking-[0.25em] uppercase transition-colors w-full sm:w-auto disabled:opacity-50"
          >
            <ArrowLeft size={14} className="mr-2" />
            {stepIndex === 0 ? 'Cancel' : 'Back'}
          </button>
          {step === 'Review' ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid || submitting}
              className="luxury-button bg-charcoal text-white hover:bg-charcoal/80 h-12 px-10 text-[10px] font-black tracking-[0.25em] uppercase transition-colors w-full sm:flex-1 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Submit application
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!isStepValid}
              className="luxury-button bg-charcoal text-white hover:bg-charcoal/80 h-12 px-10 text-[10px] font-black tracking-[0.25em] uppercase transition-colors w-full sm:flex-1 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

/* ── Steps ─────────────────────────────────────────────────────────── */

function SectionLabel({ icon, kicker, title, description }: { icon: React.ReactNode; kicker: string; title: string; description?: string }) {
  return (
    <header className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">{icon}{kicker}</span>
      <h2 className="text-2xl sm:text-3xl font-serif italic tracking-tight leading-none">{title}<span className="text-brand-orange">.</span></h2>
      {description && <p className="text-sm text-stone-500 font-light italic leading-relaxed max-w-xl">{description}</p>}
    </header>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="space-y-2 block">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 inline-flex items-center gap-2">
        {label}
        {optional && <span className="text-stone-300 normal-case font-light italic">— optional</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass = 'luxury-input h-12 w-full text-sm';

function BusinessStep({ form, update, toggleCategory }: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void; toggleCategory: (v: Category) => void }) {
  return (
    <>
      <SectionLabel icon={<Building2 size={11} />} kicker="Step 1 — Business" title="Tell us about your venue" description="The basics so we can list you correctly." />
      <Field label="Business name">
        <input type="text" required value={form.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="The Watering Bowl" className={inputClass} />
      </Field>
      <Field label="Category — pick one or more">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = form.categories.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] border transition-all inline-flex items-center gap-1.5 ${active ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-stone-500 border-stone-200 hover:border-charcoal hover:text-charcoal'}`}
              >
                <span aria-hidden>{c.emoji}</span> {c.label}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="City">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CITIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => update('city', c.id)}
              className={`rounded-xl border p-3 text-left transition-all ${form.city === c.id ? 'border-charcoal bg-stone-50' : 'border-stone-200 hover:border-charcoal'}`}
            >
              <p className="text-sm font-serif italic text-charcoal">{c.label}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] mt-1 text-stone-400">{c.status === 'live' ? 'Live' : 'Coming soon'}</p>
            </button>
          ))}
        </div>
      </Field>
      {form.city === 'other' && (
        <Field label="Which city?">
          <input type="text" required value={form.cityOther} onChange={(e) => update('cityOther', e.target.value)} placeholder="Los Angeles" className={inputClass} />
        </Field>
      )}
      <Field label="Address" optional>
        <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="200 SE 1st St, Miami, FL" className={inputClass} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Website" optional>
          <input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://thewateringbowl.co" className={inputClass} />
        </Field>
        <Field label="Instagram" optional>
          <input type="text" value={form.instagram} onChange={(e) => update('instagram', e.target.value)} placeholder="@thewateringbowl" className={inputClass} />
        </Field>
      </div>
    </>
  );
}

function ContactStep({ form, update, toggleFeature }: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void; toggleFeature: (v: string) => void }) {
  return (
    <>
      <SectionLabel icon={<User size={11} />} kicker="Step 2 — Contact" title="Who's signing your venue up" description="We'll only use this to verify and reach you about your application." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Your name">
          <input type="text" required value={form.contactName} onChange={(e) => update('contactName', e.target.value)} placeholder="Adriana Rubio" className={inputClass} />
        </Field>
        <Field label="Your role" optional>
          <input type="text" value={form.contactRole} onChange={(e) => update('contactRole', e.target.value)} placeholder="Owner, manager…" className={inputClass} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Business email">
          <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="hello@thewateringbowl.co" className={inputClass} />
        </Field>
        <Field label="Phone" optional>
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 305 …" className={inputClass} />
        </Field>
      </div>
      <Field label="Dog-friendly features — pick all that apply" optional>
        <div className="flex flex-wrap gap-2">
          {DOG_FRIENDLY_FEATURES.map((feat) => {
            const active = form.features.includes(feat);
            return (
              <button
                key={feat}
                type="button"
                onClick={() => toggleFeature(feat)}
                className={`px-3 py-1.5 rounded-full text-[11px] border transition-all ${active ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-stone-500 border-stone-200 hover:border-charcoal hover:text-charcoal'}`}
              >
                {feat}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Anything else we should know?" optional>
        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Peak hours, dog rules, suggested visit time…" className="luxury-input p-4 h-28 w-full text-sm resize-none" />
      </Field>
    </>
  );
}

function PerkStep({ form, update }: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <>
      <SectionLabel
        icon={<Gift size={11} />}
        kicker="Step 3 — Perk"
        title="Choose how you welcome Hey Lola members"
        description="Optional, but verified perks get priority placement during the Miami launch. Perks go live only after Hey Lola approves them."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => { update('offersPerk', true); }}
          className={`rounded-2xl border p-5 text-left transition-all ${form.offersPerk === true ? 'border-charcoal bg-stone-50' : 'border-stone-200 hover:border-charcoal'}`}
        >
          <p className="text-sm font-serif italic text-charcoal">Yes, I want to offer a perk</p>
          <p className="text-[11px] text-stone-500 font-light italic mt-1">Discount, welcome treat, priority booking…</p>
        </button>
        <button
          type="button"
          onClick={() => { update('offersPerk', false); update('perkType', null); }}
          className={`rounded-2xl border p-5 text-left transition-all ${form.offersPerk === false ? 'border-charcoal bg-stone-50' : 'border-stone-200 hover:border-charcoal'}`}
        >
          <p className="text-sm font-serif italic text-charcoal">Not now, maybe later</p>
          <p className="text-[11px] text-stone-500 font-light italic mt-1">You can add a perk after verification.</p>
        </button>
      </div>

      {form.offersPerk && (
        <>
          <Field label="Perk type">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERK_TYPES.map((p) => {
                const active = form.perkType === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => update('perkType', p.id)}
                    className={`rounded-2xl border p-4 text-left transition-all ${active ? 'border-charcoal bg-stone-50' : 'border-stone-200 hover:border-charcoal'}`}
                  >
                    <p className="text-sm font-serif italic text-charcoal inline-flex items-center gap-2">
                      <span aria-hidden>{p.emoji}</span> {p.label}
                    </p>
                    <p className="text-[11px] text-stone-500 font-light italic mt-1">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Describe the perk">
            <textarea
              required
              value={form.perkDescription}
              onChange={(e) => update('perkDescription', e.target.value)}
              placeholder="10% off the bill for Hey Lola members, plus a free dog biscuit for the pup."
              className="luxury-input p-4 h-24 w-full text-sm resize-none"
            />
          </Field>
          <Field label="Conditions" optional>
            <input
              type="text"
              value={form.perkConditions}
              onChange={(e) => update('perkConditions', e.target.value)}
              placeholder="Show the Hey Lola membership in-app. Not combinable with other discounts."
              className={inputClass}
            />
          </Field>
          <Field label="Availability" optional>
            <input
              type="text"
              value={form.perkAvailability}
              onChange={(e) => update('perkAvailability', e.target.value)}
              placeholder="Mon–Fri, all day. Weekends excluded."
              className={inputClass}
            />
          </Field>
        </>
      )}
    </>
  );
}

function ReviewStep({ form, update }: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const cityLabel = form.city === 'other' ? form.cityOther : CITIES.find((c) => c.id === form.city)?.label ?? form.city;
  const categoryLabels = form.categories.map((id) => CATEGORIES.find((c) => c.id === id)?.label ?? id).join(' · ');
  const perkLabel = form.perkType ? PERK_TYPES.find((p) => p.id === form.perkType)?.label : null;

  return (
    <>
      <SectionLabel icon={<FileCheck size={11} />} kicker="Step 4 — Review" title="Looks good?" description="Quick check before we send your application to our team." />

      <div className="rounded-2xl border border-stone-100 bg-stone-50 p-6 space-y-5">
        <ReviewRow label="Business" value={form.businessName} />
        <ReviewRow label="Category" value={categoryLabels} />
        <ReviewRow label="City" value={cityLabel} />
        {form.address && <ReviewRow label="Address" value={form.address} />}
        {form.website && <ReviewRow label="Website" value={form.website} />}
        {form.instagram && <ReviewRow label="Instagram" value={form.instagram} />}
        <hr className="border-stone-200" />
        <ReviewRow label="Contact" value={`${form.contactName}${form.contactRole ? ` · ${form.contactRole}` : ''}`} />
        <ReviewRow label="Email" value={form.email} />
        {form.phone && <ReviewRow label="Phone" value={form.phone} />}
        {form.features.length > 0 && <ReviewRow label="Features" value={form.features.join(' · ')} />}
        {form.notes && <ReviewRow label="Notes" value={form.notes} />}
        <hr className="border-stone-200" />
        <ReviewRow label="Offers a perk" value={form.offersPerk ? 'Yes' : 'Not now'} />
        {form.offersPerk && perkLabel && <ReviewRow label="Perk type" value={perkLabel} />}
        {form.offersPerk && form.perkDescription && <ReviewRow label="Perk description" value={form.perkDescription} />}
        {form.offersPerk && form.perkConditions && <ReviewRow label="Conditions" value={form.perkConditions} />}
        {form.offersPerk && form.perkAvailability && <ReviewRow label="Availability" value={form.perkAvailability} />}
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.agree}
          onChange={(e) => update('agree', e.target.checked)}
          className="mt-1 w-4 h-4 accent-charcoal"
        />
        <span className="text-sm text-stone-600 font-light leading-relaxed">
          I confirm I represent this business and agree to the Hey Lola Business Terms and Privacy Policy. The Verified badge will appear only after the Hey Lola team reviews and approves the application.
        </span>
      </label>
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 col-span-1">{label}</p>
      <p className="text-sm text-charcoal/90 font-light leading-relaxed col-span-2 whitespace-pre-line">{value}</p>
    </div>
  );
}
