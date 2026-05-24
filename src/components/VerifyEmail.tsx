import React from 'react';
import { Mail, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface VerifyEmailProps {
  email: string;
  onResend: () => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ email, onResend }) => {
  const [resending, setResending] = React.useState(false);

  const handleResend = async () => {
    setResending(true);
    await onResend();
    setTimeout(() => setResending(false), 5000); // 5 sec cooldown
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-sm"
      >
        <div className="w-20 h-20 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto text-charcoal border border-stone-100">
          <Mail size={32} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tighter italic">Check <span className="text-stone-300 not-italic">your email</span></h2>
          <p className="text-stone-400 font-bold text-sm leading-relaxed">
            We've sent a verification link to <span className="text-charcoal">{email}</span>. Click the link to secure your account and join the Hub.
          </p>
          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 text-left">
            <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">
                Check your spam folder
              </p>
              <p className="text-[11px] text-amber-700/80 leading-snug">
                Verification emails sometimes land in spam or promotions. If you don't see it in 30 seconds, check there and mark it as "not spam" so future emails arrive normally.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button 
            onClick={handleResend}
            disabled={resending}
            className="w-full h-11 bg-charcoal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 transition-all"
          >
            {resending ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            {resending ? 'Sending...' : 'Resend link'}
          </button>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full text-stone-300 font-black text-[10px] uppercase tracking-widest hover:text-charcoal transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-stone-300">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest">Waiting for verification...</span>
        </div>
      </motion.div>
    </div>
  );
};
