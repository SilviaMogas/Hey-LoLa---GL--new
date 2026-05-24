import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface VerifyEmailBannerProps {
  email: string | null;
}

export function VerifyEmailBanner({ email }: VerifyEmailBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  if (dismissed) return null;

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    try {
      await supabase.auth.resend({ type: 'signup', email });
      setResent(true);
    } catch {
      // silent — Supabase rate-limits resends
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-center justify-center gap-3 text-sm text-amber-800">
      <AlertCircle size={14} className="shrink-0" />
      <span>
        {resent
          ? 'Verification link sent — check your inbox.'
          : `Verify your email (${email ?? 'unknown'}) to unlock all features.`}
      </span>
      {!resent && (
        <button
          onClick={handleResend}
          disabled={resending}
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-amber-900 disabled:opacity-50"
        >
          <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
          Resend
        </button>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
