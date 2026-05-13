import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { paths } from '../lib/routes';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, PawPrint, ShieldCheck, Weight, Calendar, Info, Loader2, Camera, X, MapPin } from 'lucide-react';
import { cn, compressDataUrl } from '../lib/utils';
import { DOG_BREEDS, CAT_BREEDS } from '../data/breeds';
import { track } from '../lib/analytics';
import { SUPPORTED_COUNTRIES, validateMicrochip, type SupportedCountry } from '../lib/microchip';
import { applicableVaccines } from '../lib/vaccines';

import { PetData, Activity } from '../types';
import { useTranslation } from '../lib/LanguageContext';

interface OnboardingProps {
  userId: string;
  userName?: string;
  profile: any;
  onComplete: () => void;
  onBack?: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ userId, userName, profile, onComplete, onBack }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [ petData, setPetData ] = useState<Partial<PetData>>({
    name: '',
    type: 'Dog',
    breed: '',
    birthDate: '',
    currentWeight: { value: '', date: new Date().toISOString().split('T')[0] },
    weightHistory: [],
    vaccinations: [],
    vaxStatus: 'Verified',
    specialNeeds: '',
    photoURL: '',
    countryOfBirth: '',
    residenceCountry: '',
    travelHistory: [],
    microchipID: '',
    hobbies: ''
  });
  const [otherPetType, setOtherPetType] = useState('');

  const handlePetTypeSelection = (type: string) => {
    setPetData({ ...petData, type: type as any });
    if (type !== 'Other') setOtherPetType('');
    setStep(1);
  };

  const navigate = useNavigate();
  const [userProfileData, setUserProfileData] = useState({
    homeCity: profile?.homeCity || '',
    dreamDestination: profile?.dreamDestination || '',
    appIntents: (profile?.appIntents as string[]) || [] as string[],
    relationshipStatus: (profile?.relationshipStatus as string) || '',
  });
  const APP_INTENTS = [
    { id: 'community', label: 'Make dog-parent friends', emoji: '🐶' },
    { id: 'travel', label: 'Travel with my pet', emoji: '✈️' },
    { id: 'perks', label: 'Unlock venue perks', emoji: '🎁' },
    { id: 'dating', label: "Date — I'm single", emoji: '💛' },
    { id: 'discover', label: 'Discover dog-friendly spots', emoji: '📍' },
    { id: 'records', label: 'Manage records & vaccines', emoji: '🛡️' },
  ];
  const ACTIVITY_OPTIONS: Array<{ id: Activity; label: string; emoji: string }> = [
    { id: 'parks',    label: 'Parks',    emoji: '🌳' },
    { id: 'beach',    label: 'Beach',    emoji: '🏖️' },
    { id: 'hiking',   label: 'Hiking',   emoji: '🥾' },
    { id: 'swimming', label: 'Swimming', emoji: '🏊' },
    { id: 'cafes',    label: 'Cafés',    emoji: '☕' },
    { id: 'travel',   label: 'Travel',   emoji: '✈️' },
    { id: 'boarding', label: 'Boarding', emoji: '🏠' },
    { id: 'daycare',  label: 'Daycare',  emoji: '🎾' },
    { id: 'training', label: 'Training', emoji: '🦴' },
    { id: 'rural',    label: 'Rural',    emoji: '🌲' },
    { id: 'urban',    label: 'Urban',    emoji: '🏙️' },
    { id: 'dating',   label: 'Doggie dates', emoji: '💕' },
  ];
  const toggleIntent = (id: string) => {
    setUserProfileData((p) => ({
      ...p,
      appIntents: p.appIntents.includes(id) ? p.appIntents.filter((x) => x !== id) : [...p.appIntents, id],
    }));
  };
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (isPetLover = false) => {
    setLoading(true);
    try {
      const finalPetType = petData.type === 'Other' ? (otherPetType || 'Other') : petData.type;
      
      if (!isPetLover) {
        // Save Pet
        await addDoc(collection(db, 'pets'), {
          ...petData,
          type: finalPetType,
          userId,
          createdAt: new Date().toISOString()
        });
      }

      // Update User Profile — only write profile fields that are non-empty so we
      // don't overwrite an existing homeCity / dreamDestination with blanks when
      // the user adds a second pet without going through step 6 again.
      const profilePatch: Record<string, string | string[]> = {};
      if (userProfileData.homeCity) profilePatch.homeCity = userProfileData.homeCity;
      if (userProfileData.dreamDestination) profilePatch.dreamDestination = userProfileData.dreamDestination;
      if (userProfileData.appIntents.length) profilePatch.appIntents = userProfileData.appIntents;
      if (userProfileData.relationshipStatus) profilePatch.relationshipStatus = userProfileData.relationshipStatus;

      const userRef = doc(db, 'users', userId);
      const isFirstRun = !profile?.onboarded;
      await setDoc(userRef, {
        ...profilePatch,
        ...(isFirstRun
          ? {
              onboardingStep: 3,
              onboarded: true,
              onboardingStatus: {
                hasSelectedPetType: true,
                selectedPetType: isPetLover ? 'pet_lover_no_pet' : String(finalPetType).toLowerCase(),
                hasPet: !isPetLover,
                petLoverNoPet: isPetLover,
                updatedAt: new Date().toISOString()
              },
            }
          : {}),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      track('onboarding_completed', { hasPet: !isPetLover, petType: isPetLover ? 'none' : String(finalPetType) });
      if (!isPetLover) track('pet_created', { petType: String(finalPetType) });
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'pets/users');
    } finally {
      setLoading(false);
    }
  };

  const [showCustomBreed, setShowCustomBreed] = useState(false);
  const nextStep = async () => {
    const newStep = step + 1;
    setStep(newStep);

    // Only persist onboarding-step progress for the first-run flow. When the
    // user is adding an additional pet we don't want to rewind their finished
    // onboarding state.
    if (profile?.onboarded) return;
    try {
      await setDoc(doc(db, 'users', userId), {
        onboardingStep: newStep,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };
  const prevStep = () => {
    if (step === 0) {
      onBack?.();
    } else {
      setStep(prev => prev - 1);
    }
  };

  const currentBreedOptions = petData.type === 'Cat' ? CAT_BREEDS : DOG_BREEDS;
  const isCustomBreed = showCustomBreed || (petData.breed && !currentBreedOptions.includes(petData.breed || ''));

  const handleStep3BreedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Other') {
      setShowCustomBreed(true);
      setPetData({ ...petData, breed: '' });
    } else {
      setShowCustomBreed(false);
      setPetData({ ...petData, breed: val });
    }
  };

  const handlePetLoverOnboarding = () => {
    setPetData({ ...petData, type: 'pet_lover' as any });
    setStep(6); // Go to final profile questions
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const original = reader.result as string;
      compressDataUrl(original, 512, 0.8)
        .then((compressed) => {
          setPetData({ ...petData, photoURL: compressed });
          nextStep();
        })
        .catch(() => {
          setPetData({ ...petData, photoURL: original });
          nextStep();
        });
    };
    reader.readAsDataURL(file);
  };

  const nameForWelcome = profile?.firstName || userName?.split(' ')[0];

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 min-h-screen flex flex-col justify-center">
      {/* Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-stone-50 z-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(step / 6) * 100}%` }}
          className="h-full bg-charcoal"
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-6"
          >
            <div className="space-y-6">
               <button 
                 onClick={prevStep}
                 className="flex items-center justify-center gap-2 text-stone-300 hover:text-charcoal transition-colors font-black uppercase tracking-widest text-[10px] mx-auto mb-8 bg-stone-50 px-6 py-3 rounded-full border border-stone-100"
               >
                 <ArrowLeft size={14} /> {t.onboarding.goBack}
               </button>
               <h1 className="text-8xl font-black tracking-tighter leading-none">
                 {nameForWelcome ? (
                   <>{t.onboarding.welcome} <span className="text-stone-300">{nameForWelcome}<span className="text-brand-orange">.</span></span></>
                 ) : (
                   <>{t.onboarding.welcome}</>
                 )}
               </h1>
               <p className="text-2xl font-bold text-stone-400">{t.onboarding.subtitle}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <OnboardingCard 
                 icon="🐕" 
                 label={t.onboarding.dog} 
                 selected={petData.type === 'Dog'} 
                 onClick={() => handlePetTypeSelection('Dog')} 
               />
               <OnboardingCard 
                 icon="🐈" 
                 label={t.onboarding.cat} 
                 selected={petData.type === 'Cat'} 
                 onClick={() => handlePetTypeSelection('Cat')} 
               />
               <OnboardingCard 
                 icon="🐾" 
                 label={t.onboarding.other} 
                 selected={petData.type === 'Other'} 
                 onClick={() => handlePetTypeSelection('Other')} 
               />
               <button 
                onClick={handlePetLoverOnboarding}
                className={cn(
                  "p-8 rounded-2xl border-2 transition-all group flex flex-col items-center justify-center gap-4 text-center",
                  petData.type === 'pet_lover' ? 'border-charcoal bg-stone-50' : 'border-stone-100 bg-white hover:border-stone-100'
                )}
               >
                  <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <span className="text-2xl">✨</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-charcoal block">{t.onboarding.petLover}</span>
               </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              <h1 className="text-8xl font-black tracking-tighter leading-none">
                <span className="italic font-light text-stone-400">{t.dashboard.greeting}</span> <span className="text-charcoal">{userName?.split(" ")[0] || "there"}</span><span className="text-brand-orange">.</span>
              </h1>
              <p className="text-2xl font-bold text-stone-400">{t.onboarding.petNameSubtitle}</p>
            </div>
            
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-300">{t.onboarding.petNamePlaceholder}</label>
                <input 
                  type="text" 
                  placeholder="Lola, Taco, etc."
                  value={petData.name}
                  onChange={(e) => setPetData({...petData, name: e.target.value})}
                  className="w-full bg-transparent border-b-4 border-stone-100 text-3xl sm:text-3xl text-center font-black tracking-tighter outline-none p-4 focus:border-charcoal transition-colors"
                  autoFocus
                />
              </div>

              {petData.type === 'Other' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-300">What kind of adventurer is {petData.name || 'your pet'}?</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rabbit, Parrot..." 
                    value={otherPetType}
                    onChange={(e) => setOtherPetType(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-stone-100 text-3xl text-center font-black tracking-tighter outline-none p-4 focus:border-charcoal transition-colors italic"
                  />
                </div>
              )}
              
              <div className="flex gap-4">
                <button 
                  onClick={prevStep}
                  className="px-8 py-5 text-stone-400 font-bold border border-stone-100 rounded-2xl hover:bg-stone-50 transition-colors"
                >
                  <ArrowLeft size={22} />
                </button>
                <button 
                  onClick={nextStep}
                  disabled={!petData.name || (petData.type === 'Other' && !otherPetType)}
                  className="flex-1 bg-charcoal text-white py-6 rounded-3xl font-bold text-lg shadow-soft hover:shadow-xl transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                >
                  {t.onboarding.assemblePassport} <ArrowRight size={22} />
                </button>
              </div>
            </div>
          </motion.div>
        )}


        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center space-y-5"
          >
            <button
              onClick={prevStep}
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-charcoal transition-colors"
            >
              <ArrowLeft size={12} /> {t.onboarding.prev}
            </button>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter">{t.onboarding.snapTitle} <span className="text-charcoal">{petData.name}</span><span className="text-brand-orange">.</span></h1>
              <p className="text-sm font-bold text-stone-400">{t.onboarding.snapSubtitle}</p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-52 h-64 sm:w-56 sm:h-72 mx-auto bg-muted rounded-2xl border-4 border-dashed border-stone-100 flex flex-col items-center justify-center cursor-pointer hover:border-stone-200 transition-all group overflow-hidden relative"
            >
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
              {petData.photoURL ? (
                <img src={petData.photoURL} alt="Pet" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={36} className="text-stone-200 group-hover:text-charcoal transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 mt-3">{t.onboarding.uploadPhoto}</span>
                </>
              )}
            </div>

            <div className="flex gap-3 max-w-sm mx-auto">
              <button onClick={prevStep} className="flex-1 py-3 text-stone-400 font-bold border border-stone-100 rounded-2xl text-sm">{t.onboarding.prev}</button>
              <button onClick={nextStep} className="flex-1 py-3 bg-muted text-charcoal font-bold rounded-2xl shadow-soft text-sm">{t.onboarding.skip}</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter">{t.onboarding.identity}</h1>
              <p className="text-stone-400 uppercase tracking-widest text-xs font-black">{t.onboarding.identityDesc}</p>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-3xl shadow-xl border border-stone-50">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-stone-300 flex items-center gap-2">
                  <PawPrint size={14} /> {t.onboarding.breed}
                </label>
                <div className="space-y-2">
                  <select 
                    value={currentBreedOptions.includes(petData.breed || '') ? petData.breed : (isCustomBreed ? 'Other' : '')}
                    onChange={handleStep3BreedChange}
                    className="w-full bg-muted p-5 rounded-2xl text-sm font-bold border-none focus:ring-4 focus:ring-stone-100 outline-none appearance-none"
                  >
                    <option value="">{t.onboarding.selectBreed}</option>
                    {currentBreedOptions.map(b => <option key={b} value={b}>{b}</option>)}
                    <option value="Other">{t.onboarding.otherBreed}</option>
                  </select>
                  {isCustomBreed && (
                    <input 
                      type="text" 
                      value={petData.breed}
                      onChange={(e) => setPetData({...petData, breed: e.target.value})}
                      placeholder={t.onboarding.specifyBreed}
                      className="w-full bg-muted p-5 rounded-2xl text-sm font-bold border-none focus:ring-4 focus:ring-stone-100 outline-none"
                    />
                  )}
                </div>
              </div>
 
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-stone-300 flex items-center gap-2">
                  <Calendar size={14} /> {t.onboarding.dob}
                </label>
                <input 
                  type="date" 
                  value={petData.birthDate}
                  onChange={(e) => setPetData({...petData, birthDate: e.target.value})}
                  className="w-full bg-muted p-5 rounded-2xl text-sm font-bold border-none focus:ring-4 focus:ring-stone-100 outline-none"
                />
              </div>
 
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-stone-300 flex items-center gap-2">
                  <Weight size={14} /> Weight
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={petData.currentWeight?.value}
                    onChange={(e) => setPetData({
                      ...petData,
                      currentWeight: { ...petData.currentWeight!, value: e.target.value }
                    })}
                    placeholder={petData.currentWeight?.unit === 'lb' ? 'e.g. 27.5' : 'e.g. 12.5'}
                    className="flex-1 bg-muted p-5 rounded-2xl text-sm font-bold border-none focus:ring-4 focus:ring-stone-100 outline-none"
                  />
                  <div className="flex items-center gap-1 bg-stone-50 rounded-2xl p-1">
                    {(['kg', 'lb'] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setPetData({
                          ...petData,
                          currentWeight: { ...petData.currentWeight!, unit: u }
                        })}
                        className={cn(
                          'px-3 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors',
                          (petData.currentWeight?.unit ?? 'kg') === u
                            ? 'bg-charcoal text-white shadow-sm'
                            : 'text-stone-400 hover:text-charcoal'
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
 
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-stone-300 flex items-center gap-2">
                  <MapPin size={14} /> Country of Origin
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORTED_COUNTRIES.map((c) => {
                    const selected = petData.countryOfBirth === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setPetData({ ...petData, countryOfBirth: c.code })}
                        className={cn(
                          'flex items-center justify-center gap-2 p-3 rounded-2xl text-sm font-bold border transition-all',
                          selected
                            ? 'bg-charcoal text-white border-charcoal shadow-sm'
                            : 'bg-muted text-charcoal border-transparent hover:border-stone-200',
                        )}
                      >
                        <span className="text-base">{c.flag}</span> {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-stone-300 flex items-center gap-2">
                  <ShieldCheck size={14} /> {t.onboarding.microchip}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={petData.microchipID}
                  onChange={(e) => setPetData({...petData, microchipID: e.target.value})}
                  placeholder="ID Number…"
                  className="w-full bg-muted p-5 rounded-2xl text-sm font-bold border-none focus:ring-4 focus:ring-stone-100 outline-none"
                />
                {(() => {
                  const result = validateMicrochip(
                    petData.microchipID || '',
                    petData.countryOfBirth as SupportedCountry | undefined,
                  );
                  if (result.status === 'empty') return null;
                  const tone =
                    result.status === 'valid_match' ? 'text-emerald-600' :
                    result.status === 'manufacturer' ? 'text-stone-500' :
                    result.status === 'valid_other' ? 'text-amber-600' :
                    'text-red-500';
                  return (
                    <p className={cn('text-[11px] font-medium leading-snug px-1', tone)} aria-live="polite">
                      {result.message}
                    </p>
                  );
                })()}
              </div>
            </div>
 
            <div className="flex gap-4">
              <button onClick={prevStep} className="px-10 py-5 text-stone-400 font-bold">{t.onboarding.prev}</button>
              <button 
                onClick={nextStep}
                className="flex-1 bg-charcoal text-white py-6 rounded-3xl font-bold text-lg shadow-soft hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                {t.onboarding.assembleMedical} <ArrowRight size={22} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter">{t.onboarding.medical}</h1>
              <p className="text-stone-400 uppercase tracking-widest text-[11px] font-black">{t.onboarding.medicalDesc}</p>
            </div>

            <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xl border border-stone-50 space-y-5">
              {/* Smart suggestions — driven by country of birth + age */}
              {(() => {
                const country = petData.countryOfBirth as SupportedCountry | undefined;
                const suggested = applicableVaccines(country, petData.birthDate);
                if (!country || suggested.length === 0) return null;
                const recordedNames = new Set((petData.vaccinations || []).map((v) => v.name.toLowerCase()));
                return (
                  <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💡</span>
                      <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">Recommended for {SUPPORTED_COUNTRIES.find((c) => c.code === country)?.label}</p>
                    </div>
                    <ul className="space-y-2">
                      {suggested.map((v) => {
                        const already = recordedNames.has(v.name.toLowerCase());
                        const triggered = (v.triggeredBy ?? []).some((a) => (petData.activities ?? []).includes(a));
                        return (
                          <li key={v.id} className="flex items-start gap-2 text-xs">
                            <button
                              type="button"
                              disabled={already}
                              onClick={() => setPetData({
                                ...petData,
                                vaccinations: [
                                  ...(petData.vaccinations || []),
                                  { name: v.name, date: '', nextDueDate: '' },
                                ],
                              })}
                              className={cn(
                                'shrink-0 mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors',
                                already ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-300 hover:border-charcoal',
                              )}
                              aria-label={already ? `${v.name} already added` : `Add ${v.name}`}
                            >
                              {already ? '✓' : '+'}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-charcoal">{v.name}</span>
                                {v.required && <span className="text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">Required</span>}
                                {triggered && <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">Strongly suggested</span>}
                              </div>
                              <p className="text-[11px] text-stone-500 leading-snug italic">{v.description}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })()}

               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-black tracking-widest text-stone-300">{t.onboarding.vaccineList}</label>
                    <button
                      onClick={() => setPetData({
                        ...petData,
                        vaccinations: [...(petData.vaccinations || []), { name: '', date: '', nextDueDate: '' }]
                      })}
                      className="text-[10px] font-black uppercase tracking-widest text-charcoal hover:underline"
                    >
                      + {t.onboarding.addVaccine}
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4">
                    {petData.vaccinations?.map((vax, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-2xl relative">
                        <input 
                          placeholder={t.onboarding.vaccineName} 
                          value={vax.name}
                          onChange={(e) => {
                            const newVax = [...petData.vaccinations!];
                            newVax[idx].name = e.target.value;
                            setPetData({...petData, vaccinations: newVax});
                          }}
                          className="bg-transparent border-none text-xs font-bold outline-none"
                        />
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-black text-stone-300">{t.onboarding.date}</label>
                          <input 
                            type="date"
                            value={vax.date}
                            onChange={(e) => {
                              const newVax = [...petData.vaccinations!];
                              newVax[idx].date = e.target.value;
                              setPetData({...petData, vaccinations: newVax});
                            }}
                            className="bg-transparent border-none text-[10px] font-bold outline-none block w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-black text-stone-300">{t.onboarding.nextDue}</label>
                          <input 
                            type="date"
                            value={vax.nextDueDate}
                            onChange={(e) => {
                              const newVax = [...petData.vaccinations!];
                              newVax[idx].nextDueDate = e.target.value;
                              setPetData({...petData, vaccinations: newVax});
                            }}
                            className="bg-transparent border-none text-[10px] font-bold outline-none block w-full"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newVax = petData.vaccinations!.filter((_, i) => i !== idx);
                            setPetData({...petData, vaccinations: newVax});
                          }}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm text-stone-300 hover:text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {(!petData.vaccinations || petData.vaccinations.length === 0) && (
                      <div className="text-center py-8 text-stone-300 italic text-sm">{t.onboarding.noVaccines}</div>
                    )}
                  </div>
               </div>
 
               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-stone-300 flex items-center gap-2">
                    <ShieldCheck size={14} /> {t.onboarding.globalStatus}
                  </label>
                  <select 
                    value={petData.vaxStatus}
                    onChange={(e) => setPetData({...petData, vaxStatus: e.target.value})}
                    className="w-full bg-muted p-5 rounded-2xl text-sm font-bold border-none focus:ring-4 focus:ring-stone-100 outline-none appearance-none"
                  >
                    <option>Verified</option>
                    <option>Pending</option>
                    <option>N/A</option>
                  </select>
               </div>
            </div>
 
            <div className="flex gap-4">
              <button onClick={prevStep} className="px-10 py-5 text-stone-400 font-bold">{t.onboarding.prev}</button>
              <button 
                onClick={nextStep}
                className="flex-1 bg-charcoal text-white py-6 rounded-3xl font-bold text-lg shadow-soft hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                {t.onboarding.origins} <ArrowRight size={22} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter">{t.onboarding.lifestyle}</h1>
              <p className="text-stone-400 uppercase tracking-widest text-[11px] font-black">{t.onboarding.lifestyleDesc}</p>
            </div>

            <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-xl border border-stone-50 space-y-5">
              {/* Traveler toggle */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-stone-300">Does {petData.name || 'your pet'} travel?</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['yes', 'no'] as const).map((opt) => {
                    const isYes = opt === 'yes';
                    const selected = isYes
                      ? !!(petData.travelHistory?.length || petData.plannedDestinations?.length)
                      : !(petData.travelHistory?.length || petData.plannedDestinations?.length);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          if (!isYes) {
                            setPetData({ ...petData, travelHistory: [], plannedDestinations: [] });
                          } else if (!petData.travelHistory?.length) {
                            // Seed an empty visited-country slot so the next section appears
                            setPetData({ ...petData, travelHistory: [{ destination: '', date: '' }] });
                          }
                        }}
                        className={cn(
                          'px-4 py-3 rounded-2xl text-sm font-bold border transition-all',
                          selected
                            ? 'bg-charcoal text-white border-charcoal shadow-sm'
                            : 'bg-muted text-charcoal border-transparent hover:border-stone-200',
                        )}
                      >
                        {isYes ? '✈️ Yes, traveler' : '🏡 Mostly local'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visited countries */}
              {!!petData.travelHistory?.length && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-black tracking-widest text-stone-300">Countries visited</label>
                    <button
                      type="button"
                      onClick={() => setPetData({
                        ...petData,
                        travelHistory: [...(petData.travelHistory || []), { destination: '', date: '' }],
                      })}
                      className="text-[10px] font-black uppercase tracking-widest text-charcoal hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {petData.travelHistory.map((entry, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          value={entry.destination}
                          onChange={(e) => {
                            const next = [...(petData.travelHistory || [])];
                            next[idx] = { ...next[idx], destination: e.target.value };
                            setPetData({ ...petData, travelHistory: next });
                          }}
                          className="flex-1 bg-muted p-3 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-stone-200 outline-none"
                        >
                          <option value="">Select country…</option>
                          {SUPPORTED_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={2000}
                          max={new Date().getFullYear()}
                          placeholder="Year"
                          value={entry.date}
                          onChange={(e) => {
                            const next = [...(petData.travelHistory || [])];
                            next[idx] = { ...next[idx], date: e.target.value };
                            setPetData({ ...petData, travelHistory: next });
                          }}
                          className="w-24 bg-muted p-3 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-stone-200 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = (petData.travelHistory || []).filter((_, i) => i !== idx);
                            setPetData({ ...petData, travelHistory: next });
                          }}
                          className="w-8 h-8 rounded-full text-stone-300 hover:text-red-500 flex items-center justify-center"
                          aria-label="Remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Planned destinations */}
              {!!petData.travelHistory?.length && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-stone-300">Where to next?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUPPORTED_COUNTRIES.map((c) => {
                      const selected = (petData.plannedDestinations || []).includes(c.code);
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            const list = petData.plannedDestinations || [];
                            const next = selected ? list.filter((x) => x !== c.code) : [...list, c.code];
                            setPetData({ ...petData, plannedDestinations: next });
                          }}
                          className={cn(
                            'flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold border transition-all',
                            selected
                              ? 'bg-charcoal text-white border-charcoal shadow-sm'
                              : 'bg-muted text-charcoal border-transparent hover:border-stone-200',
                          )}
                        >
                          <span className="text-base">{c.flag}</span> {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activities */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-stone-300">What does {petData.name || 'your pet'} love?</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ACTIVITY_OPTIONS.map((a) => {
                    const selected = (petData.activities || []).includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          const list = petData.activities || [];
                          const next = selected ? list.filter((x) => x !== a.id) : [...list, a.id];
                          setPetData({ ...petData, activities: next });
                        }}
                        className={cn(
                          'flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all',
                          selected
                            ? 'bg-charcoal text-white border-charcoal shadow-sm'
                            : 'bg-muted text-charcoal border-transparent hover:border-stone-200',
                        )}
                      >
                        <span className="text-xl">{a.emoji}</span>
                        <span className="text-[10px] font-bold leading-none">{a.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special needs */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-stone-300 flex items-center gap-2">
                  <Info size={12} /> {t.onboarding.specialNeeds}
                </label>
                <textarea
                  value={petData.specialNeeds}
                  onChange={(e) => setPetData({...petData, specialNeeds: e.target.value})}
                  placeholder={t.onboarding.specialNeedsPlaceholder}
                  className="w-full bg-muted p-4 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-stone-200 outline-none h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={prevStep} className="px-8 py-4 text-stone-400 font-bold text-sm">{t.onboarding.prev}</button>
              <button
                onClick={nextStep}
                className="flex-1 bg-charcoal text-white py-4 rounded-3xl font-bold text-sm shadow-soft hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {t.onboarding.almostThere} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter">{t.onboarding.journey}</h1>
              <p className="text-stone-400 uppercase tracking-widest text-[11px] font-black">{t.onboarding.journeyDesc}</p>
            </div>

            <div className="grid grid-cols-1 gap-5 bg-white p-5 sm:p-7 rounded-3xl shadow-xl border border-stone-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OnboardingInput
                  icon={<MapPin size={14} />}
                  label={t.onboarding.cityFrom}
                  value={userProfileData.homeCity}
                  onChange={(v) => setUserProfileData({...userProfileData, homeCity: v})}
                  placeholder="e.g. Miami, Madrid, London..."
                />
                <OnboardingInput
                  icon={<ArrowRight size={14} />}
                  label={t.onboarding.travelTo}
                  value={userProfileData.dreamDestination}
                  onChange={(v) => setUserProfileData({...userProfileData, dreamDestination: v})}
                  placeholder="e.g. Tokyo, Swiss Alps, Tulum..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-stone-300">What are you looking for here?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {APP_INTENTS.map((it) => {
                    const selected = userProfileData.appIntents.includes(it.id);
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => toggleIntent(it.id)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold border transition-all text-left',
                          selected
                            ? 'bg-charcoal text-white border-charcoal shadow-sm'
                            : 'bg-muted text-charcoal border-transparent hover:border-stone-200',
                        )}
                      >
                        <span className="text-base shrink-0">{it.emoji}</span>
                        <span className="leading-snug">{it.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-stone-300">Relationship status (optional)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'single', label: 'Single' },
                    { id: 'taken', label: 'Taken' },
                    { id: 'prefer_not', label: 'Skip' },
                  ].map((opt) => {
                    const selected = userProfileData.relationshipStatus === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setUserProfileData({ ...userProfileData, relationshipStatus: selected ? '' : opt.id })}
                        className={cn(
                          'px-3 py-2.5 rounded-2xl text-xs font-bold border transition-all',
                          selected
                            ? 'bg-charcoal text-white border-charcoal shadow-sm'
                            : 'bg-muted text-charcoal border-transparent hover:border-stone-200',
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand-orange/10 to-amber-50 border border-brand-orange/30 rounded-3xl p-4 sm:p-5 flex items-center gap-4">
              <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white items-center justify-center text-2xl shrink-0 shadow-sm">✨</div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-black text-charcoal leading-tight">Unlock more: perks, travel & community</p>
                <p className="text-[11px] text-stone-500 italic leading-snug">Hey Lola Club gets you verified perks, member events and pet-friendly priority — from $6.99/mo.</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const isPetLover = petData.type === 'pet_lover' || (!petData.name && !petData.type);
                  await handleSubmit(isPetLover);
                  navigate(paths.club);
                }}
                disabled={loading}
                className="shrink-0 bg-charcoal text-white px-4 h-10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                Upgrade <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (step === 6 && (petData.type === 'pet_lover' || !petData.name)) {
                     setStep(0);
                  } else {
                    prevStep();
                  }
                }}
                className="px-8 py-4 text-stone-400 font-bold text-sm"
              >
                {t.onboarding.prev}
              </button>
              <button
                onClick={() => {
                  const isPetLover = petData.type === 'pet_lover' || (!petData.name && !petData.type);
                  handleSubmit(isPetLover);
                }}
                disabled={loading}
                className="flex-1 bg-charcoal text-white py-4 rounded-3xl font-bold text-sm hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>{t.onboarding.completePassport} <ShieldCheck size={16} /></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function OnboardingInput({ icon, label, value, onChange, placeholder }: { icon: React.ReactNode, label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] uppercase font-black tracking-widest text-stone-300 flex items-center gap-2">
        {icon} {label}
      </label>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted p-5 rounded-2xl text-sm font-bold border-none focus:ring-4 focus:ring-stone-100 outline-none transition-all placeholder:text-stone-300"
      />
    </div>
  );
}

function OnboardingCard({ icon, label, selected, onClick }: { icon: string, label: string, selected: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-6 rounded-2xl border-2 transition-all group flex flex-col items-center gap-6",
        selected ? 'border-charcoal bg-stone-50' : 'border-stone-100 hover:border-muted bg-white'
      )}
    >
      <div className={cn(
        "w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
        selected && "shadow-stone-300/10"
      )}>
        <span className="text-3xl">{icon}</span>
      </div>
      <span className="text-xs font-black uppercase tracking-widest text-charcoal">{label}</span>
    </button>
  );
}

