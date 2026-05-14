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
  MapPin,
  Globe,
  Layers,
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SEO } from '../lib/seo';

interface PartnerOnboardingProps {
  onBack: () => void;
  onComplete?: () => void;
}

type Category =
  // Places (physical venues)
  | 'restaurant'
  | 'cafe'
  | 'hotel'
  | 'vet'
  | 'groomer'
  | 'daycare'
  | 'trainer'
  | 'pet_shop'
  | 'experience'
  // E-commerce (sells physical products, often shipping worldwide)
  | 'food_nutrition'
  | 'apparel'
  | 'accessories'
  | 'toys_play'
  | 'wellness_products'
  | 'travel_gear'
  | 'online_store'
  | 'other';

const CATEGORIES: { id: Category; label: string; emoji: string; group: 'place' | 'ecommerce' }[] = [
  // Places
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️', group: 'place' },
  { id: 'cafe', label: 'Café', emoji: '☕', group: 'place' },
  { id: 'hotel', label: 'Hotel', emoji: '🛎️', group: 'place' },
  { id: 'vet', label: 'Veterinary', emoji: '🩺', group: 'place' },
  { id: 'groomer', label: 'Groomer', emoji: '✂️', group: 'place' },
  { id: 'daycare', label: 'Daycare', emoji: '🏡', group: 'place' },
  { id: 'trainer', label: 'Trainer', emoji: '🎓', group: 'place' },
  { id: 'pet_shop', label: 'Pet Shop', emoji: '🛍️', group: 'place' },
  { id: 'experience', label: 'Experience', emoji: '✨', group: 'place' },
  // E-commerce
  { id: 'food_nutrition', label: 'Food & Nutrition', emoji: '🥩', group: 'ecommerce' },
  { id: 'apparel', label: 'Apparel & Clothing', emoji: '👕', group: 'ecommerce' },
  { id: 'accessories', label: 'Accessories', emoji: '🎀', group: 'ecommerce' },
  { id: 'toys_play', label: 'Toys & Play', emoji: '🧸', group: 'ecommerce' },
  { id: 'wellness_products', label: 'Wellness & Supplements', emoji: '🌿', group: 'ecommerce' },
  { id: 'travel_gear', label: 'Travel Gear', emoji: '🧳', group: 'ecommerce' },
  { id: 'online_store', label: 'Online Store', emoji: '🛒', group: 'ecommerce' },
  // Catch-all
  { id: 'other', label: 'Other', emoji: '🐾', group: 'place' },
];

type City = 'miami' | 'nyc' | 'barcelona' | 'global_online' | 'other';
const CITIES: { id: City; label: string; status: 'live' | 'soon' | 'global' }[] = [
  { id: 'miami', label: 'Miami', status: 'live' },
  { id: 'nyc', label: 'New York City', status: 'soon' },
  { id: 'barcelona', label: 'Barcelona', status: 'soon' },
  { id: 'global_online', label: 'Global / Online', status: 'global' },
  { id: 'other', label: 'Other city', status: 'soon' },
];

type PerkType =
  | 'discount'
  | 'free_item'
  | 'priority_booking'
  | 'pet_friendly_experience'
  | 'loyalty_reward'
  | 'free_shipping'
  | 'welcome_bundle'
  | 'early_access'
  | 'free_consultation'
  | 'sample'
  | 'other';

const PERK_TYPES: { id: PerkType; label: string; description: string; emoji: string }[] = [
  { id: 'discount', label: 'Discount', description: '10% off the bill, percentage on services or products.', emoji: '🏷️' },
  { id: 'free_item', label: 'Welcome treat', description: 'Free dog biscuit, water bowl, welcome drink.', emoji: '🎁' },
  { id: 'priority_booking', label: 'Priority booking', description: 'Reserved table, fast-lane check-in, member-only slot.', emoji: '⭐' },
  { id: 'pet_friendly_experience', label: 'Dog-friendly experience', description: 'A signature moment — dog brunch, paw spa, evening run club.', emoji: '🐶' },
  { id: 'free_shipping', label: 'Free shipping', description: 'Complimentary shipping for Hey Lola members. Perfect for online stores.', emoji: '📦' },
  { id: 'welcome_bundle', label: 'Welcome bundle', description: 'A small gift bundle or starter pack with the first order.', emoji: '🎀' },
  { id: 'early_access', label: 'Early access', description: 'First look at new drops, launches or seasonal collections.', emoji: '⚡' },
  { id: 'free_consultation', label: 'Free consultation', description: 'Vets, trainers, groomers — a free intro session for members.', emoji: '🩺' },
  { id: 'sample', label: 'Free sample', description: 'A trial-size or sample with every order.', emoji: '🧪' },
  { id: 'loyalty_reward', label: 'Loyalty reward', description: 'Stamp card, 10th visit free, points on the house.', emoji: '💛' },
  { id: 'other', label: 'Other', description: 'Tell us what you would like to offer.', emoji: '✨' },
];

interface FeatureGroup { label: string; items: string[] }

const DOG_FRIENDLY_FEATURE_GROUPS: FeatureGroup[] = [
  {
    label: 'For everyone',
    items: [
      'Welcomes all dog sizes',
      'No breed restrictions',
      'Multi-pet friendly',
      'Locally owned',
      'Sustainable / eco-conscious',
    ],
  },
  {
    label: 'For places',
    items: [
      'Dogs allowed indoors',
      'Outdoor terrace welcomes dogs',
      'Water bowl on request',
      'Dog menu / treats available',
      'Dog beds / mats available',
      'Off-leash area',
    ],
  },
  {
    label: 'For online & products',
    items: [
      'Ships worldwide',
      'Free shipping option',
      'Subscription available',
      'Vet-recommended',
      'Hypoallergenic / sensitive-stomach',
      'Made specifically for dogs',
    ],
  },
];

const DOG_FRIENDLY_FEATURES = DOG_FRIENDLY_FEATURE_GROUPS.flatMap((g) => g.items);

type PartnerType = 'local' | 'online' | 'both';

const PARTNER_TYPE_OPTIONS: { id: PartnerType; label: string; description: string; icon: React.ComponentType<{ size?: number }> }[] = [
  {
    id: 'local',
    label: 'Local Partner',
    description: 'A physical venue in a Hey Lola city — café, restaurant, hotel, vet, groomer, daycare. Pins to the city map.',
    icon: MapPin,
  },
  {
    id: 'online',
    label: 'Online Partner',
    description: 'E-commerce or services that ship / operate worldwide — pet food, apparel, accessories, online classes.',
    icon: Globe,
  },
  {
    id: 'both',
    label: 'Local + Online',
    description: 'You have a venue in a city AND you ship or operate online. Listed in both directories.',
    icon: Layers,
  },
];

interface FormState {
  partnerType: PartnerType | null;
  businessName: string;
  categories: Category[];
  city: City;
  cityOther: string;
  address: string;
  shipsTo: string;
  storeUrl: string;
  website: string;
  instagram: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  features: string[];
  notes: string;
  offersPerk: boolean | null;
  perkTypes: PerkType[];
  perkDescription: string;
  perkConditions: string;
  perkAvailability: string;
  agree: boolean;
}

const STEPS = ['Type', 'Business', 'Contact', 'Perk', 'Review'] as const;
type Step = typeof STEPS[number];

const BREADCRUMBS = [
  { name: 'Hey Lola', item: '/' },
  { name: 'Partner Network', item: '/partners' },
  { name: 'Become a Partner', item: '/partners/onboard' },
];

export const PartnerOnboarding: React.FC<PartnerOnboardingProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState<Step>('Type');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    partnerType: null,
    businessName: '',
    categories: [],
    city: 'miami',
    cityOther: '',
    address: '',
    shipsTo: '',
    storeUrl: '',
    website: '',
    instagram: '',
    contactName: '',
    contactRole: '',
    email: '',
    phone: '',
    features: [],
    notes: '',
    offersPerk: null,
    perkTypes: [],
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

  const needsCity = form.partnerType === 'local' || form.partnerType === 'both';
  const needsOnline = form.partnerType === 'online' || form.partnerType === 'both';

  const isStepValid = useMemo(() => {
    if (step === 'Type') return form.partnerType !== null;
    if (step === 'Business') {
      const baseOk = form.businessName.trim().length > 1 && form.categories.length > 0;
      const cityOk = !needsCity || (form.city !== 'other' || form.cityOther.trim().length > 1);
      const onlineOk = !needsOnline || form.storeUrl.trim().length > 4;
      return baseOk && cityOk && onlineOk;
    }
    if (step === 'Contact') return form.contactName.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (step === 'Perk') return form.offersPerk === false || (form.offersPerk === true && form.perkTypes.length > 0 && form.perkDescription.trim().length > 3);
    if (step === 'Review') return form.agree;
    return false;
  }, [step, form, needsCity, needsOnline]);

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
      const docRef = await addDoc(collection(db, 'partner_applications'), {
        partnerType: form.partnerType,
        businessName: form.businessName,
        categories: form.categories,
        // Local
        city: needsCity ? (form.city === 'other' ? form.cityOther : form.city) : null,
        address: needsCity ? form.address : null,
        // Online
        storeUrl: needsOnline ? form.storeUrl : null,
        shipsTo: needsOnline ? form.shipsTo : null,
        // Common
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
              types: form.perkTypes,
              description: form.perkDescription,
              conditions: form.perkConditions,
              availability: form.perkAvailability,
            }
          : null,
        source: 'self_onboarding',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      // Fire-and-forget notification (confirmation to applicant + admin alert).
      // The endpoint re-reads the doc via the Admin SDK so it cannot be spoofed.
      void fetch('/api/notify-partner-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: docRef.id }),
      }).catch(() => { /* email is best-effort */ });
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
              { title: 'You verify', body: 'We confirm your contact email and check your business credentials.' },
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
        description="Self-onboard your dog-friendly business onto Hey Lola. Tell us about your business, choose the perk you offer to members, and our team will verify within 5 business days."
        url="/partners/onboard"
        breadcrumbs={BREADCRUMBS}
      />

      <header className="border-b border-stone-100 bg-stone-50/60">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-3 sm:py-4 space-y-2.5">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <ChevronLeft size={12} /> {stepIndex === 0 ? 'Back to Partners' : 'Previous'}
          </button>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Partner Network</span>
            <h1 id="partner-onboarding-heading" className="text-2xl sm:text-3xl font-serif italic tracking-tight leading-none">
              Become a Hey Lola Partner<span className="text-brand-orange">.</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-light italic leading-snug max-w-xl">
              Five short steps. Free to join. Verification takes up to 5 business days.
            </p>
          </div>

          <div aria-label="Onboarding progress" className="space-y-1.5 pt-1">
            <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-charcoal"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <ol className="grid grid-cols-5 gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-stone-400">
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

      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-5 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.section
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {step === 'Type' && <TypeStep form={form} update={update} />}
            {step === 'Business' && (
              <BusinessStep form={form} update={update} toggleCategory={(v) => toggleArray('categories', v)} needsCity={needsCity} needsOnline={needsOnline} />
            )}
            {step === 'Contact' && (
              <ContactStep form={form} update={update} toggleFeature={(v) => toggleArray('features', v)} needsCity={needsCity} />
            )}
            {step === 'Perk' && <PerkStep form={form} update={update} />}
            {step === 'Review' && <ReviewStep form={form} update={update} />}
          </motion.section>
        </AnimatePresence>

        {error && <p className="text-sm text-red-500 mt-6 text-center">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-stone-100 mt-6">
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
    <header className="space-y-1">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 inline-flex items-center gap-2">{icon}{kicker}</span>
      <h2 className="text-xl sm:text-2xl font-serif italic tracking-tight leading-tight">{title}<span className="text-brand-orange">.</span></h2>
      {description && <p className="text-xs sm:text-sm text-stone-500 font-light italic leading-snug max-w-xl">{description}</p>}
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

function TypeStep({ form, update }: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <>
      <SectionLabel
        icon={<Layers size={11} />}
        kicker="Step 1 — Partner type"
        title="How do dog parents meet you?"
        description="A single partner can be in both directories. Pick the option that matches your business."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PARTNER_TYPE_OPTIONS.map((opt) => {
          const active = form.partnerType === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => update('partnerType', opt.id)}
              className={`rounded-2xl border p-4 text-left flex items-start gap-3 transition-all ${active ? 'border-charcoal bg-stone-50' : 'border-stone-200 hover:border-charcoal'}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-charcoal text-white' : 'bg-stone-50 text-stone-400'}`}>
                <Icon size={15} />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <p className="text-sm font-serif italic text-charcoal">{opt.label}</p>
                <p className="text-[11px] text-stone-500 font-light italic leading-snug">{opt.description}</p>
              </div>
              {active && <Check size={13} className="text-charcoal mt-1 shrink-0" />}
            </button>
          );
        })}
      </div>
    </>
  );
}

function BusinessStep({ form, update, toggleCategory, needsCity, needsOnline }: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void; toggleCategory: (v: Category) => void; needsCity: boolean; needsOnline: boolean }) {
  const kicker = needsCity && needsOnline ? 'Step 2 — Business' : needsOnline ? 'Step 2 — Online business' : 'Step 2 — Local business';
  return (
    <>
      <SectionLabel
        icon={<Building2 size={11} />}
        kicker={kicker}
        title="Tell us about your business"
        description={needsCity && needsOnline ? 'We will list you in both the city directory and the online directory.' : needsOnline ? 'Stocked, shipped or served online. We will list you in the online perks directory.' : 'A physical venue in a Hey Lola city. We will pin you to the city map.'}
      />
      <Field label="Business name">
        <input type="text" required value={form.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="The Watering Bowl" className={inputClass} />
      </Field>
      <Field label="Category — pick one or more">
        <div className="space-y-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300 mb-2">Places</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.group === 'place').map((c) => {
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
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300 mb-2">E-commerce</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.group === 'ecommerce').map((c) => {
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
          </div>
        </div>
      </Field>
      {needsCity && (
        <>
          <Field label="City">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {CITIES.filter((c) => c.id !== 'global_online').map((c) => {
                const statusLabel = c.status === 'live' ? 'Live' : 'Coming soon';
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => update('city', c.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${form.city === c.id ? 'border-charcoal bg-stone-50' : 'border-stone-200 hover:border-charcoal'}`}
                  >
                    <p className="text-sm font-serif italic text-charcoal">{c.label}</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] mt-1 text-stone-400">{statusLabel}</p>
                  </button>
                );
              })}
            </div>
          </Field>
          {form.city === 'other' && (
            <Field label="Which city?">
              <input type="text" required value={form.cityOther} onChange={(e) => update('cityOther', e.target.value)} placeholder="Los Angeles, London, Lisbon…" className={inputClass} />
            </Field>
          )}
          <Field label="Address" optional>
            <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="200 SE 1st St, Miami, FL" className={inputClass} />
          </Field>
        </>
      )}
      {needsOnline && (
        <>
          <Field label="Online store / service URL">
            <input type="url" required value={form.storeUrl} onChange={(e) => update('storeUrl', e.target.value)} placeholder="https://wildbowl.co/shop" className={inputClass} />
          </Field>
          <Field label="Ships / serves" optional>
            <input type="text" value={form.shipsTo} onChange={(e) => update('shipsTo', e.target.value)} placeholder="Worldwide · US & EU · Europe only…" className={inputClass} />
          </Field>
        </>
      )}
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

function ContactStep({ form, update, toggleFeature, needsCity }: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void; toggleFeature: (v: string) => void; needsCity: boolean }) {
  const visibleGroups = needsCity ? DOG_FRIENDLY_FEATURE_GROUPS : DOG_FRIENDLY_FEATURE_GROUPS.filter((g) => g.label !== 'For places');
  return (
    <>
      <SectionLabel icon={<User size={11} />} kicker="Step 3 — Contact" title="Who's signing your business up" description="We'll only use this to verify and reach you about your application." />
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
        <div className="space-y-3">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300 mb-2">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((feat) => {
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
            </div>
          ))}
        </div>
      </Field>
      <Field label="Anything else we should know?" optional>
        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Peak hours, shipping notes, dog rules, what makes you different…" className="luxury-input p-4 h-28 w-full text-sm resize-none" />
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
          onClick={() => { update('offersPerk', false); update('perkTypes', []); }}
          className={`rounded-2xl border p-5 text-left transition-all ${form.offersPerk === false ? 'border-charcoal bg-stone-50' : 'border-stone-200 hover:border-charcoal'}`}
        >
          <p className="text-sm font-serif italic text-charcoal">Not now, maybe later</p>
          <p className="text-[11px] text-stone-500 font-light italic mt-1">You can add a perk after verification.</p>
        </button>
      </div>

      {form.offersPerk && (
        <>
          <Field label="Perk type — you can pick more than one">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERK_TYPES.map((p) => {
                const active = form.perkTypes.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? form.perkTypes.filter((x) => x !== p.id)
                        : [...form.perkTypes, p.id];
                      update('perkTypes', next);
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all relative ${active ? 'border-charcoal bg-stone-50' : 'border-stone-200 hover:border-charcoal'}`}
                  >
                    {active && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-charcoal text-white flex items-center justify-center" aria-hidden>
                        <Check size={11} />
                      </span>
                    )}
                    <p className="text-sm font-serif italic text-charcoal inline-flex items-center gap-2 pr-6">
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
  const perkLabel = form.perkTypes.length > 0
    ? form.perkTypes.map((id) => PERK_TYPES.find((p) => p.id === id)?.label ?? id).join(' · ')
    : null;

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
        {form.offersPerk && perkLabel && <ReviewRow label="Perk types" value={perkLabel} />}
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
