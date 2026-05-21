import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Heart, PawPrint, Store, Sparkles, Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FormField, FormSelect } from './FormField';

type Step =
  | 'pick'
  | 'pet_parent'
  | 'animal_lover'
  | 'venue'
  | 'success_pet_parent'
  | 'success_animal_lover'
  | 'success_venue';

interface StartProps {
  onBack?: () => void;
  onExplore?: () => void;
}

const ANIMAL_LOVER_INTERESTS = [
  'Pet-friendly places',
  'Events',
  'Adoption & rescue',
  'Perks',
  'Travel',
];

const VENUE_CATEGORIES = [
  'Restaurant',
  'Café',
  'Hotel',
  'Store',
  'Groomer',
  'Vet',
  'Coworking',
  'Real estate',
  'Other',
] as const;

export const Start: React.FC<StartProps> = ({ onBack, onExplore }) => {
  const [step, setStep] = useState<Step>('pick');

  const goBackToPicker = () => setStep('pick');

  return (
    <div className="min-h-screen bg-stone-50/60 text-charcoal font-boutique pt-12 pb-10 px-5 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {step !== 'pick' && (
          <button
            onClick={
              step.startsWith('success_')
                ? () => setStep('pick')
                : goBackToPicker
            }
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        {step === 'pick' && onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === 'pick' && (
            <motion.div
              key="pick"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 md:space-y-6"
            >
              <header className="text-center space-y-5 max-w-2xl mx-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">
                  Join Hey Lola
                </span>
                <h1 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-[0.95]">
                  Join the Hey Lola pet-friendly network
                </h1>
                <p className="text-base sm:text-lg text-stone-500 font-light italic leading-relaxed">
                  For pet parents, animal lovers, and trusted pet-friendly places.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                <AudienceCard
                  icon={<PawPrint size={20} />}
                  title="Pet Parent"
                  description="Manage your pet-friendly life, discover trusted places, and access early perks."
                  cta="Join as Pet Parent"
                  onClick={() => setStep('pet_parent')}
                />
                <AudienceCard
                  icon={<Heart size={20} />}
                  title="Animal Lover"
                  description="You don't need to have a pet to be part of Hey Lola. Join the community, discover places, support animal-friendly experiences, and access updates."
                  cta="Join as Animal Lover"
                  onClick={() => setStep('animal_lover')}
                />
                <AudienceCard
                  icon={<Store size={20} />}
                  title="Venue / Business"
                  description="Claim your profile, get discovered by pet parents and animal lovers, and offer perks to the Hey Lola community."
                  cta="Claim My Venue"
                  onClick={() => setStep('venue')}
                />
              </div>
            </motion.div>
          )}

          {step === 'pet_parent' && (
            <PetParentForm
              key="pet_parent"
              onSuccess={() => setStep('success_pet_parent')}
            />
          )}

          {step === 'animal_lover' && (
            <AnimalLoverForm
              key="animal_lover"
              onSuccess={() => setStep('success_animal_lover')}
            />
          )}

          {step === 'venue' && (
            <VenueForm
              key="venue"
              onSuccess={() => setStep('success_venue')}
            />
          )}

          {step === 'success_pet_parent' && (
            <SuccessPanel
              key="s_pp"
              title="Welcome to Hey Lola"
              message="We're building your trusted pet-friendly community, starting with Miami, New York and Barcelona."
              onExplore={onExplore}
              onDone={() => setStep('pick')}
            />
          )}
          {step === 'success_animal_lover' && (
            <SuccessPanel
              key="s_al"
              title="Welcome to the community"
              message="You don't need to have a pet to be part of Hey Lola."
              onExplore={onExplore}
              onDone={() => setStep('pick')}
            />
          )}
          {step === 'success_venue' && (
            <SuccessPanel
              key="s_v"
              title="Thank you"
              message="Our team will review your venue and contact you to confirm your Hey Lola profile."
              onExplore={onExplore}
              onDone={() => setStep('pick')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ----- Audience picker card -----

const AudienceCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}> = ({ icon, title, description, cta, onClick }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="group text-left bg-white rounded-[2rem] border border-stone-100 shadow-soft p-7 sm:p-8 flex flex-col gap-6 hover:shadow-xl hover:border-stone-200 transition-all"
  >
    <div className="w-11 h-11 rounded-2xl bg-stone-50 flex items-center justify-center text-charcoal/70 group-hover:bg-charcoal group-hover:text-white transition-colors">
      {icon}
    </div>
    <div className="space-y-3 flex-1">
      <h3 className="text-2xl font-serif italic tracking-tight leading-tight">{title}</h3>
      <p className="text-sm text-stone-500 font-light leading-relaxed">{description}</p>
    </div>
    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-charcoal/80 group-hover:text-charcoal">
      {cta}
      <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
    </span>
  </motion.button>
);

// ----- Form shell -----

const FormShell: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="max-w-xl mx-auto bg-white rounded-[2rem] border border-stone-100 shadow-soft p-7 sm:p-6 space-y-8"
  >
    <div className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">
        Join Hey Lola
      </span>
      <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-tight">{title}</h2>
      <p className="text-sm text-stone-500 font-light italic">{subtitle}</p>
    </div>
    {children}
  </motion.div>
);

// ----- Pet Parent form -----

const PetParentForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    petName: '',
    petType: 'Dog' as 'Dog' | 'Cat' | 'Other',
    instagram: '',
    foundingClubInterest: 'Maybe' as 'Yes' | 'Maybe' | 'Not now',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!data.firstName || !data.lastName || !data.email || !data.city || !data.petName) {
      setError('Please fill in the required fields.');
      return;
    }
    setBusy(true);
    try {
      const docRef = await addDoc(collection(db, 'onboarding_submissions'), {
        type: 'pet_parent',
        status: 'new',
        source: 'website_start_page',
        createdAt: serverTimestamp(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        city: data.city.trim(),
        petName: data.petName.trim(),
        petType: data.petType,
        instagram: data.instagram.trim() || null,
        foundingClubInterest: data.foundingClubInterest,
      });
      void fetch('/api/notify-onboarding', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ submissionId: docRef.id }),
      }).catch(() => { /* email is best-effort */ });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not submit. Please try again.');
      setBusy(false);
    }
  };

  return (
    <FormShell
      title="Join as Pet Parent"
      subtitle="A few details and you're in."
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="First name" required value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} />
          <FormField label="Last name" required value={data.lastName} onChange={(e) => setData({ ...data, lastName: e.target.value })} />
        </div>
        <FormField label="Email" required type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
        <FormField label="City" required value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Pet name" required value={data.petName} onChange={(e) => setData({ ...data, petName: e.target.value })} />
          <FormSelect label="Pet type" value={data.petType} onChange={(e) => setData({ ...data, petType: e.target.value as any })}>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Other">Other</option>
          </FormSelect>
        </div>
        <FormField label="Instagram (optional)" value={data.instagram} onChange={(e) => setData({ ...data, instagram: e.target.value })} placeholder="@yourhandle" />
        <FormSelect label="Interested in Founding Club" value={data.foundingClubInterest} onChange={(e) => setData({ ...data, foundingClubInterest: e.target.value as any })}>
          <option value="Yes">Yes</option>
          <option value="Maybe">Maybe</option>
          <option value="Not now">Not now</option>
        </FormSelect>
        <SubmitButton busy={busy} label="Join Hey Lola" />
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </form>
    </FormShell>
  );
};

// ----- Animal Lover form -----

const AnimalLoverForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    instagram: '',
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!data.firstName || !data.lastName || !data.email || !data.city) {
      setError('Please fill in the required fields.');
      return;
    }
    setBusy(true);
    try {
      const docRef = await addDoc(collection(db, 'onboarding_submissions'), {
        type: 'animal_lover',
        status: 'new',
        source: 'website_start_page',
        createdAt: serverTimestamp(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        city: data.city.trim(),
        instagram: data.instagram.trim() || null,
        interests,
      });
      void fetch('/api/notify-onboarding', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ submissionId: docRef.id }),
      }).catch(() => { /* email is best-effort */ });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not submit. Please try again.');
      setBusy(false);
    }
  };

  return (
    <FormShell
      title="Join as Animal Lover"
      subtitle="No pet required. Just a soft spot for them."
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="First name" required value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} />
          <FormField label="Last name" required value={data.lastName} onChange={(e) => setData({ ...data, lastName: e.target.value })} />
        </div>
        <FormField label="Email" required type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
        <FormField label="City" required value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
        <FormField label="Instagram (optional)" value={data.instagram} onChange={(e) => setData({ ...data, instagram: e.target.value })} placeholder="@yourhandle" />

        <div className="space-y-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">Interests</span>
          <div className="flex flex-wrap gap-2">
            {ANIMAL_LOVER_INTERESTS.map((i) => {
              const active = interests.includes(i);
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={
                    'px-4 py-2 rounded-full text-xs font-bold border transition-all ' +
                    (active
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300')
                  }
                >
                  {i}
                </button>
              );
            })}
          </div>
        </div>

        <SubmitButton busy={busy} label="Join the community" />
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </form>
    </FormShell>
  );
};

// ----- Venue form -----

const VenueForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [data, setData] = useState({
    businessName: '',
    category: 'Restaurant' as typeof VENUE_CATEGORIES[number],
    city: '',
    address: '',
    website: '',
    instagram: '',
    contactPerson: '',
    role: '',
    email: '',
    phone: '',
    petFriendlyStatus: 'Indoors' as 'Indoors' | 'Outdoors' | 'Sometimes' | 'Not yet',
    perkInterest: 'Maybe' as 'Yes' | 'Maybe' | 'Tell me more',
    notes: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!data.businessName || !data.city || !data.address || !data.contactPerson || !data.email || !data.phone) {
      setError('Please fill in the required fields.');
      return;
    }
    setBusy(true);
    try {
      const docRef = await addDoc(collection(db, 'venue_claims'), {
        businessName: data.businessName.trim(),
        category: data.category,
        city: data.city.trim(),
        address: data.address.trim(),
        website: data.website.trim() || null,
        instagram: data.instagram.trim() || null,
        contactPerson: data.contactPerson.trim(),
        role: data.role.trim() || null,
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        petFriendlyStatus: data.petFriendlyStatus,
        perkInterest: data.perkInterest,
        notes: data.notes.trim() || null,
        claimStatus: 'claim_submitted',
        verificationStatus: 'pending_review',
        perkStatus: 'not_confirmed',
        source: 'website_start_page',
        createdAt: serverTimestamp(),
      });
      void fetch('/api/notify-venue-claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ claimId: docRef.id }),
      }).catch(() => { /* email is best-effort */ });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not submit. Please try again.');
      setBusy(false);
    }
  };

  return (
    <FormShell
      title="Claim your venue"
      subtitle="Tell us about your business. We'll review and get back to you."
    >
      <form onSubmit={submit} className="space-y-5">
        <FormField label="Business name" required value={data.businessName} onChange={(e) => setData({ ...data, businessName: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect label="Category" value={data.category} onChange={(e) => setData({ ...data, category: e.target.value as any })}>
            {VENUE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormSelect>
          <FormField label="City" required value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
        </div>
        <FormField label="Address" required value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Website" value={data.website} onChange={(e) => setData({ ...data, website: e.target.value })} placeholder="https://" />
          <FormField label="Instagram" value={data.instagram} onChange={(e) => setData({ ...data, instagram: e.target.value })} placeholder="@handle" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Contact person" required value={data.contactPerson} onChange={(e) => setData({ ...data, contactPerson: e.target.value })} />
          <FormField label="Role" value={data.role} onChange={(e) => setData({ ...data, role: e.target.value })} placeholder="Owner, manager…" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Email" required type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
          <FormField label="Phone / WhatsApp" required value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
        </div>
        <FormSelect label="Pet-friendly status" value={data.petFriendlyStatus} onChange={(e) => setData({ ...data, petFriendlyStatus: e.target.value as any })}>
          <option value="Indoors">Indoors</option>
          <option value="Outdoors">Outdoors</option>
          <option value="Sometimes">Sometimes</option>
          <option value="Not yet">Not yet</option>
        </FormSelect>
        <FormSelect label="Would you like to offer a perk?" value={data.perkInterest} onChange={(e) => setData({ ...data, perkInterest: e.target.value as any })}>
          <option value="Yes">Yes</option>
          <option value="Maybe">Maybe</option>
          <option value="Tell me more">Tell me more</option>
        </FormSelect>
        <FormField label="Notes" multiline value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} placeholder="Anything we should know…" />
        <SubmitButton busy={busy} label="Submit venue claim" />
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </form>
    </FormShell>
  );
};

// ----- Submit button -----

const SubmitButton: React.FC<{ busy: boolean; label: string }> = ({ busy, label }) => (
  <button
    type="submit"
    disabled={busy}
    className="w-full luxury-button-primary h-12 text-[10px] tracking-[0.25em] flex items-center justify-center gap-2 disabled:opacity-60"
  >
    {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
    {busy ? 'Submitting' : label}
  </button>
);

// ----- Success panel -----

const SuccessPanel: React.FC<{
  title: string;
  message: string;
  onExplore?: () => void;
  onDone: () => void;
}> = ({ title, message, onExplore, onDone }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="max-w-xl mx-auto bg-white rounded-[2rem] border border-stone-100 shadow-soft p-6 sm:p-8 text-center space-y-6"
  >
    <div className="w-14 h-14 mx-auto rounded-full bg-stone-50 flex items-center justify-center text-charcoal">
      <Check size={22} />
    </div>
    <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-tight">{title}</h2>
    <p className="text-base text-stone-500 font-light italic leading-relaxed max-w-md mx-auto">{message}</p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
      {onExplore && (
        <button
          onClick={onExplore}
          className="luxury-button-primary h-12 px-8 text-[10px] tracking-[0.25em]"
        >
          Explore Hey Lola
        </button>
      )}
      <button
        onClick={onDone}
        className="luxury-button-secondary h-12 px-8 text-[10px] tracking-[0.25em]"
      >
        Done
      </button>
    </div>
  </motion.div>
);
