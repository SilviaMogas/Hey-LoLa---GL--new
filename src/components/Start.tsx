import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Heart, PawPrint, Store, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FormField, FormSelect } from './FormField';
import { useTranslation } from '../lib/LanguageContext';

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

const ANIMAL_LOVER_INTEREST_KEYS = [
  'petFriendlyPlaces',
  'events',
  'adoptionRescue',
  'perks',
  'travel',
] as const;

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
  const { t } = useTranslation();
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
            <ArrowLeft size={14} /> {t.common.back}
          </button>
        )}
        {step === 'pick' && onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <ArrowLeft size={14} /> {t.common.back}
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
                  {t.start.joinHeyLola}
                </span>
                <h1 className="text-3xl sm:text-3xl md:text-4xl font-serif italic tracking-tight leading-[0.95]">
                  {t.start.joinNetwork}
                </h1>
                <p className="text-base sm:text-lg text-stone-500 font-light italic leading-relaxed">
                  {t.start.forPetParents}
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                <AudienceCard
                  icon={<PawPrint size={20} />}
                  title={t.start.petParent}
                  description={t.start.petParentDesc}
                  cta={t.start.joinAsPetParent}
                  onClick={() => setStep('pet_parent')}
                />
                <AudienceCard
                  icon={<Heart size={20} />}
                  title={t.start.animalLover}
                  description={t.start.animalLoverDesc}
                  cta={t.start.joinAsAnimalLover}
                  onClick={() => setStep('animal_lover')}
                />
                <AudienceCard
                  icon={<Store size={20} />}
                  title={t.start.venueBusiness}
                  description={t.start.venueDesc}
                  cta={t.start.claimMyVenue}
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
              title={t.start.welcomeTitle}
              message={t.start.welcomeMsg}
              onExplore={onExplore}
              onDone={() => setStep('pick')}
            />
          )}
          {step === 'success_animal_lover' && (
            <SuccessPanel
              key="s_al"
              title={t.start.welcomeCommunityTitle}
              message={t.start.welcomeCommunityMsg}
              onExplore={onExplore}
              onDone={() => setStep('pick')}
            />
          )}
          {step === 'success_venue' && (
            <SuccessPanel
              key="s_v"
              title={t.start.thankYouTitle}
              message={t.start.thankYouMsg}
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
  kicker: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ kicker, title, subtitle, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="max-w-xl mx-auto bg-white rounded-[2rem] border border-stone-100 shadow-soft p-7 sm:p-6 space-y-8"
  >
    <div className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">
        {kicker}
      </span>
      <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight leading-tight">{title}</h2>
      <p className="text-sm text-stone-500 font-light italic">{subtitle}</p>
    </div>
    {children}
  </motion.div>
);

// ----- Pet Parent form -----

const PetParentForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { t } = useTranslation();
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
      setError(t.start.errorFillRequired);
      return;
    }
    setBusy(true);
    try {
      const { data: row } = await supabase.from('onboarding_submissions').insert({
        type: 'pet_parent',
        status: 'new',
        source: 'website_start_page',
        created_at: new Date().toISOString(),
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        city: data.city.trim(),
        pet_name: data.petName.trim(),
        pet_type: data.petType,
        instagram: data.instagram.trim() || null,
        founding_club_interest: data.foundingClubInterest,
      }).select('id').single();
      if (row) {
        void fetch('/api/notify-onboarding', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ submissionId: row.id }),
        }).catch(() => { /* email is best-effort */ });
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || t.start.errorSubmitFailed);
      setBusy(false);
    }
  };

  return (
    <FormShell
      kicker={t.start.joinHeyLola}
      title={t.start.joinAsPetParentTitle}
      subtitle={t.start.fewDetails}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t.start.firstName} required value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} />
          <FormField label={t.start.lastName} required value={data.lastName} onChange={(e) => setData({ ...data, lastName: e.target.value })} />
        </div>
        <FormField label={t.start.email} required type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
        <FormField label={t.start.city} required value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t.start.petName} required value={data.petName} onChange={(e) => setData({ ...data, petName: e.target.value })} />
          <FormSelect label={t.start.petType} value={data.petType} onChange={(e) => setData({ ...data, petType: e.target.value as any })}>
            <option value="Dog">{t.start.dog}</option>
            <option value="Cat">{t.start.cat}</option>
            <option value="Other">{t.start.other}</option>
          </FormSelect>
        </div>
        <FormField label={t.start.instagram} value={data.instagram} onChange={(e) => setData({ ...data, instagram: e.target.value })} placeholder="@yourhandle" />
        <FormSelect label={t.start.foundingClub} value={data.foundingClubInterest} onChange={(e) => setData({ ...data, foundingClubInterest: e.target.value as any })}>
          <option value="Yes">{t.start.yes}</option>
          <option value="Maybe">{t.start.maybe}</option>
          <option value="Not now">{t.start.notNow}</option>
        </FormSelect>
        <SubmitButton busy={busy} label={t.start.joinHeyLolaBtn} />
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </form>
    </FormShell>
  );
};

// ----- Animal Lover form -----

const AnimalLoverForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { t } = useTranslation();
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
      setError(t.start.errorFillRequired);
      return;
    }
    setBusy(true);
    try {
      const { data: row2 } = await supabase.from('onboarding_submissions').insert({
        type: 'animal_lover',
        status: 'new',
        source: 'website_start_page',
        created_at: new Date().toISOString(),
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        city: data.city.trim(),
        instagram: data.instagram.trim() || null,
        interests,
      }).select('id').single();
      if (row2) {
        void fetch('/api/notify-onboarding', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ submissionId: row2.id }),
        }).catch(() => { /* email is best-effort */ });
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || t.start.errorSubmitFailed);
      setBusy(false);
    }
  };

  const interestLabels: Record<string, string> = {
    petFriendlyPlaces: t.start.petFriendlyPlaces,
    events: t.start.events,
    adoptionRescue: t.start.adoptionRescue,
    perks: t.start.perks,
    travel: t.start.travel,
  };

  return (
    <FormShell
      kicker={t.start.joinHeyLola}
      title={t.start.joinAsAnimalLoverTitle}
      subtitle={t.start.noPetRequired}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t.start.firstName} required value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} />
          <FormField label={t.start.lastName} required value={data.lastName} onChange={(e) => setData({ ...data, lastName: e.target.value })} />
        </div>
        <FormField label={t.start.email} required type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
        <FormField label={t.start.city} required value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
        <FormField label={t.start.instagram} value={data.instagram} onChange={(e) => setData({ ...data, instagram: e.target.value })} placeholder="@yourhandle" />

        <div className="space-y-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">{t.start.interests}</span>
          <div className="flex flex-wrap gap-2">
            {ANIMAL_LOVER_INTEREST_KEYS.map((key) => {
              const label = interestLabels[key];
              const active = interests.includes(key);
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleInterest(key)}
                  className={
                    'px-4 py-2 rounded-full text-xs font-bold border transition-all ' +
                    (active
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300')
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <SubmitButton busy={busy} label={t.start.joinCommunity} />
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </form>
    </FormShell>
  );
};

// ----- Venue form -----

const VenueForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { t } = useTranslation();
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
      setError(t.start.errorFillRequired);
      return;
    }
    setBusy(true);
    try {
      const { data: row3 } = await supabase.from('venue_claims').insert({
        business_name: data.businessName.trim(),
        category: data.category,
        city: data.city.trim(),
        address: data.address.trim(),
        website: data.website.trim() || null,
        instagram: data.instagram.trim() || null,
        contact_person: data.contactPerson.trim(),
        role: data.role.trim() || null,
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        pet_friendly_status: data.petFriendlyStatus,
        perk_interest: data.perkInterest,
        notes: data.notes.trim() || null,
        claim_status: 'claim_submitted',
        verification_status: 'pending_review',
        perk_status: 'not_confirmed',
        source: 'website_start_page',
        created_at: new Date().toISOString(),
      }).select('id').single();
      if (row3) {
        void fetch('/api/notify-venue-claim', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ claimId: row3.id }),
        }).catch(() => { /* email is best-effort */ });
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || t.start.errorSubmitFailed);
      setBusy(false);
    }
  };

  const catLabels: Record<string, string> = {
    Restaurant: t.start.restaurant,
    'Café': t.start.cafe,
    Hotel: t.start.hotel,
    Store: t.start.store,
    Groomer: t.start.groomer,
    Vet: t.start.vet,
    Coworking: t.start.coworking,
    'Real estate': t.start.realEstate,
    Other: t.start.other,
  };

  return (
    <FormShell
      kicker={t.start.joinHeyLola}
      title={t.start.claimVenueTitle}
      subtitle={t.start.venueSubtitle}
    >
      <form onSubmit={submit} className="space-y-5">
        <FormField label={t.start.businessName} required value={data.businessName} onChange={(e) => setData({ ...data, businessName: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect label={t.start.category} value={data.category} onChange={(e) => setData({ ...data, category: e.target.value as any })}>
            {VENUE_CATEGORIES.map((c) => <option key={c} value={c}>{catLabels[c] || c}</option>)}
          </FormSelect>
          <FormField label={t.start.city} required value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
        </div>
        <FormField label={t.start.address} required value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t.start.website} value={data.website} onChange={(e) => setData({ ...data, website: e.target.value })} placeholder="https://" />
          <FormField label={t.start.instagram} value={data.instagram} onChange={(e) => setData({ ...data, instagram: e.target.value })} placeholder="@handle" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t.start.contactPerson} required value={data.contactPerson} onChange={(e) => setData({ ...data, contactPerson: e.target.value })} />
          <FormField label={t.start.role} value={data.role} onChange={(e) => setData({ ...data, role: e.target.value })} placeholder={t.start.rolePlaceholder} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t.start.email} required type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
          <FormField label={t.start.phoneWhatsApp} required value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
        </div>
        <FormSelect label={t.start.petFriendlyStatus} value={data.petFriendlyStatus} onChange={(e) => setData({ ...data, petFriendlyStatus: e.target.value as any })}>
          <option value="Indoors">{t.start.indoors}</option>
          <option value="Outdoors">{t.start.outdoors}</option>
          <option value="Sometimes">{t.start.sometimes}</option>
          <option value="Not yet">{t.start.notYet}</option>
        </FormSelect>
        <FormSelect label={t.start.offerPerk} value={data.perkInterest} onChange={(e) => setData({ ...data, perkInterest: e.target.value as any })}>
          <option value="Yes">{t.start.yes}</option>
          <option value="Maybe">{t.start.maybe}</option>
          <option value="Tell me more">{t.start.tellMeMore}</option>
        </FormSelect>
        <FormField label={t.start.notes} multiline value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} placeholder={t.start.notesPlaceholder} />
        <SubmitButton busy={busy} label={t.start.submitVenueClaim} />
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </form>
    </FormShell>
  );
};

// ----- Submit button -----

const SubmitButton: React.FC<{ busy: boolean; label: string }> = ({ busy, label }) => {
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full luxury-button-primary h-11 text-[10px] tracking-[0.25em] flex items-center justify-center gap-2 disabled:opacity-60"
    >
      {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      {busy ? t.common.submitting : label}
    </button>
  );
};

// ----- Success panel -----

const SuccessPanel: React.FC<{
  title: string;
  message: string;
  onExplore?: () => void;
  onDone: () => void;
}> = ({ title, message, onExplore, onDone }) => {
  const { t } = useTranslation();
  return (
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
          className="luxury-button-primary h-11 px-8 text-[10px] tracking-[0.25em]"
        >
          {t.start.exploreHeyLola}
        </button>
      )}
      <button
        onClick={onDone}
        className="luxury-button-secondary h-11 px-8 text-[10px] tracking-[0.25em]"
      >
        {t.common.done}
      </button>
    </div>
  </motion.div>
  );
};
