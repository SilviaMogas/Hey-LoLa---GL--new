import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, limit } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Heart, MapPin, Calendar, Compass, ShieldCheck, ChevronRight, User as UserIcon, Plus, MessageSquare, Loader2, ArrowRight, Plane, Home as HomeIcon, Pencil, Check, Camera, Sparkles, Coffee, Trees, Waves, Stethoscope, Bed, PartyPopper } from 'lucide-react';
import { UserProfile, PetData, Place } from '../types';
import { useTranslation } from '../lib/LanguageContext';
import { cn, compressDataUrl } from '../lib/utils';
import { DmInbox } from './DmInbox';
import { curatedPlaces } from '../data/curatedPlaces';
import { getTier } from '../lib/membership';
import { getMembershipDerived } from '../lib/levels';
import { setHandle, normalizeHandle, changesRemaining } from '../lib/handle';

interface DashboardProps {
  user: any;
  profile: UserProfile | null;
  pets: PetData[];
  onAddPet: () => void;
  onExplore: () => void;
  onConnectSupport?: () => void;
  initialShowProfile?: boolean;
  onProfileFormClose?: () => void;
  onOpenPet?: (index: number) => void;
  activePetIndex?: number;
  onOpenDm?: (otherUid: string, otherDisplayName: string, petName?: string) => void;
  onViewAllSaved?: () => void;
  isAdmin?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, profile, pets, onAddPet, onExplore, onConnectSupport, initialShowProfile, onProfileFormClose, onOpenPet, activePetIndex, onOpenDm, onViewAllSaved, isAdmin = false }) => {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localPets, setLocalPets] = useState<PetData[]>([]);
  const [petOwners, setPetOwners] = useState<Record<string, { name: string; photoURL: string }>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [handleError, setHandleError] = useState('');
  const [showForm, setShowForm] = useState(initialShowProfile || false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Sync external trigger (navbar "Profile" click) → form open state.
  useEffect(() => {
    if (initialShowProfile) setShowForm(true);
  }, [initialShowProfile]);

  const closeForm = () => {
    setShowForm(false);
    onProfileFormClose?.();
  };


  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Favorites — placeIds may point at Firestore docs OR at synthetic
        // `curated_<name>` ids (Explore renders the curated seed when a venue
        // hasn't been imported yet). Resolve from both sources.
        const favSnap = await getDocs(query(collection(db, 'favorites'), where('userId', '==', user.uid)));
        const favIds = favSnap.docs.map(doc => doc.data().placeId as string);
        if (favIds.length > 0) {
          const placesSnapshot = await getDocs(collection(db, 'places'));
          const dbPlaces = placesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Place[];
          const seedPlaces = curatedPlaces.map((cp) => ({
            ...cp,
            id: `curated_${cp.name.replace(/\s/g, '_')}`,
          })) as Place[];
          const allById = new Map<string, Place>();
          dbPlaces.forEach((p) => allById.set(p.id, p));
          seedPlaces.forEach((p) => { if (!allById.has(p.id)) allById.set(p.id, p); });
          const resolved = favIds
            .map((id) => allById.get(id))
            .filter((p): p is Place => Boolean(p));
          setFavorites(resolved);
        } else {
          setFavorites([]);
        }

        // Local community furrys — real public pet profiles from other users.
        // Priority: user's homeCity → Miami → any city.
        const userCity = (profile?.homeCity || '').toLowerCase();
        const petSnap = await getDocs(query(collection(db, 'pets'), where('isPublic', '==', true), limit(50)));
        const allPublic = petSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as PetData))
          .filter(p => !p.isHidden && p.userId !== user.uid);

        const matchCity = (city: string) => allPublic.filter(p => (p.city || '').toLowerCase() === city);
        let bucket: PetData[] = userCity ? matchCity(userCity) : [];
        if (bucket.length < 9) {
          const seen = new Set(bucket.map(p => p.id));
          for (const p of matchCity('miami')) {
            if (bucket.length >= 9) break;
            if (!seen.has(p.id)) { bucket.push(p); seen.add(p.id); }
          }
        }
        if (bucket.length < 9) {
          const seen = new Set(bucket.map(p => p.id));
          for (const p of allPublic) {
            if (bucket.length >= 9) break;
            if (!seen.has(p.id)) { bucket.push(p); seen.add(p.id); }
          }
        }
        const finalPets = bucket.slice(0, 9);
        setLocalPets(finalPets);

        // Resolve owner displayName + photo for the message button.
        const ownerUids = Array.from(new Set(finalPets.map(p => p.userId).filter(Boolean)));
        const owners: Record<string, { name: string; photoURL: string }> = {};
        await Promise.all(ownerUids.map(async (uid) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              const u = userDoc.data() as Partial<UserProfile>;
              const fallback = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
              owners[uid] = {
                name: u.displayName ?? (fallback || 'Member'),
                photoURL: u.photoURL ?? '',
              };
            }
          } catch (err) {
            // Reading other users may be forbidden by Firestore rules — keep
            // a silent fallback. Don't log the uid — it leaks identity in
            // shared browser sessions / screenshots.
            void err;
          }
        }));
        setPetOwners(owners);
      } catch (e) {
        console.error('Error fetching dashboard data', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (profile) {
      setNewFirstName(profile.firstName ?? '');
      setNewLastName(profile.lastName ?? '');
      setNewBio(profile.bio ?? '');
      setNewCity(profile.homeCity ?? '');
      setNewHandle(profile.username ?? '');
      // Mirror the Navbar fallback: when the Firestore profile has no photo
      // yet, fall back to the auth photoURL (e.g. Google sign-in avatar) so
      // the form preview always matches what the rest of the app shows.
      setNewPhotoURL(profile.photoURL || user?.photoURL || '');
    }
  }, [user, profile]);

  // Re-sync the form whenever it transitions to open. Without this any
  // unsaved local edits (e.g. an uploaded-but-not-saved photo) leak across
  // open/close cycles since useState keeps the previous value.
  useEffect(() => {
    if (!showForm || !profile) return;
    setNewFirstName(profile.firstName ?? '');
    setNewLastName(profile.lastName ?? '');
    setNewBio(profile.bio ?? '');
    setNewCity(profile.homeCity ?? '');
    setNewHandle(profile.username ?? '');
    setHandleError('');
    setNewPhotoURL(profile.photoURL || user?.photoURL || '');
  }, [showForm, profile, user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const original = reader.result as string;
      compressDataUrl(original, 384, 0.78)
        .then(setNewPhotoURL)
        .catch(() => setNewPhotoURL(original));
    };
    reader.readAsDataURL(file);
  };

  const persistProfile = async () => {
    const now = new Date().toISOString();
    const displayName = `${newFirstName} ${newLastName}`;
    await setDoc(doc(db, 'users', user.uid), {
      firstName: newFirstName,
      lastName: newLastName,
      displayName,
      bio: newBio,
      homeCity: newCity,
      photoURL: newPhotoURL,
      updatedAt: now,
    }, { merge: true });
    if (auth.currentUser) {
      // Firebase Auth's `photoURL` is hard-capped (~1024 chars) so a data
      // URL never fits. We persist the image only on Firestore and just
      // sync `displayName` (and external URLs) on the auth profile.
      const safePhotoURL = newPhotoURL && !newPhotoURL.startsWith('data:') ? newPhotoURL : undefined;
      await updateProfile(auth.currentUser, { displayName, photoURL: safePhotoURL });
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName) return;
    setIsUpdating(true);
    setHandleError('');
    (async () => {
      await persistProfile();
      const desired = normalizeHandle(newHandle);
      const current = (profile?.username || '').toLowerCase();
      if (desired && desired !== current) {
        const res = await setHandle({
          uid: user.uid,
          currentHandle: profile?.username,
          newHandle: desired,
          changedAt: profile?.usernameChangedAt,
          countAsChange: true,
        });
        if (!res.ok) { setHandleError(res.reason); return; }
      }
      closeForm();
    })()
      .catch((err) => {
        console.error('Failed to update profile', err);
        alert('Could not save your profile. Please try again.');
      })
      .finally(() => setIsUpdating(false));
  };

  const firstName = profile?.firstName || user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8 pb-10 animate-fade-in font-boutique">
      {/* Profile Editor / Completion */}
      <AnimatePresence>
        {showForm ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white border-4 border-stone-100 p-4 md:p-5 rounded-3xl shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-stone-50/40 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-4">
              <div className="space-y-1">
                <span className="text-stone-400 text-[10px] font-black uppercase tracking-[0.4em]">Profile Curation</span>
                <h3 className="text-2xl md:text-3xl font-serif italic tracking-tight text-charcoal/90 leading-tight">{t.dashboard.ownerDetails}</h3>
                <p className="text-sm text-stone-400 font-light italic">{t.dashboard.completeProfileDesc}</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl bg-stone-100 group flex items-center justify-center shrink-0"
                    aria-label="Upload profile photo"
                  >
                    {newPhotoURL ? (
                      <img src={newPhotoURL} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={28} className="text-stone-300" />
                    )}
                    <span className="absolute inset-0 bg-black/40 text-white text-[9px] font-black uppercase tracking-[0.2em] flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={18} /> Change
                    </span>
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Profile Photo</p>
                    <p className="text-xs text-stone-400 italic">Click the avatar to upload an image.</p>
                    {newPhotoURL && (
                      <button
                        type="button"
                        onClick={() => setNewPhotoURL('')}
                        className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-charcoal underline-offset-4 hover:underline"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase font-sans tracking-[0.2em] text-stone-300 ml-1">{t.dashboard.firstName}</label>
                    <input
                      type="text"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      placeholder="e.g. Silvia"
                      className="luxury-input h-11 w-full text-sm font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase font-sans tracking-[0.2em] text-stone-300 ml-1">{t.dashboard.lastName}</label>
                    <input
                      type="text"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      placeholder="e.g. Mogas"
                      className="luxury-input h-11 w-full text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase font-sans tracking-[0.2em] text-stone-300 ml-1">{t.dashboard.homeCityLabel}</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Barcelona"
                    className="luxury-input h-11 w-full text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase font-sans tracking-[0.2em] text-stone-300 ml-1">Handle</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">@</span>
                    <input
                      type="text"
                      value={newHandle}
                      onChange={(e) => { setNewHandle(normalizeHandle(e.target.value)); setHandleError(''); }}
                      placeholder="tu_handle"
                      maxLength={20}
                      className="luxury-input h-11 w-full text-sm font-medium pl-9"
                    />
                  </div>
                  {handleError ? (
                    <p className="text-[11px] text-red-500 ml-1">{handleError}</p>
                  ) : (
                    <p className="text-[11px] text-stone-400 ml-1">3-20 caracteres: letras, números o _. Te quedan {changesRemaining(profile?.usernameChangedAt)} cambios este mes.</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase font-sans tracking-[0.2em] text-stone-300 ml-1">{t.dashboard.aboutMe}</label>
                  <textarea
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder="Tell us about yourself and your furry friends..."
                    rows={3}
                    className="luxury-input p-4 h-24 resize-none w-full text-base font-medium"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 bg-charcoal text-white py-3 rounded-full font-black text-[11px] uppercase tracking-[0.25em] hover:bg-stone-800 hover:shadow-xl transition-all duration-300 disabled:opacity-50 shadow-md"
                  >
                    {isUpdating ? t.common.loading : t.common.save}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-8 py-3 border-2 border-stone-100 text-stone-400 rounded-full font-black text-[11px] uppercase tracking-[0.25em] hover:bg-stone-50 transition-all"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              </form>
              </div>

              <aside className="lg:col-span-1 space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Your dogs</h3>
                {pets.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No pets yet.</p>
                ) : (
                  pets.map((pet, i) => (
                    <button
                      key={pet.id || i}
                      type="button"
                      onClick={() => onOpenPet?.(i)}
                      className="w-full text-left bg-stone-50 hover:bg-stone-100 border border-stone-100 rounded-2xl p-3 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 flex items-center justify-center text-lg">
                        {pet.photoURL ? <img src={pet.photoURL} alt={pet.name} className="w-full h-full object-cover" /> : (pet.type === 'Cat' ? '🐈' : '🐕')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-charcoal text-sm truncate">{pet.name || 'Unnamed'}</p>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 truncate">{pet.breed || pet.type}</p>
                      </div>
                    </button>
                  ))
                )}
                <button
                  type="button"
                  onClick={onAddPet}
                  className="w-full text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-charcoal border-2 border-dashed border-stone-200 rounded-2xl py-3 transition-colors"
                >
                  + Add pet
                </button>
              </aside>
            </div>
          </motion.div>
        ) : !profile?.firstName && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-50 border border-stone-100 p-5 md:p-6 rounded-2xl shadow-soft relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-stone-100 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-5 text-charcoal">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <UserIcon size={22} />
                </div>
                <div>
                  <h4 className="font-serif italic text-xl tracking-tight text-charcoal/80">{t.dashboard.completeProfile}</h4>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-charcoal text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-md hover:bg-stone-800 transition-all duration-300 group flex items-center gap-2"
              >
                {t.common.getStarted} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet Lover No Pet CTA */}
      {profile?.onboardingStatus?.petLoverNoPet && pets.length === 0 && (
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-charcoal text-white p-5 md:p-7 rounded-2xl relative overflow-hidden group shadow-xl"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[160px] opacity-5 -mr-64 -mt-64" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/5 py-1 px-3 rounded-full text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
                  <Plus size={12} /> {t.dashboard.readyToExpand}
                </div>
                <h3 className="text-xl lg:text-2xl font-serif italic text-white/90 leading-tight">{t.dashboard.addPet}</h3>
                <p className="text-sm text-stone-400 font-light italic max-w-md">{t.dashboard.registerFirst}</p>
              </div>
              <button
                onClick={onAddPet}
                className="bg-white text-charcoal px-7 h-10 rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-md hover:bg-stone-100 transition-all duration-300 flex items-center gap-2"
              >
                {t.dashboard.addPet} <Plus size={14} />
              </button>
            </div>
          </motion.div>
      )}

      {/* Hero Greeting */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pt-2 pb-3 border-b border-stone-100">
         <div className="space-y-1.5">
           <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Welcome Back</span>
             {(() => {
               const tier = getTier(profile?.memberPlan, isAdmin);
               return (
                 <span className={cn(
                   'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.25em]',
                   tier.bgClass, tier.textClass,
                 )}>
                   <span className={cn('w-1.5 h-1.5 rounded-full', tier.dotClass)} />
                   {tier.label}
                 </span>
               );
             })()}
           </div>
           <h1 className="text-2xl md:text-3xl font-serif italic tracking-tight leading-tight text-charcoal">
              {t.dashboard.greeting} <span className="text-stone-300">{firstName}<span className="text-charcoal">.</span></span>
           </h1>
           <p className="text-sm md:text-base font-light text-stone-400 italic leading-snug">{t.dashboard.nextHeading}</p>
           <div className="pt-0.5"><StatusComposer userId={user?.uid} initialStatus={profile?.status} /></div>
           <p className="text-sm md:text-base font-light text-stone-400 italic leading-snug pt-2">What&apos;s on this week?</p>
           <div className="pt-0.5">
             <StatusComposer
               userId={user?.uid}
               initialStatus={profile?.whatsOn}
               field="whatsOn"
               presets={WHATS_ON_PRESETS}
               placeholder="e.g. Park day, brunch, vet visit…"
             />
           </div>
         </div>
         {profile?.firstName && (
           <button
            onClick={() => setShowForm(true)}
            className="bg-white border border-stone-100 px-4 py-2 rounded-2xl flex items-center gap-2.5 hover:border-stone-200 transition-all duration-300 group shadow-sm"
           >
             <div className="w-8 h-8 bg-stone-50/60 rounded-xl flex items-center justify-center">
                <UserIcon size={14} className="text-stone-400" />
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal mb-0.5">{t.dashboard.ownerDetails}</p>
                <p className="text-[8px] font-bold text-stone-300 uppercase tracking-[0.2em] leading-none">Settings</p>
             </div>
           </button>
         )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pets & Passport */}
        <div className="lg:col-span-8 space-y-5">
          {/* Pets Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
               <div className="flex items-center gap-4">
                 <div className="w-1.5 h-5 bg-stone-300 rounded-full" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">{t.dashboard.companions}</h3>
               </div>
               <button onClick={onAddPet} className="group luxury-button-secondary px-5 h-10 text-[10px]">
                  <Plus size={14} /> {t.dashboard.addPet}
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {pets.map((pet, i) => (
                 <motion.div
                   key={pet.id}
                   role="button"
                   tabIndex={0}
                   onClick={() => onOpenPet?.(i)}
                   onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenPet?.(i); } }}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   whileHover={{ y: -8, scale: 1.02 }}
                   className={cn(
                     "bg-white p-3 rounded-2xl border flex gap-3 items-center group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300",
                     activePetIndex === i ? 'border-charcoal' : 'border-stone-100 hover:border-stone-200'
                   )}
                 >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-50/60 shrink-0 border-2 border-white shadow-md">
                       <img src={pet.photoURL || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7'} alt={pet.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                       <h4 className="text-base font-serif italic tracking-tight text-charcoal/90 truncate">{pet.name}</h4>
                       <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-black uppercase font-sans tracking-[0.2em] text-stone-400">{pet.breed}</span>
                          <span className="px-2 py-0.5 bg-stone-50/60 rounded-full text-[8px] font-black uppercase font-sans tracking-[0.2em] text-stone-400 border border-stone-100">
                             {pet.vaxStatus}
                          </span>
                       </div>
                    </div>
                    <div className="text-stone-300 group-hover:text-charcoal transition-colors">
                       <ChevronRight size={20} />
                    </div>
                 </motion.div>
               ))}
               {pets.length === 0 && (
                 <div onClick={onAddPet} className="col-span-full py-10 border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-stone-300 group hover:border-stone-200 cursor-pointer transition-all duration-300">
                    <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center group-hover:text-charcoal transition-all duration-300">
                      <Plus size={22} />
                    </div>
                    <p className="font-serif italic text-base tracking-tight text-stone-400 group-hover:text-charcoal transition-colors">{t.dashboard.registerFirst}</p>
                 </div>
               )}
            </div>
          </section>

          {/* DM Inbox */}
          <DmInbox
            meUid={user?.uid}
            onOpenThread={(otherUid, otherName, _otherPhoto, contextPet) =>
              onOpenDm?.(otherUid, otherName, contextPet)
            }
          />

          {/* Community Furrys — real public pet profiles from other users */}
          {localPets.length > 0 && (
            <section className="space-y-4">
               <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-5 bg-stone-300 rounded-full" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">
                      Community Furrys{newCity ? ` • ${newCity}` : ''}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] bg-white px-3 py-1.5 rounded-full border border-stone-100">
                     <div className="w-1.5 h-1.5 bg-charcoal rounded-full animate-pulse" /> Real Members
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {localPets.map((pet, i) => (
                    <motion.div
                      key={pet.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white rounded-2xl overflow-hidden group flex flex-col border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                       <div className="aspect-square relative overflow-hidden bg-stone-50/60">
                          <img
                            src={pet.photoURL || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=400&q=80'}
                            alt={pet.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                       </div>
                       <div className="p-3 space-y-2 flex-1 flex flex-col">
                          <div className="space-y-0.5">
                             <h4 className="text-base font-serif italic tracking-tight text-charcoal/90">{pet.name}</h4>
                             <span className="text-[9px] font-black uppercase font-sans tracking-[0.2em] text-stone-400">{pet.breed || pet.type}</span>
                          </div>

                          {pet.hobbies && (
                             <p className="text-sm text-stone-500 font-light italic leading-snug tracking-tight line-clamp-2">"{pet.hobbies}"</p>
                          )}

                          <div className="pt-2 mt-auto">
                             <button
                               disabled={!onOpenDm || !pet.userId}
                               onClick={() => {
                                 if (!onOpenDm || !pet.userId) return;
                                 const owner = petOwners[pet.userId];
                                 onOpenDm(pet.userId, owner?.name || pet.name + "'s parent", pet.name);
                               }}
                               className="luxury-button-secondary w-full h-10 text-[9px] tracking-[0.2em] shadow-sm border-stone-100 disabled:opacity-40"
                             >
                                <MessageSquare size={12} /> Send a message
                             </button>
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </section>
          )}
        </div>

        {/* Right: Favorites & Profile */}
        <div className="lg:col-span-4 space-y-5">
          {/* Favorites */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-5 bg-stone-300 rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">
                  {t.dashboard.savedSpots}{favorites.length > 0 ? ` · ${favorites.length}` : ''}
                </h3>
              </div>
              {favorites.length > 0 && onViewAllSaved && (
                <button
                  onClick={onViewAllSaved}
                  className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-charcoal transition-colors"
                >
                  View all
                </button>
              )}
            </div>

            {loading ? (
               <div className="py-8 text-center"><Loader2 className="animate-spin text-charcoal mx-auto" /></div>
            ) : favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.map((fav, i) => (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white p-3 rounded-xl border border-stone-100 flex gap-3 items-center group hover:border-stone-200 transition-all cursor-pointer shadow-sm hover:shadow-md duration-300"
                  >
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white shadow-sm">
                        <img src={fav.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b'} alt={fav.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h5 className="font-serif italic text-base text-charcoal/90 truncate tracking-tight">{fav.name}</h5>
                        <p className="text-[9px] text-stone-400 truncate uppercase font-sans tracking-[0.2em]">{fav.city} • {fav.category}</p>
                      </div>
                      <Heart size={14} className="text-stone-300 fill-stone-300 mr-1" />
                  </motion.div>
                ))}
                <button onClick={onExplore} className="w-full py-3 text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 hover:text-charcoal transition-all italic border-2 border-dashed border-stone-100 rounded-xl hover:border-stone-200 duration-300 mt-2">
                    Explore New Gems
                </button>
              </div>
            ) : (
                <div className="bg-white border border-stone-100 p-6 rounded-2xl text-center space-y-3 shadow-sm">
                   <div className="w-12 h-12 bg-stone-50/60 rounded-xl flex items-center justify-center mx-auto text-stone-300">
                      <Heart size={20} />
                   </div>
                   <div className="space-y-2">
                    <p className="text-base font-light text-stone-400 italic leading-snug">{t.dashboard.noSpots}</p>
                    <button onClick={onExplore} className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal hover:tracking-[0.4em] transition-all">
                        Discover {profile?.homeCity?.trim() || 'new places'}
                    </button>
                   </div>
                </div>
            )}
          </section>

          {/* Insights — Verification, Member Level, Records, City Rewards, Next Best Action */}
          <InsightsSection profile={profile} pets={pets} isAdmin={isAdmin} user={user} onUpgrade={onAddPet} onExploreClick={onExplore} />
        </div>
      </div>
    </div>
  );
};

// ─── Insights ──────────────────────────────────────────────────
// Verification, Member Level, Records, City Rewards, Next Best Action.
// All derive from the same lib/levels.ts helper so dashboard logic
// stays in one place. Each card renders through <InsightCard> so the
// shape is defined once.

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  badgeLabel: string;
  badgeClass: string;
  /** Variant: 'default' = white card, 'hero' = charcoal, 'cta' = brand tinted. */
  variant?: 'default' | 'hero' | 'cta';
  progressPercent?: number;
  footer?: React.ReactNode;
}

function InsightCard({ icon, title, body, badgeLabel, badgeClass, variant = 'default', progressPercent, footer }: InsightCardProps) {
  const isHero = variant === 'hero';
  const isCta = variant === 'cta';
  return (
    <div className={cn(
      'p-4 rounded-2xl space-y-2.5 shadow-sm',
      isHero && 'bg-charcoal border border-white/5 shadow-md relative overflow-hidden',
      isCta && 'bg-brand-orange/5 border border-brand-orange/20',
      !isHero && !isCta && 'bg-white border border-stone-100',
    )}>
      <div className="flex items-center justify-between relative z-10">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center',
          isHero ? 'bg-white/5 text-white' : isCta ? 'bg-white text-brand-orange shadow-sm' : 'bg-stone-50/60 text-charcoal',
        )}>
          {icon}
        </div>
        <span className={cn('text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full', badgeClass)}>
          {badgeLabel}
        </span>
      </div>
      <div className="space-y-1 relative z-10">
        <h4 className={cn('text-base font-serif italic tracking-tight', isHero ? 'text-white/90' : 'text-charcoal')}>
          {title}
        </h4>
        <p className={cn('text-xs leading-snug italic font-light', isHero ? 'text-stone-400' : 'text-stone-500')}>
          {body}
        </p>
        {typeof progressPercent === 'number' && (
          <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-charcoal transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>
      {footer && <div className="relative z-10">{footer}</div>}
    </div>
  );
}

function InsightsSection({
  profile, pets, isAdmin, user, onUpgrade, onExploreClick,
}: {
  profile: UserProfile | null;
  pets: PetData[];
  isAdmin: boolean;
  user: any;
  onUpgrade: () => void;
  onExploreClick: () => void;
}) {
  const d = getMembershipDerived(profile, pets, isAdmin);
  const tier = getTier(profile?.memberPlan, isAdmin);
  const verifBadge: Record<string, string> = {
    'Verified': 'bg-emerald-50 text-emerald-700',
    'Pending verification': 'bg-amber-50 text-amber-700',
    'Needs update': 'bg-amber-50 text-amber-700',
    'Not verified': 'bg-stone-50 text-stone-500',
  };
  const cityHero = profile?.memberPlan && profile.memberPlan !== 'free'
    ? 'Rewards unlocking'
    : 'Unlock your local perks';

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4 border-b border-stone-100 pb-3">
        <div className="w-1.5 h-5 bg-stone-300 rounded-full" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Insights</h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {(
          [
            {
              icon: <ShieldCheck size={18} />,
              title: 'Verification Status',
              body: d.verificationCopy,
              badgeLabel: d.verification,
              badgeClass: verifBadge[d.verification] || 'bg-stone-50 text-stone-500',
            },
            {
              icon: <Sparkles size={18} />,
              title: 'Member Level',
              body: `You are ${d.level.badge}: ${d.level.label}. ${d.level.description}`,
              badgeLabel: d.level.badge,
              badgeClass: cn(tier.bgClass, tier.textClass),
            },
            {
              icon: <ShieldCheck size={18} />,
              title: 'Unlocking Records',
              body: d.recordsCopy,
              badgeLabel: `${d.recordsPercent}% complete`,
              badgeClass: 'bg-stone-50 text-stone-500',
              progressPercent: d.recordsPercent,
            },
            {
              icon: <Compass size={18} />,
              title: cityHero,
              body: d.cityRewardsCopy,
              badgeLabel: 'City Rewards',
              badgeClass: 'bg-white/10 text-white/40',
              variant: 'hero' as const,
            },
            {
              icon: <ArrowRight size={18} />,
              title: d.nextActionTitle,
              body: d.nextActionCopy,
              badgeLabel: 'Next step',
              badgeClass: 'text-brand-orange bg-transparent',
              variant: 'cta' as const,
              footer: (
                <button
                  onClick={pets.length === 0 ? onUpgrade : onExploreClick}
                  className="text-[10px] font-black uppercase tracking-[0.25em] text-charcoal hover:tracking-[0.3em] transition-all underline-offset-4 hover:underline"
                >
                  Take the next step →
                </button>
              ),
            },
          ] as InsightCardProps[]
        ).map((card) => <InsightCard key={card.title} {...card} />)}

        <MembershipCard profile={profile} user={user} />
      </div>
    </section>
  );
}

// ─── Membership card ──────────────────────────────────────────

const PLAN_LABEL: Record<string, string> = {
  free: 'Free',
  local: 'Local',
  plus: 'Travel',
  travel: 'Travel',
  black: 'Black',
};

function MembershipCard({ profile, user }: { profile: UserProfile | null; user: any }) {
  const memberPlan = profile?.memberPlan ?? 'free';
  const membership = profile?.membership;
  const isPaid = memberPlan !== 'free';
  const status = membership?.status;
  const renewsAt = membership?.renewsAt ? new Date(membership.renewsAt) : null;
  const trialEndsAt = membership?.trialEndsAt ? new Date(membership.trialEndsAt) : null;
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      setCheckoutSuccess(true);
      params.delete('checkout');
      const newSearch = params.toString();
      window.history.replaceState({}, '', newSearch ? `?${newSearch}` : window.location.pathname);
    }
  }, []);

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-100 space-y-3 shadow-sm">
      {checkoutSuccess && (
        <div className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-2 rounded-xl">
          Welcome! Your free trial has started. Enjoy your perks.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-stone-50/60 rounded-xl flex items-center justify-center text-charcoal">
          <Sparkles size={18} />
        </div>
        <span className={cn(
          "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full",
          isPaid ? 'bg-charcoal text-white' : 'bg-stone-50 text-stone-500',
        )}>
          {PLAN_LABEL[memberPlan] || 'Free'}
        </span>
      </div>
      <div className="space-y-1">
        <h4 className="text-lg font-serif italic tracking-tight">Membership</h4>
        {isPaid && status === 'on_trial' && trialEndsAt && (
          <p className="text-sm text-stone-400 leading-snug italic font-light">
            Free trial — billing starts {trialEndsAt.toLocaleDateString()}
          </p>
        )}
        {isPaid && status === 'active' && renewsAt && !membership?.cancelAtPeriodEnd && (
          <p className="text-sm text-stone-400 leading-snug italic font-light">
            Renews on {renewsAt.toLocaleDateString()}
          </p>
        )}
        {isPaid && status === 'active' && membership?.cancelAtPeriodEnd && renewsAt && (
          <p className="text-sm text-stone-400 leading-snug italic font-light">
            Cancels on {renewsAt.toLocaleDateString()}
          </p>
        )}
        {isPaid && (status === 'past_due' || status === 'unpaid') && (
          <p className="text-sm text-amber-700 leading-snug italic font-light">
            Payment issue — update your card to keep your perks.
          </p>
        )}
        {isPaid && status === 'cancelled' && (
          <p className="text-sm text-stone-400 leading-snug italic font-light">
            Cancelled — perks remain until {membership?.endsAt ? new Date(membership.endsAt).toLocaleDateString() : 'period end'}.
          </p>
        )}
        {!isPaid && (
          <p className="text-sm text-stone-400 leading-snug italic font-light">
            Free plan. Unlock perks with Local, Travel or Black.
          </p>
        )}
      </div>
      {isPaid && membership?.customerPortalUrl && (
        <a
          href={membership.customerPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-stone-500 hover:text-charcoal underline-offset-4 hover:underline"
        >
          Manage subscription
        </a>
      )}
      {!isPaid && (
        <a
          href="/club"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-stone-500 hover:text-charcoal underline-offset-4 hover:underline"
        >
          Upgrade
        </a>
      )}
    </div>
  );
}

// ─── Status composer ──────────────────────────────────────────
// Quick-pick chips + free-text answer to "Where are you and your
// companions heading next?" — saves to users/{uid}.status

const STATUS_PRESETS = [
  { icon: Plane, label: 'Travelling' },
  { icon: HomeIcon, label: 'At home' },
  { icon: Compass, label: 'Planning a trip' },
];

const WHATS_ON_PRESETS = [
  { icon: Trees, label: 'Park day' },
  { icon: Coffee, label: 'Brunch' },
  { icon: Waves, label: 'Beach day' },
  { icon: Stethoscope, label: 'Vet visit' },
  { icon: Bed, label: 'Hotel stay' },
  { icon: PartyPopper, label: 'Dog event' },
];

interface StatusPreset {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}

interface StatusComposerProps {
  userId?: string;
  initialStatus?: string;
  /** Firestore field on users/{uid} to write to. Defaults to 'status'. */
  field?: 'status' | 'whatsOn';
  /** Quick-pick chips shown above the free-text input. */
  presets?: StatusPreset[];
  placeholder?: string;
}

function StatusComposer({ userId, initialStatus, field = 'status', presets = STATUS_PRESETS, placeholder }: StatusComposerProps) {
  const [status, setStatus] = useState(initialStatus || '');
  const [draft, setDraft] = useState(initialStatus || '');
  const [editing, setEditing] = useState(!initialStatus);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(initialStatus || '');
    setDraft(initialStatus || '');
  }, [initialStatus]);

  const save = async (value: string) => {
    if (!userId) return;
    const trimmed = value.trim();
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'users', userId),
        { [field]: trimmed, [`${field}UpdatedAt`]: new Date().toISOString() },
        { merge: true }
      );
      setStatus(trimmed);
      setDraft(trimmed);
      setEditing(false);
    } catch (err) {
      console.error('Failed to save status', err);
    } finally {
      setSaving(false);
    }
  };

  // Display mode: shows the saved status with an edit pencil
  if (!editing && status) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors max-w-full"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
        <span className="text-sm font-medium text-charcoal truncate">{status}</span>
        <Pencil size={12} className="text-stone-300 group-hover:text-charcoal transition-colors shrink-0" />
      </button>
    );
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Preset chips */}
      <div className="flex flex-wrap gap-2">
        {presets.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => save(label)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-[11px] font-medium text-charcoal hover:bg-stone-50 hover:border-stone-300 transition-colors disabled:opacity-40"
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Free-text input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(draft);
        }}
        className="flex items-center gap-2 max-w-md"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 80))}
          placeholder={placeholder ?? 'Or write your own answer…'}
          className="flex-1 h-10 px-4 rounded-full bg-white border border-stone-200 text-sm placeholder:text-stone-300 focus:outline-none focus:border-charcoal focus:ring-2 focus:ring-stone-100 transition-colors"
          maxLength={80}
        />
        <button
          type="submit"
          disabled={saving || !draft.trim()}
          aria-label="Save status"
          className="w-10 h-10 rounded-full bg-charcoal text-white flex items-center justify-center hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-charcoal transition-colors shrink-0"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        </button>
        {status && (
          <button
            type="button"
            onClick={() => { setDraft(status); setEditing(false); }}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 hover:text-charcoal transition-colors px-2"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
