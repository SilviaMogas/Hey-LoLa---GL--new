import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { handleSupabaseError, OperationType } from '../lib/dbHelpers';
import { ArrowRight, ArrowLeft, Loader2, AtSign, Check, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { track } from '../lib/analytics';
import { BrandLogo } from './BrandLogo';

interface AuthProps {
  onSuccess: (isNew: boolean) => void;
  onSwitch: () => void;
  onBack?: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onBack, initialMode = 'login' }) => {
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
        const { data } = await supabase
          .from('usernames')
          .select('username')
          .eq('username', username.toLowerCase())
          .limit(1);
        setUsernameStatus(data && data.length > 0 ? 'taken' : 'available');
      } catch (err) {
        console.warn('Username availability check failed', err);
        setUsernameStatus('checking');
      }
    };
    const t = setTimeout(checkUsername, 500);
    return () => clearTimeout(t);
  }, [username, mode]);

  // Shared post-OAuth provisioning: create the user row for brand-new
  // users, then hand control back to the app.
  const provisionOAuthUser = async (userId: string, email: string | undefined, fullName: string | undefined) => {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .limit(1);
    if (!existing || existing.length === 0) {
      const baseUsername = fullName?.toLowerCase().replace(/\s+/g, '') || 'traveler';
      const finalUsername = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
      const nameParts = fullName?.split(' ') || [];
      const now = new Date().toISOString();
      await supabase.from('users').insert({
        id: userId,
        email: email || '',
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        display_name: fullName || email?.split('@')[0] || 'Traveler',
        username: finalUsername,
        user_type: 'Dog Owner',
        onboarding_step: 0,
        onboarded: false,
        onboarding_status: '"pending"',
        created_at: now,
        updated_at: now,
      });
      await supabase.from('usernames').insert({ username: finalUsername, uid: userId });
      void fetch('/api/notify-signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || undefined,
          username: finalUsername,
          userType: 'Dog Owner',
          signupMethod: 'google',
        }),
      }).catch(() => { /* email is best-effort */ });
      track('signup_completed', { method: 'google' });
      onSuccess(true);
    } else {
      track('login_completed', { method: 'google' });
      onSuccess(false);
    }
  };

  // Handle OAuth redirect callback (Supabase handles this via URL hash)
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session?.user) {
        const meta = session.user.user_metadata;
        provisionOAuthUser(
          session.user.id,
          session.user.email,
          meta?.full_name || meta?.name || session.user.email?.split('@')[0]
        );
      }
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMobileDevice = () =>
    typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/signup` },
      });
      if (oauthError) throw oauthError;
      // Supabase redirects to Google; provisioning happens on return
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
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
            setError('Please fill out all fields.');
            return;
          }
          const { data: leadRow } = await supabase.from('business_leads').insert({
            data: {
              businessName,
              contactRole,
              location: businessLocation,
              reason: businessReason,
              email,
              status: 'new',
            },
            created_at: new Date().toISOString(),
          }).select('id').single();
          if (leadRow) {
            void fetch('/api/notify-business-lead', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ leadId: leadRow.id }),
            }).catch(() => { /* email is best-effort */ });
          }
          track('business_inquiry_sent');
          setInquirySent(true);
          return;
        }

        if (!firstName || !lastName || !username) {
          setError('Please fill out your name and username.');
          return;
        }
        if (usernameStatus === 'taken') {
          setError('That username is already taken.');
          return;
        }
        if (usernameStatus === 'invalid') {
          setError('Username must be at least 3 characters.');
          return;
        }
        if (usernameStatus === 'checking') {
          setError('We are still checking that username. Please wait a moment.');
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters.');
          return;
        }
        if (password !== passwordConfirm) {
          setError('Passwords do not match.');
          return;
        }
        if (!termsAccepted) {
          setError('Please accept the terms to continue.');
          return;
        }

        const usernameKey = username.toLowerCase().trim();
        // Final pre-flight uniqueness check
        try {
          const { data: existingUsername } = await supabase
            .from('usernames')
            .select('username')
            .eq('username', usernameKey)
            .limit(1);
          if (existingUsername && existingUsername.length > 0) {
            setUsernameStatus('taken');
            setError('That username was just taken. Please pick another.');
            return;
          }
        } catch (err) {
          console.error('Final username availability check failed', err);
          setError('Could not verify the username. Please try again.');
          return;
        }

        // Create Supabase auth user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              display_name: `${firstName} ${lastName}`,
              username: usernameKey,
            },
          },
        });
        if (signUpError) throw signUpError;
        const user = signUpData.user;
        if (!user) throw new Error('Signup failed — no user returned.');

        const now = new Date().toISOString();
        await supabase.from('users').insert({
          id: user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          display_name: `${firstName} ${lastName}`,
          username: usernameKey,
          user_type: userType,
          onboarding_step: 0,
          onboarded: false,
          onboarding_status: '"pending"',
          ...(referralCode.trim() ? { referred_by: referralCode.trim().toUpperCase() } : {}),
          created_at: now,
          updated_at: now,
        });
        await supabase.from('usernames').insert({ username: usernameKey, uid: user.id });

        // Supabase automatically sends a confirmation email.
        // Best-effort branded welcome via Resend.
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
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (resetError) throw resetError;
        setResetSent(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      // Map common Supabase auth error messages
      const errorMap: Record<string, string> = {
        'User already registered': 'An account with this email already exists. Try signing in instead.',
        'Invalid login credentials': 'Incorrect email or password.',
        'Email rate limit exceeded': 'Too many attempts. Please wait a moment and try again.',
        'Password should be at least 6 characters': 'Password must be at least 8 characters.',
      };
      const mapped = Object.entries(errorMap).find(([key]) => message.includes(key));
      setError(mapped ? mapped[1] : message);
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
    mode === 'login' ? 'Welcome back' :
    mode === 'reset' ? 'Reset password' :
    'Create your account';

  const sub =
    mode === 'login' ? 'Sign in to access your dashboard, saved spots, and community.' :
    mode === 'reset' ? "Enter your email and we'll send you a reset link." :
    'Free to join. Bring your pet along for the ride.';

  return (
    <div className="min-h-screen bg-white text-charcoal flex flex-col font-sans">
      {/* Top bar */}
      <div className="px-5 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-charcoal transition-colors"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Home
          </button>
        ) : <div />}
        <BrandLogo size="sm" />
        <div className="w-10" />
      </div>

      <div className="flex-1 flex items-start sm:items-center justify-center px-5 sm:px-8 pb-4 pt-1">
        <div className="w-full max-w-[420px] space-y-3 animate-fade-in">
          <div className="space-y-0.5 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-charcoal leading-tight">
              {headline}<span className="brand-dot" aria-hidden="true" />
            </h1>
            <p className="text-[12px] text-stone-500 leading-snug">{sub}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
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
                  <h3 className="text-base font-black text-charcoal">Check your inbox</h3>
                  <p className="text-sm text-stone-500">We sent a reset link to <strong className="text-charcoal">{email}</strong>.</p>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-amber-700 font-black">
                  ⚠ Check your spam folder if you don't see it.
                </p>
                <button
                  type="button"
                  onClick={() => { setResetSent(false); switchMode('login'); }}
                  className="w-full h-12 bg-charcoal text-white rounded-full font-black text-[10px] uppercase tracking-[0.25em] hover:bg-stone-800 transition-colors"
                >
                  Back to sign in
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
                  <h3 className="text-base font-black text-charcoal">Inquiry received</h3>
                  <p className="text-sm text-stone-500">Our team will reach out shortly.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setInquirySent(false); switchMode('login'); }}
                  className="w-full h-12 bg-charcoal text-white rounded-full font-black text-[10px] uppercase tracking-[0.25em] hover:bg-stone-800 transition-colors"
                >
                  Back to sign in
                </button>
              </motion.div>
            ) : (
              <>
                {/* User type tabs (signup only) */}
                {mode === 'signup' && (
                  <div className="flex gap-1 bg-stone-50 p-1 rounded-full border border-stone-100">
                    {(['Dog Owner', 'Business'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUserType(type)}
                        className={cn(
                          'flex-1 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all',
                          userType === type
                            ? 'bg-white text-charcoal shadow-sm'
                            : 'text-stone-400 hover:text-charcoal'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}

                {mode === 'signup' && userType === 'Business' && (
                  <div className="space-y-2.5">
                    <Field label="Business name">
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="The Boutique Hotel"
                        className="apple-input"
                        autoComplete="organization"
                      />
                    </Field>
                    <Field label="Your role">
                      <input
                        type="text"
                        value={contactRole}
                        onChange={(e) => setContactRole(e.target.value)}
                        placeholder="General Manager"
                        className="apple-input"
                      />
                    </Field>
                    <Field label="City">
                      <input
                        type="text"
                        value={businessLocation}
                        onChange={(e) => setBusinessLocation(e.target.value)}
                        placeholder="Barcelona"
                        className="apple-input"
                        autoComplete="address-level2"
                      />
                    </Field>
                    <Field label="Why HeyLola?">
                      <textarea
                        value={businessReason}
                        onChange={(e) => setBusinessReason(e.target.value)}
                        placeholder="Tell us about your venue and what you're hoping for"
                        className="apple-input resize-none h-16 py-2.5"
                      />
                    </Field>
                  </div>
                )}

                {mode === 'signup' && userType === 'Dog Owner' && (
                  <>
                    <Field label="Username">
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

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First name">
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="apple-input"
                          autoComplete="given-name"
                        />
                      </Field>
                      <Field label="Last name">
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

                <Field label="Email">
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
                    label="Password"
                    extra={
                      mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('reset')}
                          className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-charcoal transition-colors"
                        >
                          Forgot?
                        </button>
                      )
                    }
                  >
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
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
                  <Field label="Confirm password">
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder="Repeat your password"
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
                  <Field label="Referral code (optional)">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. LOLA2025"
                      className="apple-input uppercase tracking-[0.15em]"
                      autoComplete="off"
                      maxLength={20}
                    />
                  </Field>
                )}

                {/* Terms checkbox — actually rendered now! */}
                {mode === 'signup' && userType === 'Dog Owner' && (
                  <label className="flex items-start gap-3 text-sm text-stone-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-stone-300 text-charcoal focus:ring-stone-200 shrink-0 cursor-pointer accent-charcoal"
                    />
                    <span className="leading-snug">
                      I agree to the <a href="#terms" className="text-charcoal underline decoration-stone-300 underline-offset-2">Terms</a> and <a href="#privacy" className="text-charcoal underline decoration-stone-300 underline-offset-2">Privacy Policy</a>.
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
                  className="w-full h-11 bg-charcoal text-white rounded-full font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      {mode === 'login' && 'Sign in'}
                      {mode === 'reset' && 'Send reset link'}
                      {mode === 'signup' && userType === 'Business' && 'Submit application'}
                      {mode === 'signup' && userType === 'Dog Owner' && 'Create account'}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {mode !== 'reset' && userType !== 'Business' && (
                  <>
                    <div className="relative my-1">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100" /></div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">or</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full h-11 bg-white border border-stone-200 rounded-full font-bold text-sm text-charcoal flex items-center justify-center gap-2.5 hover:bg-stone-50 transition-colors disabled:opacity-40"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </button>
                  </>
                )}
              </>
            )}
          </form>

          {/* Footer link to switch mode */}
          {!resetSent && !inquirySent && (
            <p className="text-center text-sm text-stone-500 pt-2">
              {mode === 'login' && (
                <>New here? <button type="button" onClick={() => switchMode('signup')} className="text-charcoal font-black hover:underline">Create account</button></>
              )}
              {mode === 'signup' && (
                <>Already a member? <button type="button" onClick={() => switchMode('login')} className="text-charcoal font-black hover:underline">Sign in</button></>
              )}
              {mode === 'reset' && (
                <>Remembered it? <button type="button" onClick={() => switchMode('login')} className="text-charcoal font-black hover:underline">Sign in</button></>
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
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{label}</label>
        {extra}
      </div>
      {children}
    </div>
  );
}

function PasswordChecklist({ password, confirm }: { password: string; confirm: string }) {
  const rules = [
    { ok: password.length >= 8, label: 'At least 8 characters' },
    { ok: /[A-Za-z]/.test(password), label: 'Contains a letter' },
    { ok: /\d/.test(password), label: 'Contains a number' },
    { ok: confirm.length > 0 && password === confirm, label: 'Passwords match' },
  ];
  return (
    <ul className="bg-stone-50/60 border border-stone-100 rounded-xl px-3 py-2.5 space-y-1.5" aria-live="polite">
      {rules.map((r) => (
        <li
          key={r.label}
          className={cn(
            'flex items-center gap-2 text-[11px] transition-colors',
            r.ok ? 'text-emerald-600' : 'text-stone-400',
          )}
        >
          {r.ok ? <Check size={12} /> : <X size={12} className="text-stone-300" />}
          <span>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}
