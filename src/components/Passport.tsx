import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetData, MemberPlan } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ShieldCheck, Calendar, Weight, PawPrint, Info, AlertCircle, MapPin, Edit2, Save, X, Camera, Loader2 } from 'lucide-react';
import { cn, compressDataUrl } from '../lib/utils';
import { getTier } from '../lib/membership';

interface PassportProps {
  petData: PetData;
  setPetData: (data: PetData) => void;
  ownerMemberPlan?: MemberPlan;
  ownerIsAdmin?: boolean;
}

export const Passport: React.FC<PassportProps> = ({ petData, setPetData, ownerMemberPlan, ownerIsAdmin = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedData, setEditedData] = useState<PetData>(() => ({
    name: '',
    type: 'Dog',
    breed: '',
    birthDate: '',
    vaxStatus: 'Verified',
    photoURL: '',
    userId: '',
    ...petData,
    currentWeight: petData?.currentWeight || { value: '', date: '' },
    weightHistory: petData?.weightHistory || [],
    vaccinations: petData?.vaccinations || [],
    travelHistory: petData?.travelHistory || [],
    plannedDestinations: petData?.plannedDestinations || [],
    activities: petData?.activities || [],
    countryOfBirth: petData?.countryOfBirth || '',
    residenceCountry: petData?.residenceCountry || '',
    microchipID: petData?.microchipID || '',
    hobbies: petData?.hobbies || '',
    specialNeeds: petData?.specialNeeds || '',
  }));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsEditing(false);
    setEditedData({
      name: '',
      type: 'Dog',
      breed: '',
      birthDate: '',
      vaxStatus: 'Verified',
      photoURL: '',
      userId: '',
      ...petData,
      currentWeight: petData?.currentWeight || { value: '', date: '' },
      weightHistory: petData?.weightHistory || [],
      vaccinations: petData?.vaccinations || [],
      travelHistory: petData?.travelHistory || [],
      plannedDestinations: petData?.plannedDestinations || [],
      activities: petData?.activities || [],
      countryOfBirth: petData?.countryOfBirth || '',
      residenceCountry: petData?.residenceCountry || '',
      microchipID: petData?.microchipID || '',
      hobbies: petData?.hobbies || '',
      specialNeeds: petData?.specialNeeds || '',
    });
  }, [petData?.id]);

  if (!petData) return (
    <div className="flex items-center justify-center py-8 font-serif italic text-stone-400">
       No pet passport found. Please add a companion.
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      if (petData.id) {
        const petRef = doc(db, 'pets', petData.id);
        await updateDoc(petRef, { ...editedData });
        setPetData(editedData);
        setIsEditing(false);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pets/${petData.id}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const original = reader.result as string;
      compressDataUrl(original, 512, 0.8)
        .then((compressed) => setEditedData({ ...editedData, photoURL: compressed }))
        .catch(() => setEditedData({ ...editedData, photoURL: original }));
    };
    reader.readAsDataURL(file);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age + ' years';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-stone-300 font-black uppercase tracking-[0.2em]">Health & Vaccination Registry</span>
            {(() => {
              const tier = getTier(ownerMemberPlan, ownerIsAdmin);
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
          <h2 className="text-4xl md:text-4xl font-black tracking-tighter">Wellness Hub</h2>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           {isEditing ? (
             <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 md:flex-none bg-white px-6 py-3 rounded-full border border-stone-100 font-bold text-sm text-stone-400 hover:text-charcoal transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 md:flex-none bg-charcoal text-white px-8 py-3 rounded-full font-bold text-sm shadow-soft hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save 
                </button>
             </div>
           ) : (
             <button 
              onClick={() => {
                setEditedData({
                   ...petData,
                   currentWeight: petData.currentWeight || { value: '', date: '' },
                   vaccinations: petData.vaccinations || [],
                   travelHistory: petData.travelHistory || [],
                 });
                 setIsEditing(true);
               }}
               className="w-full md:w-auto bg-white px-8 py-3 rounded-full border border-stone-100 font-bold text-sm shadow-soft hover:shadow-xl transition-all flex items-center justify-center gap-2"
             >
                <Edit2 size={16} /> Edit Passport
             </button>
           )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-8 px-4">
        <div className="lg:col-span-1 space-y-8 flex flex-col items-center lg:items-start">
          <motion.div 
            layout
            className="bg-white p-2 rounded-3xl shadow-2xl border border-stone-100 relative w-full max-w-[280px]"
          >
             <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 relative group">
                <img 
                  src={isEditing ? editedData.photoURL : petData.photoURL || `https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800`} 
                  alt={petData.name} 
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-700",
                    !isEditing && "group-hover:scale-110"
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white gap-2 transition-all hover:bg-black/50"
                  >
                    <Camera size={40} />
                    <span className="text-xs font-black uppercase tracking-widest">Update Photo</span>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </button>
                )}

                <div className="absolute bottom-10 left-10 text-white">
                   <h3 className="text-3xl md:text-4xl font-black tracking-tighter">{petData.name}</h3>
                   <p className="text-[10px] uppercase font-black tracking-widest opacity-80">{petData.breed}</p>
                </div>
             </div>
          </motion.div>
          
          <div className="w-full p-8 bg-muted rounded-2xl border border-stone-50 space-y-4">
             <div className="flex items-center gap-3 text-charcoal mb-4">
                <ShieldCheck size={20} />
                <h4 className="font-black uppercase text-[10px] tracking-widest">Identification</h4>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-stone-300">Microchip ID</label>
                   {isEditing ? (
                      <input 
                        value={editedData.microchipID}
                        onChange={(e) => setEditedData({...editedData, microchipID: e.target.value})}
                        className="w-full bg-white/50 p-2 rounded-lg text-xs font-bold outline-none"
                      />
                   ) : (
                      <p className="text-sm font-black tracking-tight break-all">{petData.microchipID || 'Not Registered'}</p>
                   )}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-stone-300">Born In</label>
                      {isEditing ? (
                        <input value={editedData.countryOfBirth} onChange={(e) => setEditedData({...editedData, countryOfBirth: e.target.value})} className="w-full bg-white/50 p-2 rounded-lg text-[10px] font-bold outline-none"/>
                      ) : (
                        <p className="text-[11px] font-bold">{petData.countryOfBirth || '—'}</p>
                      )}
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-stone-300">Residence</label>
                      {isEditing ? (
                        <input value={editedData.residenceCountry} onChange={(e) => setEditedData({...editedData, residenceCountry: e.target.value})} className="w-full bg-white/50 p-2 rounded-lg text-[10px] font-bold outline-none"/>
                      ) : (
                        <p className="text-[11px] font-bold">{petData.residenceCountry || '—'}</p>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
           <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-stone-50 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-8">
                 <DetailItem 
                    icon={<PawPrint />} 
                    label="Breed" 
                    value={isEditing ? editedData.breed : petData.breed} 
                    isEditing={isEditing}
                    onChange={(v) => setEditedData({...editedData, breed: v})}
                 />
                 <div className="space-y-3">
                    <div className="flex items-center gap-2 text-stone-300">
                      <Calendar size={16} />
                      <label className="text-[10px] font-black uppercase tracking-widest">Born On / Age</label>
                    </div>
                    {isEditing ? (
                      <input 
                        type="date"
                        value={editedData.birthDate} 
                        onChange={(e) => setEditedData({...editedData, birthDate: e.target.value})}
                        className="w-full bg-muted border-none rounded-xl p-3 text-sm font-bold"
                      />
                    ) : (
                      <p className="text-2xl font-black tracking-tighter text-charcoal">
                        {petData.birthDate || 'N/A'} <span className="text-sm text-stone-300 font-bold ml-2">({calculateAge(petData.birthDate)})</span>
                      </p>
                    )}
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-2 text-stone-300">
                      <Weight size={16} />
                      <label className="text-[10px] font-black uppercase tracking-widest">Weight & Date</label>
                    </div>
                    {isEditing ? (
                      <div className="flex gap-2 items-center">
                        <input
                          value={editedData.currentWeight?.value || ''}
                          onChange={(e) => setEditedData({...editedData, currentWeight: {...(editedData.currentWeight || {value: '', date: ''}), value: e.target.value}})}
                          className="flex-1 bg-muted border-none rounded-xl p-3 text-sm font-bold"
                        />
                        <div className="flex items-center gap-1 bg-stone-50 rounded-xl p-1">
                          {(['kg', 'lb'] as const).map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setEditedData({
                                ...editedData,
                                currentWeight: { ...(editedData.currentWeight || { value: '', date: '' }), unit: u },
                              })}
                              className={cn(
                                'px-2 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors',
                                (editedData.currentWeight?.unit ?? 'kg') === u
                                  ? 'bg-charcoal text-white shadow-sm'
                                  : 'text-stone-400 hover:text-charcoal',
                              )}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                        <input
                          type="date"
                          value={editedData.currentWeight?.date || ''}
                          onChange={(e) => setEditedData({...editedData, currentWeight: {...(editedData.currentWeight || {value: '', date: ''}), date: e.target.value}})}
                          className="w-32 bg-muted border-none rounded-xl p-3 text-[10px] font-bold"
                        />
                      </div>
                    ) : (
                      <p className="text-2xl font-black tracking-tighter text-charcoal">
                        {petData.currentWeight?.value || 'N/A'}{' '}
                        <span className="text-[11px] text-stone-400 font-black uppercase tracking-widest ml-1">
                          {(petData.currentWeight?.unit ?? 'kg')}
                        </span>
                        <span className="text-[10px] text-stone-300 font-bold ml-2">({petData.currentWeight?.date})</span>
                      </p>
                    )}
                 </div>
                 <DetailItem 
                   icon={<ShieldCheck />} 
                   label="Vax Status" 
                   value={isEditing ? editedData.vaxStatus : petData.vaxStatus} 
                   isEditing={isEditing}
                   onChange={(v) => setEditedData({...editedData, vaxStatus: v})}
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-stone-50">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-charcoal">
                     <AlertCircle size={16} />
                     <label className="text-[10px] font-black uppercase tracking-[0.2em]">Emergency Contacts</label>
                  </div>
                  <div className="space-y-3">
                     {[
                       { role: 'Owner', name: 'Silvia Mogas', phone: '+34 600 000 000' },
                       { role: 'Primary Vet', name: 'Dr. Barkson', phone: '+34 932 000 000' }
                     ].map((contact, i) => (
                       <div key={i} className="flex justify-between items-center p-4 bg-muted rounded-2xl">
                          <div>
                            <p className="text-[8px] font-black uppercase text-stone-400">{contact.role}</p>
                            <p className="text-sm font-bold">{contact.name}</p>
                          </div>
                          <a href={`tel:${contact.phone}`} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-charcoal shadow-sm hover:scale-110 transition-transform">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          </a>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sage">
                     <Calendar size={16} />
                     <label className="text-[10px] font-black uppercase tracking-[0.2em]">Health Timeline</label>
                  </div>
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-100 pl-8">
                     {[
                       { date: 'Oct 2023', event: 'Rabies Booster', type: 'Clinical' },
                       { date: 'Aug 2023', event: 'International Wellness Check', type: 'Travel' }
                     ].map((item, i) => (
                       <div key={i} className="relative">
                          <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-sage" />
                          <div>
                            <p className="text-[8px] font-black uppercase text-stone-300">{item.date}</p>
                            <p className="text-xs font-bold">{item.event}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-stone-50">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-charcoal">
                       <div className="flex items-center gap-2">
                         <MapPin size={16} />
                         <label className="text-[10px] font-black uppercase tracking-[0.2em]">Travel Registry</label>
                       </div>
                       {isEditing && (
                         <button 
                           onClick={() => setEditedData({...editedData, travelHistory: [...(editedData.travelHistory || []), { destination: '', date: '' }]})}
                           className="text-[9px] font-black uppercase tracking-widest text-charcoal hover:underline"
                         >
                           + Add Trip
                         </button>
                       )}
                    </div>
                    <div className="space-y-3">
                       {(isEditing ? editedData.travelHistory : petData.travelHistory)?.map((entry: any, i: number) => (
                         <div key={i} className="flex justify-between items-center text-sm font-bold p-3 bg-muted rounded-xl relative group">
                            {isEditing ? (
                              <div className="flex gap-2 w-full">
                                <input 
                                  value={entry.destination} 
                                  onChange={(e) => {
                                    const newHistory = [...editedData.travelHistory];
                                    newHistory[i].destination = e.target.value;
                                    setEditedData({...editedData, travelHistory: newHistory});
                                  }}
                                  placeholder="Destination"
                                  className="flex-1 bg-transparent border-none text-xs font-bold outline-none"
                                />
                                <input 
                                  value={entry.date} 
                                  onChange={(e) => {
                                    const newHistory = [...editedData.travelHistory];
                                    newHistory[i].date = e.target.value;
                                    setEditedData({...editedData, travelHistory: newHistory});
                                  }}
                                  placeholder="Date"
                                  className="w-24 bg-transparent border-none text-[10px] font-bold outline-none"
                                />
                                <button onClick={() => setEditedData({...editedData, travelHistory: editedData.travelHistory.filter((_: any, idx: number) => idx !== i)})} className="text-stone-300 hover:text-red-400">
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span>{entry.destination}</span>
                                <span className="text-[10px] text-stone-300">{entry.date}</span>
                              </>
                            )}
                         </div>
                       ))}
                       {(!petData.travelHistory || petData.travelHistory.length === 0) && !isEditing && (
                         <p className="text-xs text-stone-300 italic">No travel recorded yet.</p>
                       )}
                    </div>
                 </div>

                 {/* Planned destinations + activities (read-only on the passport view) */}
                 {!isEditing && (!!(petData.plannedDestinations?.length) || !!(petData.activities?.length)) && (
                   <div className="space-y-3">
                     {!!(petData.plannedDestinations?.length) && (
                       <div className="space-y-2">
                         <div className="flex items-center gap-2 text-stone-300">
                           <MapPin size={14} />
                           <label className="text-[10px] font-black uppercase tracking-widest">Where to next</label>
                         </div>
                         <div className="flex flex-wrap gap-1.5">
                           {petData.plannedDestinations!.map((code: string) => (
                             <span key={code} className="px-2.5 py-1 bg-stone-50 rounded-full text-[10px] font-black uppercase tracking-widest text-charcoal border border-stone-100">
                               {code === 'ES' ? '🇪🇸 Spain' : code === 'US' ? '🇺🇸 United States' : code}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}
                     {!!(petData.activities?.length) && (
                       <div className="space-y-2">
                         <div className="flex items-center gap-2 text-stone-300">
                           <PawPrint size={14} />
                           <label className="text-[10px] font-black uppercase tracking-widest">Loves</label>
                         </div>
                         <div className="flex flex-wrap gap-1.5">
                           {petData.activities!.map((a: string) => (
                             <span key={a} className="px-2.5 py-1 bg-stone-50 rounded-full text-[10px] font-bold capitalize text-charcoal border border-stone-100">
                               {a.replace(/_/g, ' ')}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 )}

                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-charcoal">
                       <div className="flex items-center gap-2">
                         <ShieldCheck size={16} />
                         <label className="text-[10px] font-black uppercase tracking-[0.2em]">Vaccination List</label>
                       </div>
                       {isEditing && (
                         <button 
                           onClick={() => setEditedData({...editedData, vaccinations: [...(editedData.vaccinations || []), { name: '', date: '', nextDueDate: '' }]})}
                           className="text-[9px] font-black uppercase tracking-widest text-charcoal hover:underline"
                         >
                           + Add Record
                         </button>
                       )}
                    </div>
                    <div className="space-y-3">
                       {(isEditing ? editedData.vaccinations : petData.vaccinations)?.map((vax: any, i: number) => (
                         <div key={i} className="p-4 bg-muted rounded-2xl space-y-1 relative group">
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <input 
                                    value={vax.name} 
                                    onChange={(e) => {
                                      const newVax = [...editedData.vaccinations];
                                      newVax[i].name = e.target.value;
                                      setEditedData({...editedData, vaccinations: newVax});
                                    }}
                                    placeholder="Vaccine Name"
                                    className="bg-transparent border-none text-xs font-black outline-none w-full"
                                  />
                                  <button onClick={() => setEditedData({...editedData, vaccinations: editedData.vaccinations.filter((_: any, idx: number) => idx !== i)})} className="text-stone-300 hover:text-red-400">
                                    <X size={14} />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[8px] uppercase font-black text-stone-300">Date Given</label>
                                    <input type="date" value={vax.date} onChange={(e) => {
                                       const newVax = [...editedData.vaccinations];
                                       newVax[i].date = e.target.value;
                                       setEditedData({...editedData, vaccinations: newVax});
                                    }} className="bg-transparent border-none text-[10px] font-bold outline-none w-full" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] uppercase font-black text-stone-300">Next Due</label>
                                    <input type="date" value={vax.nextDueDate} onChange={(e) => {
                                       const newVax = [...editedData.vaccinations];
                                       newVax[i].nextDueDate = e.target.value;
                                       setEditedData({...editedData, vaccinations: newVax});
                                    }} className="bg-transparent border-none text-[10px] font-bold outline-none w-full" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-xs font-black">{vax.name}</span>
                                  <span className="text-[8px] text-stone-400 font-black uppercase">{vax.date}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[8px] font-black uppercase text-charcoal">
                                  <Calendar size={10} /> Next Due: {vax.nextDueDate}
                                </div>
                              </>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-stone-50">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sage">
                      <PawPrint size={16} />
                      <label className="text-[10px] font-black uppercase tracking-[0.2em]">Hobbies & Favorites</label>
                  </div>
                  {isEditing ? (
                      <textarea 
                        value={editedData.hobbies}
                        onChange={(e) => setEditedData({...editedData, hobbies: e.target.value})}
                        className="w-full bg-muted border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-sage/20 min-h-[100px]"
                      />
                  ) : (
                      <p className="text-lg font-medium text-stone-500 leading-relaxed italic">
                        "{petData.hobbies || 'Exploring new places is our favorite hobby.'}"
                      </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-stone-400">
                      <Info size={16} />
                      <label className="text-[10px] font-black uppercase tracking-[0.2em]">Special Needs</label>
                  </div>
                  {isEditing ? (
                      <textarea 
                        value={editedData.specialNeeds}
                        onChange={(e) => setEditedData({...editedData, specialNeeds: e.target.value})}
                        className="w-full bg-muted border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-stone-200 min-h-[100px]"
                      />
                  ) : (
                      <p className="text-lg font-medium text-stone-500 leading-relaxed italic">
                        "{petData.specialNeeds || 'No special requirements listed.'}"
                      </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-6">
                 {['Friendly', 'Microchipped', 'Leash-Ready', 'Global Traveler'].map(tag => (
                   <span key={tag} className="px-5 py-2.5 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-stone-400 border border-stone-50">
                      {tag}
                   </span>
                 ))}
              </div>
           </div>

           {!isEditing && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted p-8 rounded-2xl flex items-center justify-between group cursor-pointer border border-stone-50 hover:bg-stone-50 transition-colors">
                   <div className="space-y-1">
                      <h4 className="font-bold text-charcoal">Update Papers</h4>
                      <p className="text-[10px] uppercase font-black tracking-widest text-stone-300">Scan medical records</p>
                   </div>
                   <ArrowUpIcon />
                </div>
                <div className="bg-muted p-8 rounded-2xl flex items-center justify-between group cursor-pointer border border-stone-50 hover:bg-stone-50 transition-colors">
                   <div className="space-y-1">
                      <h4 className="font-bold text-charcoal">Add Companion</h4>
                      <p className="text-[10px] uppercase font-black tracking-widest text-stone-300">Travel with a new pet</p>
                   </div>
                   <ArrowUpIcon />
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

function DetailItem({ icon, label, value, isEditing, onChange }: { icon: React.ReactNode, label: string, value: string, isEditing?: boolean, onChange?: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-stone-300">
        {icon}
        <label className="text-[10px] font-black uppercase tracking-widest">{label}</label>
      </div>
      {isEditing ? (
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-muted border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-stone-200"
        />
      ) : (
        <p className="text-2xl font-black tracking-tighter text-charcoal">{value || 'N/A'}</p>
      )}
    </div>
  );
}

function ArrowUpIcon() {
  return (
    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-soft group-hover:translate-x-1 transition-transform border border-stone-50">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </div>
  );
}
