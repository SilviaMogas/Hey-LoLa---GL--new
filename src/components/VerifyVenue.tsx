import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VerifyVenueProps {
  placeId: string;
  token: string;
  onBack?: () => void;
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; placeName?: string | null; alreadyVerified?: boolean }
  | { kind: 'error'; message: string };

/**
 * Public page reached from a one-click verification email
 * (https://heylola.co/verify/{placeId}/{token}). Posts to /api/verify-venue,
 * which validates the token server-side and promotes the listing.
 */
export const VerifyVenue: React.FC<VerifyVenueProps> = ({ placeId, token, onBack }) => {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!confirmed) return;
    let cancelled = false;
    (async () => {
      setPhase({ kind: 'submitting' });
      try {
        const res = await fetch('/api/verify-venue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ placeId, token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setPhase({ kind: 'success', placeName: data.placeName, alreadyVerified: !!data.alreadyVerified });
        } else {
          setPhase({ kind: 'error', message: data.error || 'Verification failed.' });
        }
      } catch (err) {
        if (cancelled) return;
        setPhase({ kind: 'error', message: 'Could not reach the verification service. Please try again.' });
      }
    })();
    return () => { cancelled = true; };
  }, [confirmed, placeId, token]);

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-5 py-10 bg-bone">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white max-w-xl w-full rounded-[2.5rem] border border-stone-line shadow-soft p-9 sm:p-8 space-y-8"
      >
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-stone-300 hover:text-charcoal transition-colors text-[10px] font-black uppercase tracking-[0.25em]"
          >
            <ArrowLeft size={14} /> Back to Hey Lola
          </button>
        )}

        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-bone flex items-center justify-center text-stone-400">
            <ShieldCheck size={26} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300">Listing verification</span>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-[0.95] text-charcoal">
            Verify your Hey&nbsp;Lola listing<span className="brand-dot" aria-hidden="true" />
          </h1>
          <p className="text-base font-medium text-stone-400 italic leading-tight">
            Confirming this listing tells pet parents we've checked who's behind it. Click the button to verify; you can update your details from the dashboard later.
          </p>
        </div>

        {phase.kind === 'idle' && (
          <button
            onClick={() => setConfirmed(true)}
            className="w-full bg-charcoal text-white h-13 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.25em] hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98]"
          >
            Confirm this listing is mine
          </button>
        )}

        {phase.kind === 'submitting' && (
          <div className="bg-bone rounded-2xl p-6 flex items-center gap-3 text-stone-500">
            <Loader2 size={18} className="animate-spin text-charcoal" />
            <span className="text-sm font-medium italic">Verifying — one moment…</span>
          </div>
        )}

        {phase.kind === 'success' && (
          <div className="bg-[#EBF1E9] rounded-2xl p-6 flex items-start gap-3 text-[#7A8C6E]">
            <CheckCircle2 size={20} className="mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold tracking-tight">
                {phase.alreadyVerified ? 'This listing is already verified.' : 'Listing verified.'}
              </p>
              {phase.placeName && (
                <p className="text-[12px] italic">{phase.placeName}</p>
              )}
              <p className="text-[11px] italic opacity-80">
                Pet parents will now see the “Verified by Hey Lola” badge on this listing.
              </p>
            </div>
          </div>
        )}

        {phase.kind === 'error' && (
          <div className="bg-red-50 rounded-2xl p-6 flex items-start gap-3 text-red-500">
            <AlertCircle size={20} className="mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold tracking-tight">Verification could not be completed.</p>
              <p className="text-[11px] italic">{phase.message}</p>
              <p className="text-[11px] italic opacity-80">
                If you believe this is a mistake, email <a className="underline" href="mailto:hey@heylola.co">hey@heylola.co</a> and we'll sort it.
              </p>
            </div>
          </div>
        )}

        <p className="text-[10px] text-stone-300 italic">
          Verification is reserved for the business owner. We log every confirmation server-side and store no more than what you submit.
        </p>
      </motion.div>
    </div>
  );
};
