import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Loader2, ArrowLeft, AlertCircle, CheckCircle2, Sparkles, Gift } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';
import { PerkType } from '../types';
import { FormField, FormSelect } from './FormField';

interface ClaimListingProps {
  token: string;
  onBack?: () => void;
}

interface VenueInfo {
  name: string;
  address: string;
  city: string;
  category: string;
  businessEmail: string;
  alreadySubmitted: boolean;
  verificationStatus: string;
}

type Phase =
  | { kind: 'loading' }
  | { kind: 'form'; venue: VenueInfo }
  | { kind: 'submitting'; venue: VenueInfo }
  | { kind: 'success'; placeName: string | null; autoApproved: boolean }
  | { kind: 'error'; message: string };

interface FormState {
  businessName: string;
  address: string;
  city: string;
  category: string;
  contactEmail: string;
  contactName: string;
  contactRole: string;
  confirmsRepresenting: boolean;
  offerPerk: 'no' | 'yes';
  perkType: PerkType;
  perkDescription: string;
  perkConditions: string;
  perkStartDate: string;
  perkEndDate: string;
  perkDays: string;
}

const PERK_TYPES: PerkType[] = [
  'discount',
  'free_item',
  'priority_booking',
  'pet_friendly_experience',
  'loyalty_reward',
  'other',
];

export const ClaimListing: React.FC<ClaimListingProps> = ({ token, onBack }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [form, setForm] = useState<FormState>({
    businessName: '',
    address: '',
    city: '',
    category: '',
    contactEmail: '',
    contactName: '',
    contactRole: '',
    confirmsRepresenting: false,
    offerPerk: 'no',
    perkType: 'discount',
    perkDescription: '',
    perkConditions: '',
    perkStartDate: '',
    perkEndDate: '',
    perkDays: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/submit-claim?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!data.success) {
          setPhase({ kind: 'error', message: data.error || 'Could not load this listing.' });
          return;
        }
        const v: VenueInfo = data.venue;
        setForm(f => ({
          ...f,
          businessName: v.name,
          address: v.address,
          city: v.city,
          category: v.category,
          contactEmail: v.businessEmail,
        }));
        setPhase({ kind: 'form', venue: v });
      } catch {
        if (!cancelled) setPhase({ kind: 'error', message: 'Could not reach the verification service.' });
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const update = <K extends keyof FormState>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: v }) as FormState);
  };

  const canSubmit = !!(
    form.businessName.trim() &&
    form.contactName.trim() &&
    form.contactRole.trim() &&
    form.contactEmail.trim() &&
    form.confirmsRepresenting &&
    (form.offerPerk === 'no' || (form.offerPerk === 'yes' && form.perkDescription.trim()))
  );

  const handleSubmit = async () => {
    if (phase.kind !== 'form' || !canSubmit) return;
    setPhase({ kind: 'submitting', venue: phase.venue });
    try {
      const body: Record<string, unknown> = {
        token,
        businessName: form.businessName.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        category: form.category.trim(),
        contactEmail: form.contactEmail.trim(),
        contactName: form.contactName.trim(),
        contactRole: form.contactRole.trim(),
        confirmsRepresenting: form.confirmsRepresenting,
      };
      if (form.offerPerk === 'yes') {
        body.perk = {
          type: form.perkType,
          description: form.perkDescription.trim(),
          conditions: form.perkConditions.trim(),
          startDate: form.perkStartDate,
          endDate: form.perkEndDate,
          days: form.perkDays.trim(),
        };
      }
      const res = await fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setPhase({ kind: 'success', placeName: data.placeName || form.businessName, autoApproved: !!data.autoApproved });
      } else {
        setPhase({ kind: 'error', message: data.error || 'Submission failed.' });
      }
    } catch {
      setPhase({ kind: 'error', message: 'Could not reach the verification service.' });
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-5 py-10 bg-bone">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white max-w-2xl w-full rounded-[2.5rem] border border-stone-line shadow-soft p-8 sm:p-8 space-y-8"
      >
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 text-stone-300 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.25em]">
            <ArrowLeft size={14} /> {t.explore.backToHeyLola}
          </button>
        )}

        <header className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-bone flex items-center justify-center text-stone-400">
            <ShieldCheck size={26} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300">{t.explore.claimListingKicker}</span>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-[0.95] text-charcoal">
            {t.explore.claimListingTitle}<span className="text-brand-orange">.</span>
          </h1>
          <p className="text-base font-medium text-stone-400 italic leading-tight">{t.explore.claimListingSubtitle}</p>
        </header>

        {phase.kind === 'loading' && (
          <div className="bg-bone p-8 rounded-2xl flex items-center gap-3 text-stone-500">
            <Loader2 size={18} className="animate-spin text-charcoal" />
            <span className="text-sm italic">{t.explore.claimLoading}</span>
          </div>
        )}

        {phase.kind === 'error' && (
          <div className="bg-red-50 p-6 rounded-2xl flex items-start gap-3 text-red-500">
            <AlertCircle size={20} className="mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold tracking-tight">{t.explore.claimErrorTitle}</p>
              <p className="text-[12px] italic">{phase.message}</p>
              <p className="text-[12px] italic opacity-80">
                {t.explore.claimErrorContact} <a className="underline" href="mailto:hey@heylola.co">hey@heylola.co</a>
              </p>
            </div>
          </div>
        )}

        {phase.kind === 'success' && (
          <div className="bg-[#EBF1E9] p-6 rounded-2xl flex items-start gap-3 text-[#7A8C6E]">
            <CheckCircle2 size={20} className="mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold tracking-tight">
                {phase.autoApproved ? t.explore.claimAutoApprovedTitle : t.explore.claimReceivedTitle}
              </p>
              {phase.placeName && <p className="text-[12px] italic">{phase.placeName}</p>}
              <p className="text-[12px] italic opacity-80">
                {phase.autoApproved ? t.explore.claimAutoApprovedDesc : t.explore.claimReceivedDesc}
              </p>
            </div>
          </div>
        )}

        {(phase.kind === 'form' || phase.kind === 'submitting') && phase.venue && (
          <div className="space-y-6">
            <div className="bg-stone-50 px-4 py-3 rounded-2xl border border-stone-line text-[11px] text-stone-500 leading-relaxed">
              <p className="font-bold text-charcoal">{phase.venue.name}</p>
              <p>{[phase.venue.category, phase.venue.city].filter(Boolean).join(' · ')}</p>
              {phase.venue.address && <p className="opacity-80">{phase.venue.address}</p>}
            </div>

            {phase.venue.alreadySubmitted && (
              <div className="bg-amber-50 px-4 py-3 rounded-2xl border border-amber-200 text-[11px] text-amber-800 italic">
                {t.explore.claimAlreadySubmitted}
              </div>
            )}

            <SectionHeader icon={<ShieldCheck size={14} />} label={t.explore.claimSection1Header} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t.explore.claimBusinessName} value={form.businessName} onChange={update('businessName')} required />
              <FormField label={t.explore.claimContactPerson} value={form.contactName} onChange={update('contactName')} required />
              <FormField label={t.explore.claimContactRole} value={form.contactRole} onChange={update('contactRole')} required />
              <FormField label={t.explore.claimBusinessEmail} value={form.contactEmail} onChange={update('contactEmail')} type="email" required />
              <FormField label={t.explore.claimAddress} value={form.address} onChange={update('address')} />
              <FormField label={t.explore.claimCity} value={form.city} onChange={update('city')} />
              <FormField label={t.explore.claimCategory} value={form.category} onChange={update('category')} />
            </div>

            <SectionHeader icon={<Gift size={14} />} label={t.explore.claimPerkSectionHeader} />
            <p className="text-[12px] text-stone-500 italic leading-snug -mt-3">{t.explore.claimPerkIntro}</p>
            <div className="flex gap-3">
              {(['no', 'yes'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, offerPerk: v }))}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                    form.offerPerk === v ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-stone-400 border-stone-line hover:border-stone-300'
                  }`}
                >
                  {v === 'yes' ? t.explore.claimPerkYes : t.explore.claimPerkNo}
                </button>
              ))}
            </div>

            {form.offerPerk === 'yes' && (
              <div className="space-y-4">
                <FormSelect label={t.explore.perkType} value={form.perkType} onChange={update('perkType')}>
                  {PERK_TYPES.map(p => (
                    <option key={p} value={p}>{t.explore[`perkType_${p}` as keyof typeof t.explore] as string}</option>
                  ))}
                </FormSelect>
                <FormField label={t.explore.perkDescription} value={form.perkDescription} onChange={update('perkDescription')} required multiline />
                <FormField label={t.explore.perkConditions} value={form.perkConditions} onChange={update('perkConditions')} multiline />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label={t.explore.perkStartDate} value={form.perkStartDate} onChange={update('perkStartDate')} type="date" />
                  <FormField label={t.explore.perkEndDate} value={form.perkEndDate} onChange={update('perkEndDate')} type="date" />
                </div>
                <FormField label={t.explore.perkAvailableDays} value={form.perkDays} onChange={update('perkDays')} placeholder={t.explore.perkAvailableDaysPlaceholder} />
                <p className="text-[10px] text-stone-400 italic flex items-start gap-2"><Sparkles size={10} className="mt-0.5" /> {t.explore.perkPendingNotice}</p>
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.confirmsRepresenting}
                onChange={(e) => setForm(f => ({ ...f, confirmsRepresenting: e.target.checked }))}
                className="mt-0.5 w-4 h-4 accent-charcoal cursor-pointer shrink-0"
              />
              <span className="text-[12px] text-charcoal leading-snug">{t.explore.claimRepresentingAgreement}</span>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || phase.kind === 'submitting'}
              className="w-full bg-charcoal text-white h-13 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.25em] hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {phase.kind === 'submitting' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {t.explore.claimSubmitListing}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-stone-400 pt-2">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-[0.25em]">{label}</span>
    </div>
  );
}

