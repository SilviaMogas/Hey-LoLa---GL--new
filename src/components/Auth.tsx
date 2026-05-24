import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { handleSupabaseError, OperationType } from '../lib/dbHelpers';
import { ArrowRight, ArrowLeft, Loader2, AtSign, Check, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { track } from '../lib/analytics';
import { BrandLogo } from './BrandLogo';
import { useTranslation } from '../lib/LanguageContext';

interface AuthProps {
  onSuccess: (isNew: boolean) => void;
  onSwitch: () => void;
  onBack?: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onBack, initialMode = 'login' }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState<'Dog Owner' | 'Business'>('Dog Owner');

  // Business inquiry
  const [businessName, setBusinessName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [businessReason, setBusinessReason] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  const [referralCode, setReferralCode] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('ref') || '';
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'typing' | 'checking' | 'available' | 'taken' | 'invalid'>('typing');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    setError('');
    setInquirySent(false);
  }, [mode, username, email, password, firstName, lastName, userType, businessName, contactRole, businessLocation, businessReason]);

  // Live username availability check
  useEffect(() => {
    if (mode !== 'signup' || !username) {
      setUsernameStatus('typing');
      return;
    }
    if (username.length < 3) {
      setUsernameStatus('invalid');
      return;
    }
    const checkUsername = async () => {
      setUsernameStatus('checking');
      try {
        const { data } = await supabase.from('usernames').select('username').eq('username', username.toLowerCase()).maybeSingle();
        setUsernameStatus(data ? 'taken' : 'available');
      } catch (err) {
        console.warn('Username availability check failed', err);
        setUsernameStatus('checking');
      }
    };
    const t = setTimeout(checkUsername, 500);
    return () => clearTimeout(t);
  }, [username, mode]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/signup` },
      });
      if (oauthError) throw oauthError;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.auth.googleFailed;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (userType === 'Business') {
          if (!businessName || !contactRole || !businessLocation || !businessReason || !email) {
            setError(t.auth.errorFillAll);
            return;
          }
          const { data: leadRow } = await supabase.from('business_leads').insert({
            business_name: businessName,
            contact_role: contactRole,
            location: businessLocation,
            reason: businessReason,
            email,
            status: 'new',
            created_at: new Date().toISOString(),
          }).select('id').single();
          void fetch('/api/notify-business-lead', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ leadId: leadRow?.id }),
          }).catch(() => { /* email is best-effort */ });
          track('business_inquiry_sent');
          setInquirySent(true);
          return;
        }

        if (!firstName || !lastName || !username) {
          setError(t.auth.errorFillName);
          return;
        }
        if (usernameStatus === 'taken') {
          setError(t.auth.errorUsernameTaken);
          return;
        }
        if (usernameStatus === 'invalid') {
          setError(t.auth.errorUsernameMin);
          return;
        }
        if (usernameStatus === 'checking') {
          setError(t.auth.errorUsernameChecking);
          return;
        }
        if (password.length < 8) {
          setError(t.auth.errorPasswordMin);
          return;
        }
        if (password !== passwordConfirm) {
          setError(t.auth.errorPasswordMismatch);
          return;
        }
        if (!termsAccepted) {
          setError(t.auth.errorAcceptTerms);
          return;
        }

        const usernameKey = username.toLowerCase().trim();
        // Final pre-flight uniqueness check just before we create the Auth
        // user — catches the race window between the debounced check and
        // submit, plus failures of the live check (e.g. flaky network).
        try {
          const { data: existing } = await supabase.from('usernames').select('username').eq('username', usernameKey).maybeSingle();
          if (existing) {
            setUsernameStatus('taken');
            setError(t.auth.errorUsernameJustTaken);
            return;
          }
        } catch (err) {
          console.error('Final username availability check failed', err);
          setError(t.auth.errorUsernameVerify);
          return;
        }

        const displayName = `${firstName} ${lastName}`;
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName, avatar_url: '' },
          },
        });
        if (signUpError) throw signUpError;
        const user = signUpData.user;
        if (!user) throw new Error('Signup failed');

        const now = new Date().toISOString();
        await supabase.from('users').insert({
          id: user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          username: usernameKey,
          user_type: userType,
          onboarding_step: 0,
          onboarded: false,
          onboarding_status: 'pending',
          ...(referralCode.trim() ? { referred_by: referralCode.trim().toUpperCase() } : {}),
          created_at: now,
          updated_at: now,
        });
        await supabase.from('usernames').insert({ username: usernameKey, uid: user.id });

        void fetch('/api/notify-signup', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email,
            firstName,
            lastName,
            username: usernameKey,
            userType,
            referredBy: referralCode.trim().toUpperCase() || undefined,
            signupMethod: 'email',
          }),
        }).catch(() => { /* email is best-effort */ });
        track('signup_completed', { method: 'email', userType });
        onSuccess(true);
      } else if (mode === 'login') {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        track('login_completed', { method: 'email' });
        onSuccess(false);
      } else if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;
        setResetSent(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.auth.errorGeneric;
      setError(message);
      handleSupabaseError(err, OperationType.WRITE, 'auth');
    } finally {
      setLoading(false);
    }
  };

  // Reset state when switching modes
  const switchMode = (next: 'login' | 'signup' | 'reset') => {
    setMode(next);
    setError('');
    setPassword('');
    if (next !== 'signup') {
      setTermsAccepted(false);
    }
  };

  const headline =
    mode === 'login' ? t.auth.access :
    mode === 'reset' ? t.auth.reset :
    t.auth.createAccount;

  const sub =
    mode === 'login' ? t.auth.loginSubtitle :
    mode === 'reset' ? t.auth.resetSubtitle :
    t.auth.signupSubtitle;

  return (
    <div className="min-h-screen bg-white text-charcoal flex flex-col font-sans">
      {/* Top bar */}
      <div className="px-5 sm:px-8 py-2 sm:py-3 flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-charcoal transition-colors"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            {t.common.home}
          </button>
        ) : <div />}
        <BrandLogo size="sm" />
        <div className="w-10" />
      </div>

      <div className="flex-1 flex items-start sm:items-center justify-center px-5 sm:px-8 pb-3 pt-0">
        <div className="w-full max-w-[420px] space-y-2 animate-fade-in">
          <div className="space-y-0.5 text-center sm:text-left">
            <h1 className="text-lg sm:text-xl font-black tracking-tighter text-charcoal leading-tight">
              {headline}<span className="brand-dot" aria-hidden="true" />
            </h1>
            <p className="text-[11px] text-stone-500 leading-snug">{sub}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2" noValidate>
            {resetSent ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-50 border border-stone-100 p-6 rounded-2xl text-center space-y-4"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-charcoal border border-stone-100">
                  <Check size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-charcoal">{t.auth.checkInbox}</h3>
                  <p className="text-sm text-stone-500">{t.auth.resetSentTo} <strong className="text-charcoal">{email}</strong>.</p>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-amber-700 font-black">
                  ⚠ {t.auth.checkSpam}
                </p>
                <button
                  type="button"
                  onClick={() => { setResetSent(false); switchMode('login'); }}
                  className="w-full h-11 bg-charcoal text-white rounded-full font-black text-[10px] uppercase tracking-[0.25em] hover:bg-stone-800 transition-colors"
                >
                  {t.auth.backToSignIn}
                </button>
              </motion.div>
            ) : inquirySent ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-50 border border-stone-100 p-6 rounded-2xl text-center space-y-4"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-charcoal border border-stone-100">
                  <Check size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-charcoal">{t.auth.inquiryReceived}</h3>
                  <p className="text-sm text-stone-500">{t.auth.teamReachOut}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setInquirySent(false); switchMode('login'); }}
                  className="w-full h-11 bg-charcoal text-white rounded-full font-black text-[10px] uppercase tracking-[0.25em] hover:bg-stone-800 transition-colors"
                >
                  {t.auth.backToSignIn}
                </button>
              </motion.div>
            ) : (
              <>
                {/* User type tabs (signup only) */}
                {mode === 'signup' && (
                  <div className="flex gap-1 bg-stone-50 p-0.5 rounded-full border border-stone-100">
                    {(['Dog Owner', 'Business'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUserType(type)}
                        className={cn(
                          'flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all',
                          userType === type
                            ? 'bg-white text-charcoal shadow-sm'
                            : 'text-stone-400 hover:text-charcoal'
                        )}
                      >
                        {type === 'Dog Owner' ? t.auth.dogOwner : t.auth.business}
                      </button>
                    ))}
                  </div>
                )}

                {mode === 'signup' && userType === 'Business' && (
                  <div className="space-y-2">
                    <Field label={t.auth.businessName}>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="The Boutique Hotel"
                        className="apple-input"
                        autoComplete="organization"
                      />
                    </Field>
                    <Field label={t.auth.contactRole}>
                      <input
                        type="text"
                        value={contactRole}
                        onChange={(e) => setContactRole(e.target.value)}
                        placeholder="General Manager"
                        className="apple-input"
                      />
                    </Field>
                    <Field label={t.auth.city}>
                      <input
                        type="text"
                        value={businessLocation}
                        onChange={(e) => setBusinessLocation(e.target.value)}
                        placeholder="Barcelona"
                        className="apple-input"
                        autoComplete="address-level2"
                      />
                    </Field>
                    <Field label={t.auth.whyHeyLola}>
                      <textarea
                        value={businessReason}
                        onChange={(e) => setBusinessReason(e.target.value)}
                        placeholder={t.auth.whyHeyLolaPlaceholder}
                        className="apple-input resize-none h-16 py-2.5"
                      />
                    </Field>
                  </div>
                )}

                {mode === 'signup' && userType === 'Dog Owner' && (
                  <>
                    <Field label={t.auth.username}>
                      <div className="relative">
                        <AtSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                          placeholder="lola_travels"
                          className={cn('apple-input pl-9 pr-9', usernameStatus === 'taken' && 'border-red-200')}
                          autoComplete="username"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          {usernameStatus === 'checking' && <Loader2 size={14} className="animate-spin text-stone-400" />}
                          {usernameStatus === 'available' && <Check size={14} className="text-green-500" />}
                          {usernameStatus === 'taken' && <X size={14} className="text-red-500" />}
                        </div>
                      </div>
                    </Field>

                    <div className="grid grid-cols-2 gap-2">
                      <Field label={t.auth.firstName}>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="apple-input"
                          autoComplete="given-name"
                        />
                      </Field>
                      <Field label={t.auth.lastName}>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="apple-input"
                          autoComplete="family-name"
                        />
                      </Field>
                    </div>
                  </>
                )}

                <Field label={t.auth.email}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="apple-input"
                    autoComplete="email"
                    inputMode="email"
                  />
                </Field>

                {mode !== 'reset' && userType !== 'Business' && (
                  <Field
                    label={t.auth.password}
                    extra={
                      mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('reset')}
                          className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-charcoal transition-colors"
                        >
                          {t.auth.forgot}
                        </button>
                      )
                    }
                  >
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'signup' ? t.auth.atLeast8 : '••••••••'}
                        className="apple-input pr-10"
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-charcoal transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                )}

                {mode === 'signup' && userType !== 'Business' && (
                  <Field label={t.auth.confirmPassword}>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder={t.auth.repeatPassword}
                        className="apple-input pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-charcoal transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                )}

                {mode === 'signup' && userType !== 'Business' && password.length > 0 && (
                  <PasswordChecklist password={password} confirm={passwordConfirm} />
                )}

                {/* Referral code — shown on signup, pre-filled from ?ref= URL param */}
                {mode === 'signup' && userType === 'Dog Owner' && (
                  <Field label={t.auth.referralCode}>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder={t.auth.referralPlaceholder}
                      className="apple-input uppercase tracking-[0.15em]"
                      autoComplete="off"
                      maxLength={20}
                    />
                  </Field>
                )}

                {/* Terms checkbox — actually rendered now! */}
                {mode === 'signup' && userType === 'Dog Owner' && (
                  <label className="flex items-start gap-2.5 text-xs text-stone-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-stone-300 text-charcoal focus:ring-stone-200 shrink-0 cursor-pointer accent-charcoal"
                    />
                    <span className="leading-snug">
                      {t.auth.termsAgree} <a href="#terms" className="text-charcoal underline decoration-stone-300 underline-offset-2">{t.auth.termsLink}</a> {t.auth.andText} <a href="#privacy" className="text-charcoal underline decoration-stone-300 underline-offset-2">{t.auth.privacyLink}</a>.
                    </span>
                  </label>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-3.5 rounded-xl text-sm flex items-start gap-3" role="alert" aria-live="assertive">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-charcoal text-white rounded-full font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      {mode === 'login' && t.auth.signInButton}
                      {mode === 'reset' && t.auth.sendResetLink}
                      {mode === 'signup' && userType === 'Business' && t.auth.submitApplication}
                      {mode === 'signup' && userType === 'Dog Owner' && t.auth.createAccount}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {mode !== 'reset' && userType !== 'Business' && (
                  <>
                    <div className="relative my-0.5">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100" /></div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">{t.common.or}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full h-10 bg-white border border-stone-200 rounded-full font-bold text-sm text-charcoal flex items-center justify-center gap-2.5 hover:bg-stone-50 transition-colors disabled:opacity-40"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      {t.auth.continueGoogle}
                    </button>
                  </>
                )}
              </>
            )}
          </form>

          {/* Footer link to switch mode */}
          {!resetSent && !inquirySent && (
            <p className="text-center text-xs text-stone-500 pt-1">
              {mode === 'login' && (
                <>{t.auth.newHereCreate} <button type="button" onClick={() => switchMode('signup')} className="text-charcoal font-black hover:underline">{t.auth.createAccountLink}</button></>
              )}
              {mode === 'signup' && (
                <>{t.auth.alreadyMemberLink} <button type="button" onClick={() => switchMode('login')} className="text-charcoal font-black hover:underline">{t.auth.signInLink}</button></>
              )}
              {mode === 'reset' && (
                <>{t.auth.rememberedIt} <button type="button" onClick={() => switchMode('login')} className="text-charcoal font-black hover:underline">{t.auth.signInLink}</button></>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function Field({
  label,
  extra,
  children,
}: {
  label: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{label}</label>
        {extra}
      </div>
      {children}
    </div>
  );
}

function PasswordChecklist({ password, confirm }: { password: string; confirm: string }) {
  const { t } = useTranslation();
  const rules = [
    { ok: password.length >= 8, label: t.auth.atLeast8Rule },
    { ok: /[A-Za-z]/.test(password), label: t.auth.containsLetter },
    { ok: /\d/.test(password), label: t.auth.containsNumber },
    { ok: confirm.length > 0 && password === confirm, label: t.auth.passwordsMatch },
  ];
  return (
    <ul className="bg-stone-50/60 border border-stone-100 rounded-xl px-3 py-1.5 space-y-0.5" aria-live="polite">
      {rules.map((r) => (
        <li
          key={r.label}
          className={cn(
            'flex items-center gap-2 text-[10px] transition-colors',
            r.ok ? 'text-emerald-600' : 'text-stone-400',
          )}
        >
          {r.ok ? <Check size={10} /> : <X size={10} className="text-stone-300" />}
          <span>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}
