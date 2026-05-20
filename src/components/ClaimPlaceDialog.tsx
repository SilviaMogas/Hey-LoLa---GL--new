import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Send, ShieldCheck } from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Place } from '../types';
import { track } from '../lib/analytics';
import { useTranslation } from '../lib/LanguageContext';
import { FormField } from './FormField';

interface ClaimPlaceDialogProps {
  place: Place;
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

interface FormState {
  businessName: string;
  contactPerson: string;
  businessEmail: string;
  phone: string;
  website: string;
  message: string;
}

const EMPTY: FormState = {
  businessName: '',
  contactPerson: '',
  businessEmail: '',
  phone: '',
  website: '',
  message: '',
};

export function ClaimPlaceDialog({ place, open, onClose, onSubmitted }: ClaimPlaceDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const canSubmit = !!(form.businessName.trim() && form.contactPerson.trim() && form.businessEmail.trim() && agreed);

  const handleSubmit = async () => {
    setError(null);
    if (!auth.currentUser) {
      setError(t.explore.signInToClaim);
      return;
    }
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const ref = collection(db, 'claim_requests');
      const docRef = doc(ref);
      await setDoc(docRef, {
        userId: auth.currentUser.uid,
        placeId: place.id,
        placeName: place.name,
        businessName: form.businessName.trim(),
        contactPerson: form.contactPerson.trim(),
        businessEmail: form.businessEmail.trim(),
        phone: form.phone.trim(),
        website: form.website.trim(),
        message: form.message.trim(),
        status: 'Pending review',
        createdAt: new Date().toISOString(),
      });
      track('place_claimed', { placeId: place.id, placeName: place.name, city: place.city });
      // Fire-and-forget: confirmation email to the claimant with the
      // 1-week SLA + internal alert to hey@heylola.co. Endpoint re-reads
      // the claim doc via Admin SDK so the client can't spoof recipients.
      void fetch('/api/notify-claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ claimId: docRef.id }),
      }).catch(() => { /* email is best-effort, never block the claim flow */ });
      setForm(EMPTY);
      onSubmitted();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'claim_requests');
      setError(t.explore.claimError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-charcoal/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            onClick={e => e.stopPropagation()}
            className="bg-white w-full max-w-xl rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl border border-stone-line max-h-[90vh] overflow-y-auto"
          >
            <div className="p-7 sm:p-9 space-y-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-bone flex items-center justify-center text-stone-400 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight text-charcoal">{t.explore.claimDialogTitle}</h3>
                    <p className="text-[11px] text-stone-400 italic leading-tight">{t.explore.claimDialogDesc}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="text-stone-300 hover:text-charcoal w-9 h-9 rounded-full hover:bg-stone-50 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 bg-stone-50 px-4 py-3 rounded-2xl border border-stone-line">
                {place.name} · {place.city}
              </div>

              <div className="bg-bone p-5 rounded-2xl border border-stone-line space-y-3">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400">
                  {t.explore.claimBenefitsTitle}
                </p>
                <ul className="space-y-2 text-[12px] text-charcoal leading-snug">
                  {[t.explore.claimBenefit1, t.explore.claimBenefit2, t.explore.claimBenefit3, t.explore.claimBenefit4].map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={t.explore.claimBusinessName} value={form.businessName} onChange={update('businessName')} required />
                <FormField label={t.explore.claimContactPerson} value={form.contactPerson} onChange={update('contactPerson')} required />
                <FormField label={t.explore.claimBusinessEmail} value={form.businessEmail} onChange={update('businessEmail')} type="email" required />
                <FormField label={t.explore.claimPhone} value={form.phone} onChange={update('phone')} type="tel" />
                <div className="sm:col-span-2">
                  <FormField label={t.explore.claimWebsite} value={form.website} onChange={update('website')} type="url" />
                </div>
                <div className="sm:col-span-2">
                  <FormField label={t.explore.claimMessage} value={form.message} onChange={update('message')} multiline />
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-line space-y-3">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400">
                  {t.explore.claimTermsTitle}
                </p>
                <p className="text-[11px] text-stone-500 leading-relaxed">{t.explore.claimTermsBody}</p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-charcoal cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] text-charcoal leading-snug">{t.explore.claimAgreeLabel}</span>
                </label>
              </div>

              {error && (
                <p className="text-[11px] text-red-500 italic">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full bg-charcoal text-white h-12 rounded-full text-[10px] font-black uppercase tracking-[0.25em] hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                {t.explore.claimSubmit}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

