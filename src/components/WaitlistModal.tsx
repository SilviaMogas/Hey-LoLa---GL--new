import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type WaitlistType = 'member' | 'partner';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: WaitlistType;
  initialPlan?: string;
}

export function WaitlistModal({ isOpen, onClose, type, initialPlan }: WaitlistModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Member fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [dogName, setDogName] = useState('');
  const [dogType, setDogType] = useState('');
  const [plan, setPlan] = useState(initialPlan || 'local');
  const [perks, setPerks] = useState('');
  const [consent, setConsent] = useState(false);

  // Partner fields
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [contactName, setContactName] = useState('');
  const [policy, setPolicy] = useState('');
  const [suggestedPerk, setSuggestedPerk] = useState('');
  const [claimProfile, setClaimProfile] = useState(false);

  // Reset form when opened with different type
  React.useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'member' && !consent) {
      setError('Please agree to receive updates.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (type === 'member') {
        const waitlistRef = collection(db, 'waitlist');
        await addDoc(waitlistRef, {
          type: 'member',
          firstName,
          lastName,
          email,
          city,
          dogName,
          dogType,
          plan,
          perks,
          consent,
          createdAt: serverTimestamp(),
        });
      } else {
        const partnersRef = collection(db, 'partner_applications');
        await addDoc(partnersRef, {
          businessName,
          category,
          city,
          address,
          website,
          instagram,
          contactName,
          email,
          policy,
          suggestedPerk,
          claimProfile,
          status: 'pending',
          createdAt: serverTimestamp(),
        });
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8 sm:p-10 font-boutique">
            {success ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-[#EBF1E9] text-[#7A8C6E] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-3xl font-serif italic tracking-tight text-charcoal">
                  You're on the list<span className="text-brand-orange">.</span>
                </h3>
                <p className="text-stone-500 font-light leading-relaxed">
                  {type === 'member'
                    ? "We'll notify you as soon as early access opens in your city."
                    : "Your profile has been submitted. The Hey Lola team will review your details before your profile becomes Verified."}
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 luxury-button bg-stone-100 text-charcoal px-8 h-12 uppercase tracking-[0.25em] text-[10px] font-black w-full hover:bg-stone-200"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">
                    {type === 'member' ? 'Early Access' : 'Partner Network'}
                  </span>
                  <h2 className="text-3xl font-serif italic tracking-tight text-charcoal mt-2">
                    Join the waitlist<span className="text-brand-orange">.</span>
                  </h2>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {type === 'member' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">First Name *</label>
                          <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Last Name</label>
                          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Email *</label>
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">City *</label>
                          <input required type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Miami" className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Plan *</label>
                          <select required value={plan} onChange={e => setPlan(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-4 text-sm focus:outline-none focus:border-stone-400 text-stone-600">
                            <option value="local">Local</option>
                            <option value="plus">Travel / Plus</option>
                            <option value="black">Black</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Dog's Name</label>
                          <input type="text" value={dogName} onChange={e => setDogName(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Breed / Type</label>
                          <input type="text" value={dogType} onChange={e => setDogType(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Preferred Perks (Optional)</label>
                        <textarea value={perks} onChange={e => setPerks(e.target.value)} placeholder="What perks would you use most?" className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-5 text-sm min-h-[80px] focus:outline-none focus:border-stone-400 resize-none"></textarea>
                      </div>
                      <div className="flex items-start gap-3 mt-4">
                        <input required type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 flex-shrink-0" id="waitlist-consent" />
                        <label htmlFor="waitlist-consent" className="text-xs text-stone-500 leading-tight">
                          I agree to join the Hey Lola waitlist and receive emails about the launch and member updates.
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Partner Form */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Business Name *</label>
                        <input required type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Category *</label>
                          <input required type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Café, Hotel" className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">City *</label>
                          <input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Address</label>
                        <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Contact Name *</label>
                          <input required type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Email *</label>
                          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Website</label>
                          <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Instagram</label>
                          <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Dog Policy *</label>
                        <input required type="text" value={policy} onChange={e => setPolicy(e.target.value)} placeholder="e.g. Allowed inside and on terrace" className="w-full h-12 bg-stone-50 border border-stone-200 rounded-2xl px-5 text-sm focus:outline-none focus:border-stone-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-3">Suggested Perk (Optional)</label>
                        <textarea value={suggestedPerk} onChange={e => setSuggestedPerk(e.target.value)} placeholder="e.g. Free puppuccino, 10% off" className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-5 text-sm min-h-[80px] focus:outline-none focus:border-stone-400 resize-none"></textarea>
                      </div>
                      <div className="flex items-start gap-3 mt-4">
                        <input type="checkbox" checked={claimProfile} onChange={e => setClaimProfile(e.target.checked)} className="mt-1 flex-shrink-0" id="waitlist-claim" />
                        <label htmlFor="waitlist-claim" className="text-xs text-stone-500 leading-tight">
                          My business is already listed on Hey Lola and I want to claim it.
                        </label>
                      </div>
                    </>
                  )}

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full luxury-button bg-charcoal text-white h-14 mt-4 uppercase tracking-[0.25em] text-[11px] font-black hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Submit
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
